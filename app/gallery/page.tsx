'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/ui/sidebar';
import { Search, Play, Filter, CheckSquare, Trash2, Eye, MoreVertical } from 'lucide-react';
import { BarsLoader } from '@/components/ui/bars-loader';
import { MediaViewerModal } from '@/components/dashboard/media-viewer-modal';
import { getInstaSaveId, fetchAllFilesRecursively, getFileDownloadUrl, deleteDriveFile } from '@/lib/drive';
import { formatVideoName, CACHE_KEYS, loadFromCache, saveToCache } from '@/lib/format-utils';
import { ThumbnailImage } from '@/components/ui/thumbnail-image';
import { SearchBar } from '@/components/ui/search-bar';
import { HeaderButton } from '@/components/ui/header-button';
import { SortDropdown } from '@/components/ui/sort-dropdown';
import { AppHeader } from '@/components/layout/app-header';

// --- Utility Functions ---

function formatFileSize(bytes?: string | number): string {
    if (!bytes) return '';
    const numBytes = Number(bytes);
    if (numBytes < 1024) return numBytes + ' B';
    if (numBytes < 1024 * 1024) return (numBytes / 1024).toFixed(1) + ' KB';
    if (numBytes < 1024 * 1024 * 1024) return (numBytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (numBytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
}

function formatDuration(millis?: string | number): string {
    if (!millis) return '';
    const totalSeconds = Math.floor(Number(millis) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// --- Components ---

const SkeletonCard = () => (
    <div className="w-full aspect-[9/16] rounded-xl bg-[#1a1a1a] border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 animate-pulse bg-white/5" />
        <div className="absolute bottom-3 left-3 right-3 h-3 bg-white/10 rounded animate-pulse" />
    </div>
);

type SortOption = 'newest' | 'oldest' | 'largest' | 'smallest';

export default function GalleryPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);
    const [sortOption, setSortOption] = useState<SortOption>('newest');
    const [searchTerm, setSearchTerm] = useState('');

    // Selection & Delete State
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, fileId: string } | null>(null);

    // Media Viewer State
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{
        url: string;
        name: string;
        type: 'video' | 'image';
        size?: string;
        driveLink?: string;
    } | null>(null);

    useEffect(() => {
        // Close context menu on global click
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    useEffect(() => {
        if (session?.accessToken) {
            loadGalleryData();
        } else if (session?.error === "RefreshAccessTokenError") {
            setAuthError(true);
        }
    }, [session]);

    const loadGalleryData = async () => {
        // 1. Try Cache First for immediate render
        const cached = loadFromCache(CACHE_KEYS.GALLERY_ALL);
        if (cached) {
            setFiles(cached);
            setLoading(false); // Show cached content immediately
        }

        try {
            const accessToken = session!.accessToken!;

            // 1. Get Root Folder ID
            const rootId = await getInstaSaveId(accessToken);

            // 2. Fetch All Files Recursively
            const allFiles = await fetchAllFilesRecursively(accessToken, rootId);

            // 3. Update State & Cache
            setFiles(allFiles);
            saveToCache(CACHE_KEYS.GALLERY_ALL, allFiles);
        } catch (error: any) {
            console.error("Failed to load gallery", error);
            if (error?.message?.includes('401') || error?.message?.includes('invalid authentication')) {
                setAuthError(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRightClick = (e: React.MouseEvent, fileId: string) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.pageX, y: e.pageY, fileId });
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const deleteSelected = async () => {
        if (!session?.accessToken) return;

        let idsToDelete = Array.from(selectedIds);

        // If context menu action with no selection, delete the target file
        if (idsToDelete.length === 0 && contextMenu?.fileId) {
            idsToDelete = [contextMenu.fileId];
        }

        if (idsToDelete.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${idsToDelete.length} item(s)?`)) return;

        setDeleting(true);
        try {
            await Promise.all(idsToDelete.map(id => deleteDriveFile(session.accessToken!, id)));

            // Remove from local state and update cache
            const newFiles = files.filter(f => !idsToDelete.includes(f.id));
            setFiles(newFiles);
            saveToCache(CACHE_KEYS.GALLERY_ALL, newFiles); // Update cache on mutation

            setSelectedIds(new Set());
            setIsSelectionMode(false);
        } catch (error) {
            console.error("Failed to delete files", error);
            alert("Failed to delete some files");
        } finally {
            setDeleting(false);
            setContextMenu(null);
        }
    };

    const handleCardClick = async (file: any) => {
        if (!session?.accessToken) return;

        const isVideo = file.mimeType.startsWith('video/');
        const videoUrl = `/api/drive/stream?fileId=${file.id}`;
        const downloadUrl = await getFileDownloadUrl(file.id, session.accessToken);

        setSelectedFile({
            url: isVideo ? videoUrl : downloadUrl,
            name: formatVideoName(file.name, file.createdTime), // Use formatted name
            type: isVideo ? 'video' : 'image',
            size: formatFileSize(file.size),
            driveLink: file.webViewLink
        });
        setViewerOpen(true);
    };

    // Filter and Sort Logic
    const filteredFiles = files
        .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            switch (sortOption) {
                case 'newest':
                    return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime();
                case 'oldest':
                    return new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime();
                case 'largest':
                    return (Number(b.size) || 0) - (Number(a.size) || 0);
                case 'smallest':
                    return (Number(a.size) || 0) - (Number(b.size) || 0);
                default:
                    return 0;
            }
        });

    if (authError) {
        return (
            <div className="flex min-h-screen bg-[#030303] text-white font-sans">
                <Sidebar />
                <div className="flex-1 ml-[280px] flex flex-col items-center justify-center p-8 text-center">
                    <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-red-500/20 max-w-md">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-red-500" size={32} />
                        </div>
                        <h2 className="text-xl font-bold mb-2">Session Expired</h2>
                        <p className="text-gray-400 mb-6">Please sign in again to access your gallery.</p>
                        <button
                            onClick={() => window.location.href = '/api/auth/signin'}
                            className="px-6 py-3 bg-[#a855f7] hover:bg-[#9333ea] rounded-xl font-semibold transition-colors w-full"
                        >
                            Sign In Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8 relative min-h-screen">
                {/* Header */}
                {/* Header */}
                <AppHeader
                    title="Gallery"
                    subtitle={loading && files.length === 0 ? "Loading..." : `All ${files.length} items from your vault`}
                    searchPlaceholder="Search files..."
                    onSearch={setSearchTerm}
                >
                    {/* Selection Logic */}
                    {isSelectionMode ? (
                        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1 rounded-xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 relative z-20">
                            <span className="text-sm font-medium text-white/80 px-3 whitespace-nowrap">
                                {selectedIds.size} selected
                            </span>
                            {selectedIds.size > 0 && (
                                <HeaderButton
                                    variant="danger"
                                    onClick={deleteSelected}
                                    loading={deleting}
                                    icon={Trash2}
                                    className="h-8 px-3 rounded-lg text-xs"
                                >
                                    Delete
                                </HeaderButton>
                            )}
                            <HeaderButton
                                variant="ghost"
                                onClick={() => {
                                    setIsSelectionMode(false);
                                    setSelectedIds(new Set());
                                }}
                                className="h-8 px-3 rounded-lg text-xs"
                            >
                                Cancel
                            </HeaderButton>
                        </div>
                    ) : (
                        <HeaderButton
                            icon={CheckSquare}
                            onClick={() => setIsSelectionMode(true)}
                            className="z-20"
                        >
                            Select
                        </HeaderButton>
                    )}

                    {/* Sort Dropdown */}
                    <SortDropdown
                        value={sortOption}
                        onChange={(val) => setSortOption(val as SortOption)}
                        options={[
                            { label: "Newest First", value: "newest" },
                            { label: "Oldest First", value: "oldest" },
                            { label: "Size (High to Low)", value: "largest" },
                            { label: "Size (Low to High)", value: "smallest" }
                        ]}
                    />
                </AppHeader>

                {/* Grid - OPTIMIZED: Smaller tiles, Vertical Aspect Ratio, Higher Density */}
                {loading && files.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-70">
                        <img src="/assets/anya-empty.gif" alt="Empty" className="w-48 h-48 object-cover rounded-xl mb-6 opacity-80" />
                        <h3 className="text-xl font-bold text-gray-300">Gallery is empty 🥜</h3>
                        <p className="text-gray-500 mt-2">No photos or videos found in your vault.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20 relative" onClick={() => setContextMenu(null)}>
                        {filteredFiles.map((file, index) => {
                            const isVideo = file.mimeType.startsWith('video/');
                            const isSelected = selectedIds.has(file.id);
                            const displayName = formatVideoName(file.name, file.createdTime); // Use polished name
                            const meta = isVideo
                                ? formatDuration(file.videoMediaMetadata?.durationMillis)
                                : (file.imageMediaMetadata ? `${file.imageMediaMetadata.width}×${file.imageMediaMetadata.height}` : '');

                            // Thumbnail Logic
                            // Use existing isVideo from above

                            return (
                                <div
                                    key={file.id}
                                    onClick={(e) => {
                                        if (isSelectionMode) {
                                            toggleSelection(file.id);
                                        } else {
                                            handleCardClick(file);
                                        }
                                    }}
                                    onContextMenu={(e) => handleRightClick(e, file.id)}
                                    // REFACTORED: Aspect Ratio 9/16 for vertical reels, improved borders
                                    className={`
                                        group relative w-full aspect-[9/16] bg-[#1e1e32]/50 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300
                                        ${isSelected
                                            ? 'border-[#a855f7] ring-2 ring-[#a855f7]/50 translate-y-[-4px] shadow-[0_8px_24px_rgba(168,85,247,0.25)]'
                                            : 'border-[#a855f7]/20 hover:-translate-y-1 hover:shadow-lg hover:border-[#a855f7]/50'
                                        }
                                    `}
                                >
                                    {/* Thumbnail using Smart Component */}
                                    <div className="w-full h-full relative overflow-hidden bg-[#0f0f16]">
                                        <ThumbnailImage
                                            fileId={file.id}
                                            videoUrl={isVideo ? `/api/drive/stream?fileId=${file.id}` : undefined}
                                            fallbackSrc={file.thumbnailLink?.replace('=s220', '=s600')}
                                            alt={displayName}
                                            isVideo={isVideo}
                                            className={`w-full h-full transition-transform duration-500 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
                                        />

                                        {/* Play Overlay */}
                                        {isVideo && !isSelectionMode && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="w-10 h-10 rounded-full bg-[#a855f7]/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                                                    <Play fill="white" className="text-white ml-0.5" size={16} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Overlay Gradient (Stronger at bottom for text visibility) */}
                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity ${isSelected ? 'opacity-80' : 'opacity-60 group-hover:opacity-80'}`} />

                                        {/* Checkbox Overlay */}
                                        {(isSelectionMode || isSelected) && (
                                            <div className="absolute top-2 right-2 z-10 animate-in fade-in duration-200">
                                                <div className={`
                                                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                                                    ${isSelected ? 'bg-[#a855f7] border-[#a855f7]' : 'bg-black/40 border-white/30 hover:border-white'}
                                                `}>
                                                    {isSelected && <div className="w-2 h-1 border-b-2 border-l-2 border-white rotate-[-45deg] mb-0.5" />}
                                                </div>
                                            </div>
                                        )}

                                        {/* Folder Badge (Top Left) - Smaller */}
                                        <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded-md">
                                            <p className="text-[9px] font-medium text-white/90 uppercase tracking-wide">
                                                {file.folderName || 'General'}
                                            </p>
                                        </div>

                                        {/* Play Icon */}
                                        {isVideo && !isSelectionMode && (
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <div className="w-10 h-10 rounded-full bg-[#a855f7]/90 backdrop-blur-md flex items-center justify-center shadow-lg transform scale-50 group-hover:scale-100 transition-transform">
                                                    <Play fill="white" className="text-white ml-0.5" size={16} />
                                                </div>
                                            </div>
                                        )}

                                        {/* Info Bottom - Compressed layout */}
                                        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-[13px] font-semibold text-white leading-snug mb-1 line-clamp-2" title={displayName}>
                                                {displayName}
                                            </h3>
                                            <div className="flex items-center justify-between text-[10px] text-white/70 font-medium">
                                                <span>{formatFileSize(file.size)}</span>
                                                {meta && (
                                                    <span className="bg-white/10 px-1.5 py-0.5 rounded">
                                                        {isVideo ? meta : 'IMG'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="fixed z-50 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-1.5">
                            <button
                                onClick={() => {
                                    handleCardClick(files.find(f => f.id === contextMenu.fileId));
                                    setContextMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/5 rounded-lg transition-colors text-left"
                            >
                                <Eye size={16} className="text-gray-400" />
                                Preview
                            </button>
                            <button
                                onClick={() => {
                                    setIsSelectionMode(true);
                                    toggleSelection(contextMenu.fileId);
                                    setContextMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/5 rounded-lg transition-colors text-left"
                            >
                                <CheckSquare size={16} className="text-gray-400" />
                                Select
                            </button>
                            <div className="h-px bg-white/5 my-1" />
                            <button
                                onClick={deleteSelected}
                                disabled={deleting}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                            >
                                {deleting ? <div className="scale-50"><BarsLoader /></div> : <Trash2 size={16} />}
                                Delete
                            </button>
                        </div>
                    </div>
                )}

                {/* Viewer Modal */}
                {selectedFile && (
                    <MediaViewerModal
                        isOpen={viewerOpen}
                        onClose={() => setViewerOpen(false)}
                        fileUrl={selectedFile.url}
                        fileName={selectedFile.name}
                        fileType={selectedFile.type}
                        fileSize={selectedFile.size}
                        driveLink={selectedFile.driveLink}
                    />
                )}
            </div>
        </div>
    );
}
