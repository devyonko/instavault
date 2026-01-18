'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/ui/sidebar';
import ProfileMenu from '@/components/ui/profile-menu';
import { Plus, Loader2, FolderPlus } from 'lucide-react';
import { FolderItem } from '@/components/folders/folder-item';
import { SearchBar } from '@/components/ui/search-bar';
import { HeaderButton } from '@/components/ui/header-button';
import { CACHE_KEYS, loadFromCache, saveToCache } from '@/lib/format-utils';

// Gradients to cycle through for new folders
const GRADIENTS = [
    "linear-gradient(135deg, #e73827, #f85032)", // Red
    "linear-gradient(to right, #f7b733, #fc4a1a)", // Orange
    "linear-gradient(135deg, #00c6ff, #0072ff)", // Blue
    "linear-gradient(to right, #414345, #232526)", // Black/Gray
    "linear-gradient(135deg, #8e2de2, #4a00e0)", // Purple
    "linear-gradient(135deg, #f80759, #bc4e9c)", // Pink
];

interface DriveFolder {
    id: string;
    name: string;
    fileCount: number;
}

export default function FoldersPage() {
    const { data: session } = useSession();
    const [folders, setFolders] = useState<DriveFolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!session?.accessToken) {
            if (session === null) setLoading(false);
            return;
        }

        // 1. Load from cache immediately
        const cached = loadFromCache(CACHE_KEYS.FOLDERS_LIST);
        if (cached) {
            setFolders(cached);
            setLoading(false);
        }

        // 2. Fetch fresh data
        loadFolders();
    }, [session]);

    const loadFolders = async () => {
        setLoading(true);
        try {
            // RELAXED GUARD: Only require accessToken, as Backend API doesn't strictly need email for this fetch
            // session.user.email check was blocking valid authenticated users whose session object structure might differ slightly or delay email population
            if (!session?.accessToken) return;

            console.log("Fetching folders via Server API...");
            const res = await fetch('/api/drive/folders');
            if (!res.ok) {
                const text = await res.text();
                // console.error("[UI] API Error:", text);
                throw new Error(text);
            }

            const data = await res.json();
            const { parentId, folders: subfolders } = data;

            if (!parentId) {
                console.error("[UI] No parentId returned from API");
                setLoading(false);
                return;
            }

            // Ensure subfolders is an array
            const validFolders = Array.isArray(subfolders) ? subfolders : [];

            // Map to valid state
            const mappedFolders = validFolders.map((folder: any) => ({
                id: folder.id,
                name: folder.name,
                fileCount: folder.fileCount || 0 // Use the count from the API (enriched with getVideoCountInFolder)
            }));

            // ROBUST GUARD: Use functional update to access current state (prev)
            // This prevents stale closure issues where 'folders' might be seen as [] from initial render
            setFolders(prev => {
                // 1. If we got new data, use it
                if (mappedFolders.length > 0) {
                    saveToCache(CACHE_KEYS.FOLDERS_LIST, mappedFolders);
                    return mappedFolders;
                }

                // 2. If valid data exists, KEEP IT (don't overwrite with empty)
                if (prev.length > 0) {
                    console.warn("[UI] API returned 0 folders. Protecting existing state.");
                    return prev;
                }

                // 3. Otherwise, it's truly empty
                return [];
            });

        } catch (error) {
            console.error("Failed to load folders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        setIsSubmitting(true);
        try {
            // Re-use existing API endpoint for creation if logic matches, OR use drive.ts helper directly?
            // Existing code used /api/drive/folders. Let's stick to using the library directly if we handle everything client side now,
            // OR keep using the API route if the user prefers. 
            // The user prompt specifically asked to "Make dynamic from Google Drive API" using client code snippets (useEffect etc).
            // So we should probably use a direct helper if we have one, or just the fetching logic. 
            // But we don't have a `createFolder` in drive.ts EXPORTED yet? 
            // Checking drive.ts... yes `createDriveFolder` is exported.

            // Let's use the API route for creation if it works, or switch to client lib to be consistent.
            // Since we're moving to client-side fetching for READs, using client-side for WRITEs is consistent.
            // But I'd need to import `createDriveFolder`.
            // Let's use the existing API call for now to minimize breakage unless asked to refactor Writes too.
            // Actually, mixing might be confusing. 
            // Let's stick to the previous 'fetch' pattern for creation provided in previous code, 
            // but refresh using our new loadFolders.

            const res = await fetch('/api/drive/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newFolderName }),
            });

            if (res.ok) {
                await loadFolders();
                setNewFolderName("");
                setCreating(false);
            }
        } catch (error) {
            console.error("Failed to create folder", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteFolder = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this folder?")) return;

        try {
            const res = await fetch(`/api/drive/folders?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setFolders(prev => prev.filter(f => f.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete folder", error);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#030303] text-white font-sans">

            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-[280px] p-6 lg:p-10 relative">

                <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 pt-16 lg:pt-0">
                    <div>
                        <h1 className="text-[32px] font-bold text-white leading-tight">Collections</h1>
                        <p className="text-white/60 text-[15px] mt-1">
                            {loading ? "Syncing..." : `${folders.length} folders`}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 relative z-0" suppressHydrationWarning={true}>
                        <SearchBar
                            variant="compact"
                            placeholder="Search folders..."
                            className="w-[180px] lg:w-[240px]"
                        // Note: onSearch logic would need to be implemented in FoldersPage if filtering is desired
                        />
                        <HeaderButton
                            variant="primary"
                            onClick={() => setCreating(true)}
                            icon={Plus}
                            className="h-10"
                        >
                            New Folder
                        </HeaderButton>
                        <div className="relative z-50">
                            <ProfileMenu />
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500 gap-4">
                        <img src="/assets/anya-loading.gif" alt="Loading" className="w-24 h-24 lg:w-32 lg:h-32 object-cover rounded-xl opacity-80" />
                        <p className="animate-pulse">Waku Waku! Loading folders...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-24">

                        {/* New Folder Creation Card */}
                        {creating && (
                            <div className="w-full aspect-[6/5] flex flex-col items-center justify-center p-4 rounded-2xl bg-[#0f0f0f] border border-dashed border-[#6366f1]/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.3)] animate-in fade-in zoom-in-95 duration-300 relative">
                                <form onSubmit={handleCreateFolder} className="w-full flex flex-col items-center gap-3">
                                    <div className="p-3 bg-[#6366f1]/10 rounded-full">
                                        <FolderPlus size={24} className="text-[#6366f1]" />
                                    </div>
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Folder Name"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-center text-sm text-white focus:outline-none focus:border-[#6366f1] transition-colors"
                                    />
                                    <div className="flex gap-2 w-full mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setCreating(false)}
                                            className="flex-1 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 py-1 bg-[#6366f1] text-white rounded-md text-xs font-medium hover:bg-[#4f46e5] disabled:opacity-50"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {folders.length === 0 && !creating ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-50 text-center px-4">
                                <img src="/assets/anya-empty.gif" alt="Empty" className="w-40 h-40 lg:w-48 lg:h-48 object-cover rounded-xl mb-6 opacity-70" />
                                <h3 className="text-xl font-bold text-gray-400">No folders yet! 🥜</h3>
                                <p className="text-gray-500 text-sm mt-2">Create your first folder to organize saved posts.</p>
                                <button
                                    onClick={() => setCreating(true)}
                                    className="mt-6 text-[#6366f1] hover:underline font-medium"
                                >
                                    + Create first folder
                                </button>
                            </div>
                        ) : (
                            folders.map((folder, index) => (
                                <div key={folder.id} className="w-full">
                                    <FolderItem
                                        folder={folder}
                                        index={index}
                                        gradient={GRADIENTS[index % GRADIENTS.length]}
                                        onDelete={handleDeleteFolder}
                                    />
                                </div>
                            ))
                        )}
                    </div>


                )}
            </div>
        </div >
    );
}
