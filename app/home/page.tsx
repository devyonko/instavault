'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import NextImage from 'next/image';

import Sidebar from '@/components/ui/sidebar';
import ProfileMenu from '@/components/ui/profile-menu';
import { SearchBar } from '@/components/ui/search-bar';
import DashboardHero from '@/components/dashboard/dashboard-hero';
import StatsCard from '@/components/dashboard/stats-card';
import RecentItemsCard from '@/components/dashboard/recent-items-card';
import { SaveToDriveModal } from '@/components/dashboard/save-to-drive-modal';
import {
    getInstaSaveId,
    listSubfolders,
    fetchAllFilesRecursively,
    calculateStats,
    fetchStorageQuota,
    generateRecentItems
} from '@/lib/drive';
import { formatDistanceToNow } from 'date-fns';
import { useActivity } from '@/components/providers/activity-provider';
import { NotificationBell } from '@/components/ui/notification-bell';
import { useDownload } from '@/components/providers/download-provider';

export default function HomePage() {
    const { data: session } = useSession();
    const { activities } = useActivity();
    const { startDownload } = useDownload();

    const [inputValue, setInputValue] = useState('');
    const [anyaState, setAnyaState] = useState<'idle' | 'loading' | 'success' | 'error' | 'empty'>('idle');

    // Dashboard Data State
    const [instaSaveFolderId, setInstaSaveFolderId] = useState<string | null>(null);
    const [stats, setStats] = useState({
        reels: 0,
        posts: 0,
        total: 0,
        week: 0,
        month: 0,
        folders: 0,
        storageUsed: 0,
        storageTotal: 15 * 1024 * 1024 * 1024, // Default 15GB
    });
    const [recentItems, setRecentItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSaveModal, setShowSaveModal] = useState(false);

    // Reusable Data Fetch Function
    const refreshDashboardData = useCallback(async () => {
        if (!instaSaveFolderId || !session?.accessToken) return;

        try {
            const accessToken = session.accessToken;

            const folders = await listSubfolders(accessToken, instaSaveFolderId);
            const files = await fetchAllFilesRecursively(accessToken, instaSaveFolderId);
            const calculatedStats = calculateStats(files);
            const quota = await fetchStorageQuota(accessToken);

            setStats({
                reels: calculatedStats.reelsSaved,
                posts: calculatedStats.postsSaved,
                total: calculatedStats.totalSaved,
                week: calculatedStats.thisWeek,
                month: calculatedStats.thisMonth,
                folders: folders.length,
                storageUsed: quota.storageUsed,
                storageTotal: quota.storageTotal
            });

            setRecentItems(generateRecentItems(files));
        } catch (e) {
            console.error("Failed to refresh dashboard data", e);
        }
    }, [instaSaveFolderId, session]);

    // Initial Data Fetch
    useEffect(() => {
        async function initializeDashboard() {
            setLoading(true);
            setError(null);

            try {
                if (!session?.accessToken || !session?.user?.email) {
                    if (session === null) {
                        setError('Please log in using Google.');
                        setLoading(false);
                    }
                    return;
                }

                const accessToken = session.accessToken;
                const userEmail = session.user.email;

                // 1. Find or create InstaSave parent folder
                // USE USER-SPECIFIC KEY to avoid conflicts on same browser
                const storageKey = `instaSaveFolderId_${userEmail}`;
                let folderId = localStorage.getItem(storageKey);

                if (!folderId) {
                    // If not in local storage for THIS user, fetch it
                    folderId = await getInstaSaveId(accessToken);
                    if (folderId) {
                        localStorage.setItem(storageKey, folderId);
                        localStorage.setItem('instaSaveFolderId', folderId);
                    }
                }

                if (!folderId) {
                    throw new Error('Could not access InstaSave folder');
                }

                setInstaSaveFolderId(folderId);

            } catch (err: any) {
                console.error('Dashboard initialization error:', err);
                setError(err.message || 'Failed to load dashboard data');
                setLoading(false);
            }
        }

        initializeDashboard();
    }, [session]);

    // Trigger data fetch when folder ID is set, and set up interval
    useEffect(() => {
        if (instaSaveFolderId && session?.accessToken) {
            refreshDashboardData().then(() => setLoading(false));

            const interval = setInterval(refreshDashboardData, 60000); // 60s auto-refresh
            return () => clearInterval(interval);
        }
    }, [instaSaveFolderId, session, refreshDashboardData]);

    const handleSave = () => {
        if (!inputValue.trim()) {
            // Using DownloadProvider for error handling logic if integrated, but here simple validation
            // We can just rely on the Modal flow
            return;
        }
        setShowSaveModal(true);
    };

    const handleDownloadConfirm = async (folderId: string) => {
        setShowSaveModal(false);
        setAnyaState('loading');

        try {
            await startDownload(inputValue, folderId);
            setInputValue('');
            // Success state handling is now largely in the DownloadProvider/ProgressUI, 
            // but we can update local Anya state for immediate feedback
            setAnyaState('success');
            setTimeout(() => setAnyaState('idle'), 3000);

            // Refresh data shortly after to catch the new file
            // (Note: Real-time update would depend on the download finishing, 
            // which handles its own success state. We might want to trigger refresh off an Activity change?)
            setTimeout(refreshDashboardData, 5000); // Simple delay for now

        } catch (error) {
            console.error("Download start error:", error);
            setAnyaState('error');
        }
    };

    // Map activities to RecentItems for display
    const activityItems = activities.slice(0, 4).map(act => ({
        id: act.id,
        title: act.title,
        category: act.type === 'download' ? 'Processing' : act.type === 'success' ? 'Completed' : 'Error',
        time: formatDistanceToNow(act.timestamp, { addSuffix: true }),
        emoji: act.type === 'download' ? '⬇️' : act.type === 'success' ? '✅' : '⚠️',
        thumbnail: null
    }));

    // Use activities if available, otherwise fall back to drive files
    // The prompt requested "Show real events... instead of remaining empty".
    // So mixing them: Show Activities FIRST. If empty, show recent files.
    // Or maybe show BOTH? The UI is a single card.
    // Let's prefer Activity Items as they are "Recent Activity".
    const displayItems = activityItems.length > 0 ? activityItems : recentItems;

    return (
        <div className='flex min-h-screen bg-transparent text-white font-sans overflow-hidden'>
            <Sidebar />

            <div className='flex-1 ml-[280px] relative h-screen overflow-y-auto bg-transparent'>
                <SaveToDriveModal
                    isOpen={showSaveModal}
                    onClose={() => setShowSaveModal(false)}
                    onConfirm={handleDownloadConfirm}
                    initialUrl={inputValue}
                />

                <div className="max-w-[1400px] mx-auto p-8 relative min-h-full">
                    <header className="flex justify-between items-center mb-10 pt-4">
                        <h1 className='text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent'>
                            Dashboard
                        </h1>

                        <div className="flex items-center gap-4">
                            <SearchBar className="transform scale-75 origin-right" />
                            <NotificationBell />
                            <div className="relative z-50">
                                <ProfileMenu />
                            </div>
                        </div>
                    </header>

                    {/* Dashboard Content */}
                    <DashboardHero
                        anyaState={anyaState}
                        inputValue={inputValue}
                        onUrlChange={setInputValue}
                        onSave={handleSave}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] gap-6 lg:gap-8 mt-12">
                        {/* Stats Column */}
                        <div className="space-y-6 lg:space-y-8 h-full">
                            <StatsCard stats={stats} />
                        </div>

                        {/* Recent Items / Activity Column */}
                        <div className="h-full">
                            <RecentItemsCard items={displayItems} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
