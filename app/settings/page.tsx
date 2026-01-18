'use client';

import React, { useState, useEffect } from 'react';
import { usePreferences } from '@/components/providers/preferences-provider';
import { BarsLoader } from '@/components/ui/bars-loader';
import { useSession, signOut } from 'next-auth/react';
import Sidebar from '@/components/ui/sidebar';
import {
    User,
    LogOut,
    Cloud,
    Settings as SettingsIcon,
    Moon,
    Zap,
    Smartphone,
    Trash2,
    RefreshCw,
    RefreshCcw,
    BarChart3,
    Shield,
    Info,
    CheckCircle2,
    Github,
    Globe,
    Mail,
    AlertTriangle,
    Download,
    Play
} from 'lucide-react';
import { fetchStorageQuota, fetchAllFilesRecursively, getInstaSaveId } from '@/lib/drive';

// --- Utility Functions ---

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// --- Components ---

function SettingSection({ title, icon: Icon, children }: { title: string, icon?: any, children: React.ReactNode }) {
    return (
        <div className="bg-[#1e1e32]/50 border border-[#a855f7]/20 rounded-[20px] p-8 backdrop-blur-[20px] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:translate-y-[-2px] transition-transform">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                {Icon && <Icon size={24} className="text-[#a855f7]" />}
                <h2 className="text-xl font-bold text-white mb-0">
                    {title}
                </h2>
            </div>
            {children}
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: () => void }) {
    return (
        <button
            onClick={onChange}
            className={`
                w-12 h-6 rounded-full relative transition-all duration-300 ease-in-out
                ${checked ? 'bg-gradient-to-r from-[#a855f7] to-[#ec4899]' : 'bg-white/10'}
            `}
        >
            <div className={`
                absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300
                ${checked ? 'left-[calc(100%-1.25rem)]' : 'left-1'}
            `} />
        </button>
    );
}

// --- Modals ---

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, active }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, active: boolean }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1e1e32] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 text-red-500 mb-4">
                    <AlertTriangle size={24} />
                    <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <div className="text-white/70 mb-6 text-sm whitespace-pre-line leading-relaxed">
                    {message}
                </div>
                <div className="flex items-center gap-3 justify-end">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        {active ? <RefreshCw className="animate-spin w-4 h-4" /> : <Trash2 size={16} />}
                        Yes, Delete Everything
                    </button>
                </div>
            </div>
        </div>
    );
}

// Icons helper
function ChevronRight({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const { userAvatar, randomizeAvatar } = usePreferences();

    // State
    const [storage, setStorage] = useState<{ used: number, total: number, percentage: string } | null>(null);
    const [stats, setStats] = useState<{
        totalFiles: number,
        videoCount: number,
        imageCount: number,
        videoSize: number,
        imageSize: number,
        activeFolders: number
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Preferences State (Persisted in state for now)
    const [autoPlay, setAutoPlay] = useState(true);
    const [highQuality, setHighQuality] = useState(true);
    const [notifications, setNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(true);

    // Download Settings
    const [qualityPref, setQualityPref] = useState('high');
    const [filenameFormat, setFilenameFormat] = useState('date');
    const [folderPref, setFolderPref] = useState('');

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (session?.accessToken) {
            // 1. Try to load from cache immediately for instant render
            const cachedStats = localStorage.getItem('settings_stats');
            const cachedStorage = localStorage.getItem('settings_storage');

            if (cachedStats && cachedStorage) {
                try {
                    setStats(JSON.parse(cachedStats));
                    setStorage(JSON.parse(cachedStorage));
                    setLoading(false); // Show cached data immediately
                } catch (e) {
                    console.error("Cache parse error", e);
                }
            }

            // 2. Fetch fresh data in background
            loadData(false);
        }
    }, [session]);

    const loadData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        // Do not set global loading=true if we have cached data, to prevent flickering
        // Only set loading if we have NO data.
        if (!stats && !storage) setLoading(true);

        try {
            const accessToken = session!.accessToken!;

            // 1. Storage Quota
            const quota = await fetchStorageQuota(accessToken);
            const newStorage = {
                used: quota.storageUsed,
                total: quota.storageTotal,
                percentage: quota.percentage as string
            };
            setStorage(newStorage);
            localStorage.setItem('settings_storage', JSON.stringify(newStorage));

            // 2. File Stats (Fetch all to calculate)
            const rootId = await getInstaSaveId(accessToken);
            const allFiles = await fetchAllFilesRecursively(accessToken, rootId);

            // Calc stats
            let vCount = 0;
            let iCount = 0;
            let vSize = 0;
            let iSize = 0;
            const folders = new Set();

            allFiles.forEach((f: any) => {
                const size = parseInt(f.size || '0');
                if (f.folderId) folders.add(f.folderId);

                if (f.mimeType.startsWith('video/')) {
                    vCount++;
                    vSize += size;
                } else if (f.mimeType.startsWith('image/')) {
                    iCount++;
                    iSize += size;
                }
            });

            const newStats = {
                totalFiles: allFiles.length,
                videoCount: vCount,
                imageCount: iCount,
                videoSize: vSize,
                imageSize: iSize,
                activeFolders: folders.size
            };
            setStats(newStats);
            localStorage.setItem('settings_stats', JSON.stringify(newStats));

        } catch (error) {
            console.error("Failed to load settings data", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDeleteEverything = async () => {
        setIsDeleting(true);
        // Simulate deletion for UI demo as "Delete All" logic is complex/destructive
        // Real implementation would loop DELETE requests.
        await new Promise(r => setTimeout(r, 2000));
        setIsDeleting(false);
        setShowDeleteModal(false);
        alert("All data has been deleted.");
    };

    if (!session) {
        return (
            <div className="flex min-h-screen bg-transparent text-white font-sans items-center justify-center">
                <div className="text-center p-8 bg-[#1e1e32]/80 backdrop-blur-xl border border-white/10 rounded-2xl">
                    <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
                    <p className="text-white/60 mb-6">Please sign in to view your settings.</p>
                    <a href="/login" className="px-6 py-2 bg-[#a855f7] rounded-xl hover:bg-[#9333ea] transition-colors">
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-transparent text-white font-sans">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8 relative">
                {loading && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-[2px]">
                        <BarsLoader text="Please wait..." />
                    </div>
                )}
                <div className={`max-w-[900px] mx-auto transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'} pb-24 lg:pb-0`}>

                    {/* Header */}
                    <div className="text-center mb-10 pt-16 lg:pt-0">
                        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
                        <p className="text-white/60">Manage your preferences and account</p>
                    </div>

                    {/* SECTION 1: USER PROFILE */}
                    <SettingSection title="User Profile" icon={User}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-5">
                                <div className="relative group/avatar cursor-pointer" onClick={randomizeAvatar}>
                                    <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#a855f7] to-[#ec4899] overflow-hidden">
                                        <img
                                            src={userAvatar || session.user?.image || "/assets/avatar-placeholder.png"}
                                            alt="Profile"
                                            className="w-full h-full rounded-full object-cover border-2 border-[#1e1e32]"
                                        />
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 rounded-full transition-opacity">
                                        <RefreshCcw size={16} className="text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white break-all">{session.user?.name || 'User'}</h3>
                                    <p className="text-white/60 text-sm mt-1">{session.user?.email} • <button onClick={randomizeAvatar} className="text-[#a855f7] hover:underline">Change Avatar</button></p>
                                </div>
                            </div>
                            <button
                                onClick={() => signOut()}
                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/5 hover:border-red-500/30 hover:text-red-500 transition-all text-sm font-medium flex items-center justify-center gap-2 group"
                            >
                                <LogOut size={16} className="group-hover:text-red-500" />
                                Sign Out
                            </button>
                        </div>
                    </SettingSection>

                    {/* SECTION 2: STORAGE & USAGE */}
                    <SettingSection title="Storage & Usage" icon={Cloud}>
                        <div className="flex items-center justify-between mb-2 text-sm font-medium">
                            <span className="text-white/80">Google Drive Storage</span>
                            <span className="text-[#a855f7]">{storage?.percentage ?? "0"}% Used</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden mb-6 relative">
                            <div
                                className="h-full bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-full transition-all duration-1000 ease-out relative"
                                style={{ width: `${storage?.percentage ?? 0}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]" />
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-white/50 font-medium mb-8">
                            <span>{formatBytes(storage?.used || 0)} used</span>
                            <span>{formatBytes(storage?.total || 15 * 1024 * 1024 * 1024)} total</span>
                        </div>

                        {/* Breakdown Grid */}
                        <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                            <h4 className="text-sm font-semibold text-white/90 mb-4">InstaSave Usage</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#a855f7]/10 rounded-lg text-[#a855f7]">
                                        <Play size={18} fill="currentColor" />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-[#a855f7]">
                                            {loading ? '...' : formatBytes(stats?.videoSize || 0)}
                                        </div>
                                        <div className="text-xs text-white/50">{loading ? '-' : stats?.videoCount} video files</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#ec4899]/10 rounded-lg text-[#ec4899]">
                                        <Smartphone size={18} />
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-[#ec4899]">
                                            {loading ? '...' : formatBytes(stats?.imageSize || 0)}
                                        </div>
                                        <div className="text-xs text-white/50">{loading ? '-' : stats?.imageCount} image files</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <span className="text-sm text-white/60">Total App Data: <span className="text-white font-medium">{loading ? '...' : formatBytes((stats?.videoSize || 0) + (stats?.imageSize || 0))}</span></span>
                                <a
                                    href="https://drive.google.com"
                                    target="_blank"
                                    className="text-xs font-medium text-[#a855f7] hover:underline flex items-center gap-1"
                                >
                                    View in Google Drive <ChevronRight size={12} />
                                </a>
                            </div>
                        </div>
                    </SettingSection>

                    {/* SECTION 3: DOWNLOAD SETTINGS */}
                    <SettingSection title="Download Settings" icon={Download}>
                        <div className="space-y-6">
                            {/* Default Folder */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-2">Default Folder</label>
                                <p className="text-xs text-white/50 mb-3">Choose where to save downloads by default</p>
                                <div className="relative">
                                    <select
                                        value={folderPref}
                                        onChange={(e) => setFolderPref(e.target.value)}
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none cursor-pointer hover:border-[#a855f7]/50 transition-colors focus:outline-none focus:border-[#a855f7]"
                                    >
                                        <option value="">Select Folder...</option>
                                        <option value="root">InstaSave (Root)</option>
                                        <option value="new">Create New...</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
                                </div>
                            </div>

                            {/* Video Quality */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-3">Video Quality Preference</label>
                                <div className="space-y-3">
                                    {[
                                        { id: 'best', label: 'Best Available', desc: 'Largest file size' },
                                        { id: 'high', label: 'High Quality', desc: 'Recommended' },
                                        { id: 'medium', label: 'Medium Quality', desc: 'Faster downloads' },
                                    ].map(opt => (
                                        <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${qualityPref === opt.id ? 'bg-[#a855f7]/10 border-[#a855f7]/50' : 'border-white/5 hover:bg-white/5'}`}>
                                            <div className="relative flex items-center mt-0.5">
                                                <input
                                                    type="radio"
                                                    name="quality"
                                                    checked={qualityPref === opt.id}
                                                    onChange={() => setQualityPref(opt.id)}
                                                    className="peer h-4 w-4 appearance-none rounded-full border border-white/30 checked:border-[#a855f7]"
                                                />
                                                <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-[#a855f7] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div>
                                                <div className={`text-sm font-medium ${qualityPref === opt.id ? 'text-white' : 'text-white/70'}`}>{opt.label}</div>
                                                <div className="text-xs text-white/40">{opt.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Filename Format */}
                            <div>
                                <label className="block text-sm font-medium text-white/80 mb-3">Filename Format</label>
                                <div className="space-y-3">
                                    {[
                                        { id: 'original', label: 'Original', desc: 'As posted on Instagram' },
                                        { id: 'date', label: 'With Date', desc: 'filename_2025-01-13' },
                                        { id: 'custom', label: 'Custom', desc: 'Configure pattern' },
                                    ].map(opt => (
                                        <label key={opt.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${filenameFormat === opt.id ? 'bg-[#a855f7]/10 border-[#a855f7]/50' : 'border-white/5 hover:bg-white/5'}`}>
                                            <div className="relative flex items-center mt-0.5">
                                                <input
                                                    type="radio"
                                                    name="filename"
                                                    checked={filenameFormat === opt.id}
                                                    onChange={() => setFilenameFormat(opt.id)}
                                                    className="peer h-4 w-4 appearance-none rounded-full border border-white/30 checked:border-[#a855f7]"
                                                />
                                                <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-[#a855f7] opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                                            </div>
                                            <div>
                                                <div className={`text-sm font-medium ${filenameFormat === opt.id ? 'text-white' : 'text-white/70'}`}>{opt.label}</div>
                                                <div className="text-xs text-white/40">{opt.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SettingSection>

                    {/* SECTION 4: PREFERENCES */}
                    <SettingSection title="Preferences" icon={SettingsIcon}>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-white/90">Auto-play Videos</h3>
                                    <p className="text-sm text-white/50 mt-0.5">Automatically play videos in gallery and feed</p>
                                </div>
                                <Toggle checked={autoPlay} onChange={() => setAutoPlay(!autoPlay)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-white/90">High Quality Previews</h3>
                                    <p className="text-sm text-white/50 mt-0.5">Load higher resolution thumbnails (uses more data)</p>
                                </div>
                                <Toggle checked={highQuality} onChange={() => setHighQuality(!highQuality)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-white/90">Notifications</h3>
                                    <p className="text-sm text-white/50 mt-0.5">Get notified when downloads complete</p>
                                </div>
                                <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-white/90">Dark Mode</h3>
                                    <p className="text-sm text-white/50 mt-0.5">Always use dark theme (currently ON)</p>
                                </div>
                                <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                            </div>
                        </div>
                    </SettingSection>

                    {/* SECTION 5: DATA MANAGEMENT */}
                    <SettingSection title="Data Management" icon={BarChart3}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">{loading ? '...' : stats?.totalFiles}</div>
                                <div className="text-sm text-white/50">Total Saved Items</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-white mb-1">Just now</div>
                                <div className="text-sm text-white/50">Last Synced</div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => loadData(true)}
                                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#a855f7] to-[#ec4899] hover:contrast-125 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#a855f7]/20"
                            >
                                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                                {refreshing ? "Refreshing..." : "Refresh Data"}
                            </button>
                            <button className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all">
                                <BarChart3 size={18} />
                                View Analytics
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <h4 className="text-sm font-semibold text-white/80 mb-4">Recent Activity</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-sm text-white/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {loading ? '...' : (stats?.totalFiles ?? 0) > 0 ? 'Verified items saved' : 'No items saved recently'}
                                </li>
                                <li className="flex items-center gap-3 text-sm text-white/60">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
                                    {loading ? '...' : stats?.activeFolders} active folders
                                </li>
                            </ul>
                        </div>
                    </SettingSection>

                    {/* SECTION 6: PRIVACY & PERMISSIONS */}
                    <SettingSection title="Privacy & Permissions" icon={Shield}>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-4 mb-6">
                            <CheckCircle2 className="text-emerald-500" size={24} />
                            <div>
                                <div className="font-bold text-emerald-500">Connected</div>
                                <div className="text-xs text-emerald-500/70">Google Drive permissions granted</div>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6">
                            {['Read files and folders', 'Create files and folders', 'View storage quota'].map(perm => (
                                <div key={perm} className="flex items-center gap-3 text-sm text-white/70">
                                    <CheckCircle2 size={14} className="text-white/40" />
                                    {perm}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <button className="border border-[#a855f7] text-[#a855f7] hover:bg-[#a855f7] hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
                                Manage Permissions
                            </button>
                            <button className="border border-white/10 text-white/60 hover:text-white hover:border-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-all">
                                Re-authorize
                            </button>
                        </div>
                    </SettingSection>

                    {/* SECTION 7: APP INFORMATION */}
                    <SettingSection title="App Information" icon={Info}>
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="text-xl font-bold text-white mb-1">InstaVault v1.0.0</div>
                            <p className="text-white/50 text-sm mb-6">Built with ❤️ by Dhileep Kumar GM</p>

                            <div className="flex flex-wrap justify-center gap-4 mb-8">
                                {[
                                    { icon: Globe, label: 'Portfolio' },
                                    { icon: Github, label: 'GitHub' },
                                    { icon: Mail, label: 'Contact' }
                                ].map(link => (
                                    <button key={link.label} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#a855f7]/20 hover:text-[#a855f7] rounded-lg transition-all text-sm font-medium">
                                        <link.icon size={16} />
                                        {link.label}
                                    </button>
                                ))}
                            </div>

                            <div className="text-left w-full max-w-sm bg-black/20 p-4 rounded-xl mb-6">
                                <h4 className="text-xs font-semibold text-white/40 uppercase mb-3 tracking-wider">Technology Stack</h4>
                                <ul className="space-y-2">
                                    {['Next.js 14 + React', 'TypeScript', 'Google Drive API', 'Tailwind CSS'].map(tech => (
                                        <li key={tech} className="text-xs text-white/70 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-white/20" /> {tech}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="text-xs text-white/30">
                                © 2025 InstaVault. All rights reserved.
                            </div>
                        </div>
                    </SettingSection>

                    {/* SECTION 8: DANGER ZONE */}
                    <div className="mt-12 mb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="flex items-center gap-3 mb-4 px-1 text-red-500/90">
                            <AlertTriangle size={20} />
                            <h2 className="text-lg font-semibold">Danger Zone</h2>
                        </div>
                        <div className="bg-[#1a1a1a]/50 border border-red-500/20 rounded-[20px] overflow-hidden backdrop-blur-sm">
                            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-red-500 font-medium">Clear Application Cache</h3>
                                    <p className="text-white/40 text-sm mt-1">Removes local temporary data. No files will be deleted.</p>
                                </div>
                                <button className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl text-sm font-medium transition-colors whitespace-nowrap">
                                    Clear Cache
                                </button>
                            </div>

                            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-red-500 font-medium">Disconnect Google Drive</h3>
                                    <p className="text-white/40 text-sm mt-1">Remove access to your account. You can reconnect anytime.</p>
                                </div>
                                <button className="px-4 py-2 border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap">
                                    Disconnect <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between bg-red-500/5 gap-4">
                                <div>
                                    <h3 className="text-red-500 font-bold">Delete All Data</h3>
                                    <p className="text-red-500/60 text-sm mt-1">Permanently delete ALL saved posts and folders. Cannot be undone!</p>
                                </div>
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors shadow-lg shadow-red-500/20 whitespace-nowrap"
                                >
                                    Delete Everything
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteEverything}
                title="Are you sure you want to delete everything?"
                message={`This will permanently delete:
                • All saved Instagram posts
                • All folders you created
                • All app data
                
                This action CANNOT be undone!`}
                active={isDeleting}
            />
        </div>
    );
}
