'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/ui/sidebar';
import { ArrowLeft, Play, Grip, Search, CheckSquare, Trash2, Eye, Filter } from 'lucide-react';
import { BarsLoader } from '@/components/ui/bars-loader';
import { MediaViewerModal } from '@/components/dashboard/media-viewer-modal';
import { getFolderMetadata, listFilesWithMetadata, getFileDownloadUrl, deleteDriveFile } from '@/lib/drive';
import { formatVideoName, CACHE_KEYS, loadFromCache, saveToCache } from '@/lib/format-utils';
import { ThumbnailImage } from '@/components/ui/thumbnail-image';
import { SearchBar } from '@/components/ui/search-bar';

// --- Utility Functions for Display ---

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

export default function FolderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { data: session } = useSession();
    const folderId = params?.folderId as string;

    const [files, setFiles] = useState<any[]>([]);
    const [folderName, setFolderName] = useState("Folder Contents");
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(false);

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
        if (session?.accessToken && folderId) {
            loadData();
        } else if (session?.error === "RefreshAccessTokenError") {
            setAuthError(true);
        }
    }, [session, folderId]);

    const loadData = async () => {
        // 1. Try cache
        const cacheKey = CACHE_KEYS.FOLDER_CONTENTS(folderId);
        const cached = loadFromCache(cacheKey);

        if (cached) {
            setFolderName(cached.folderName);
            setFiles(cached.files);
            setLoading(false);
        }

        setAuthError(false);
        try {
            const accessToken = session!.accessToken!;

            // Parallel fetch: Metadata + Files
            const [meta, fileList] = await Promise.all([
                getFolderMetadata(accessToken, folderId),
                listFilesWithMetadata(accessToken, folderId)
            ]);

            setFolderName(meta.name || "Folder Contents");
            setFiles(fileList);

            // Update Cache
            saveToCache(cacheKey, { folderName: meta.name || "Folder Contents", files: fileList });

        } catch (error: any) {
            console.error("Failed to load folder data", error);
            // Check for auth errors
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

        if (idsToDelete.length === 0 && contextMenu?.fileId) {
            idsToDelete = [contextMenu.fileId];
        }

        if (idsToDelete.length === 0) return;

        if (!confirm(`Are you sure you want to delete ${idsToDelete.length} item(s)?`)) return;

        setDeleting(true);
        try {
            await Promise.all(idsToDelete.map(id => deleteDriveFile(session.accessToken!, id)));

            // Remove from local state
            const newFiles = files.filter(f => !idsToDelete.includes(f.id));
            setFiles(newFiles);

            // Update Cache
            saveToCache(CACHE_KEYS.FOLDER_CONTENTS(folderId), { folderName, files: newFiles });

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

    // Auth Error UI
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
                        <p className="text-gray-400 mb-6">Your Google Drive session has expired. Please sign in again to access your folders.</p>
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

    const handleCardClick = async (file: any) => {
        if (!session?.accessToken) return;

        // Prepare data for viewer
        const isVideo = file.mimeType.startsWith('video/');

        // For Valid Video Playback: Use internal proxy to handle Auth/CORS
        const videoUrl = `/api/drive/stream?fileId=${file.id}`;
        const downloadUrl = await getFileDownloadUrl(file.id, session.accessToken);

        setSelectedFile({
            url: isVideo ? videoUrl : downloadUrl,
            name: formatVideoName(file.name, file.createdTime),
            type: isVideo ? 'video' : 'image',
            size: formatFileSize(file.size),
            driveLink: file.webViewLink
        });
        setViewerOpen(true);
    };

    return (
        <div className="flex min-h-screen bg-transparent text-white font-sans">
            <Sidebar />

            <div className="flex-1 ml-0 lg:ml-[280px] p-4 lg:p-8">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 lg:mb-8 gap-4 pt-16 lg:pt-0">
                    <div className="flex items-center gap-4 lg:gap-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2.5 bg-white/5 hover:bg-white/10 border border-[#a855f7]/30 hover:border-[#a855f7]/50 rounded-xl transition-all duration-200 text-xs lg:text-sm font-medium text-white/90"
                        >
                            <ArrowLeft size={16} className="lg:w-[18px]" /> Back
                        </button>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl lg:text-[32px] font-bold text-white leading-tight truncate">{folderName}</h1>
                            <p className="text-white/60 text-xs lg:text-[15px] mt-0.5">
                                {loading && files.length === 0 ? "Loading..." : `${files.length} ${files.length === 1 ? 'item' : 'items'}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Selection Logic */}
                        {isSelectionMode ? (
                            <div className="flex items-center gap-3 bg-[#1a1a1a] p-1.5 rounded-xl border border-white/10 animate-in fade-in zoom-in-95 duration-200 w-full lg:w-auto overflow-x-auto">
                                <span className="text-sm font-medium text-white/80 px-2 whitespace-nowrap">
                                    {selectedIds.size} selected
                                </span>
                                {selectedIds.size > 0 ? (
                                    <button
                                        onClick={deleteSelected}
                                        disabled={deleting}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-medium transition-colors border border-red-500/20"
                                    >
                                        {deleting ? <div className="scale-75"><BarsLoader /></div> : <Trash2 size={14} />}
                                        Delete
                                    </button>
                                ) : null}
                                <button
                                    onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedIds(new Set());
                                    }}
                                    className="px-3 py-1.5 hover:bg-white/5 text-white/60 hover:text-white rounded-lg text-sm font-medium transition-colors ml-auto lg:ml-0"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsSelectionMode(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-xl text-xs lg:text-sm font-medium text-white/90 transition-all hover:border-white/20"
                            >
                                <CheckSquare size={16} className="text-gray-400" />
                                Select
                            </button>
                        )}

                        {/* Unified SearchBar */}
                        <SearchBar
                            placeholder="Search in folder..."
                            className="w-full lg:w-[280px]"
                        // onSearch logic not yet wired up for client filtering, 
                        // ensuring visual consistency primarily.
                        />
                    </div>
                </div>

                {/* Grid Content - OPTIMIZED */}
                {loading && files.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-70">
                        <img src="/assets/anya-empty.gif" alt="Empty" className="w-48 h-48 object-cover rounded-xl mb-6 opacity-80" />
                        <h3 className="text-xl font-bold text-gray-300">This folder is empty 🥜</h3>
                        <p className="text-gray-500">Add some posts to get started!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20" onClick={() => setContextMenu(null)}>
                        {files.map((file) => {
                            const isVideo = file.mimeType.startsWith('video/');
                            const isSelected = selectedIds.has(file.id);
                            const displayName = formatVideoName(file.name, file.createdTime);
                            const meta = isVideo
                                ? formatDuration(file.videoMediaMetadata?.durationMillis)
                                : (file.imageMediaMetadata ? `${file.imageMediaMetadata.width}×${file.imageMediaMetadata.height}` : '');

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
                                    className={`
                                        group relative w-full aspect-[9/16] bg-[#1e1e32]/50 border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 
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
                                            fallbackSrc={file.thumbnailLink?.replace('=s220', '=s600') || (isVideo ? '/assets/video-placeholder.svg' : '/assets/image-placeholder.svg')}
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

                                        {/* Info Gradient Overlay */}
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-12">
                                            <h3 className="text-[13px] font-semibold text-white truncate mb-1" title={displayName}>{displayName}</h3>
                                            <div className="flex items-center justify-between text-[10px] text-white/70 font-medium">
                                                <span>{formatFileSize(file.size)}</span>
                                                {meta && (
                                                    <span className="flex items-center gap-1">
                                                        {isVideo ? '• ' + meta : meta}
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

                {/* Reusable Media Viewer */}
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
