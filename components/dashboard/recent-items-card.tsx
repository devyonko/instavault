'use client';

import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { MediaViewerModal } from './media-viewer-modal';
import { getFileDownloadUrl } from '@/lib/drive';
import { useSession } from 'next-auth/react';

interface RecentItem {
    id: string;
    title: string;
    category: string;
    time: string;
    emoji: string;
    thumbnail?: string | null;
    webViewLink?: string;
    size?: string; // Add size if available, or fetch
}

interface RecentItemsCardProps {
    items: RecentItem[];
}

export default function RecentItemsCard({ items }: RecentItemsCardProps) {
    const { data: session } = useSession();
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<{
        url: string;
        name: string;
        type: 'video' | 'image';
        size?: string;
        driveLink?: string;
    } | null>(null);

    const handleItemClick = async (item: RecentItem) => {
        if (!session?.accessToken) return;

        try {
            // Optimistically set viewer open with loading state handled inside modal
            // But we need URL first. Or we can pass a promise? 
            // For simplicity based on prompt, let's fetch url then open.
            // Actually prompt says "Loading media..." inside modal, 
            // so maybe we pass ID and modal fetches?
            // The prompt snippet: 
            // const fileUrl = await getFileDownloadUrl(item.id, session.accessToken);
            // setSelectedFile(...)
            // setViewerOpen(true);

            // This implies waiting for URL before opening. 
            // To make it snappier, let's open modal and let it load?
            // But modal props require URL. So we wait.
            // We could add a local loading state to the card item if needed.

            const fileUrl = await getFileDownloadUrl(item.id, session.accessToken);

            // Determine type from emoji or mimetype if we had it. 
            // Prompt's `item` has `mimeType` in prompt logic, but here `RecentItem` interface assumes processed data.
            // We can guess from emoji or we should have passed mimeType from parent.
            // Let's assume emoji is accurate or rely on mimeType if available (we need to ensure parent passes it).
            // Looking at `generateRecentItems` in drive.ts, we didn't pass mimeType explicitly, but we set emoji.
            // Let's deduce type from emoji for now if mimeType is missing.
            const isVideo = item.emoji === '🎬';

            setSelectedFile({
                url: fileUrl,
                name: item.title,
                type: isVideo ? 'video' : 'image',
                driveLink: item.webViewLink
            });
            setViewerOpen(true);

        } catch (error) {
            console.error("Failed to open media", error);
            // Fallback to external link if in-app fails
            if (item.webViewLink) window.open(item.webViewLink, '_blank');
        }
    };

    if (!items || items.length === 0) {
        return (
            <div className="bg-[rgba(30,30,50,0.5)] backdrop-blur-xl border border-purple-500/20 rounded-[20px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] min-h-[500px] flex flex-col items-center justify-center text-center">
                <img
                    src="/flight/anya-cool.jpg"
                    alt="No items"
                    className="w-[200px] h-[200px] object-cover rounded-[16px] border-2 border-purple-500/30 mb-6"
                />
                <h3 className="text-xl font-bold text-white mb-2">No Recent Activity Yet ⭐</h3>
                <p className="text-sm text-white/60">Start by pasting an Instagram link above</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[rgba(30,30,50,0.5)] backdrop-blur-xl border border-purple-500/20 rounded-[20px] p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/10">
                    <span className="text-2xl">📱</span>
                    <h2 className="text-[22px] font-bold text-white">Recently Saved</h2>
                </div>

                {/* Items List */}
                <div className="flex flex-col gap-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="flex gap-4 p-3.5 bg-white/[0.03] border border-white/[0.05] rounded-[14px] cursor-pointer transition-all duration-200 hover:bg-white/[0.08] hover:border-purple-500/30 hover:translate-x-1 group"
                        >
                            {/* Thumbnail */}
                            <div className="w-14 h-14 lg:w-[72px] lg:h-[72px] flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-purple-500/30 shadow-lg shadow-purple-500/10 flex items-center justify-center text-2xl lg:text-[32px] overflow-hidden group-hover:shadow-purple-500/20 transition-all">
                                {item.thumbnail ? (
                                    <img
                                        src={item.thumbnail}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            // Fallback if generic thumbnail fails
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <span>{item.emoji}</span>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex flex-col justify-center gap-1.5 flex-1 min-w-0">
                                <h3 className="text-[15px] font-semibold text-white truncate leading-tight group-hover:text-purple-200 transition-colors">
                                    {item.title}
                                </h3>
                                <div className="flex items-center gap-2 text-[13px] text-white/50">
                                    <span>{item.category}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/30"></span>
                                    <span>{item.time}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <button className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-purple-400 font-medium hover:text-purple-300 transition-colors">
                    View All <ExternalLink size={16} />
                </button>
            </div>

            {/* Media Viewer Modal */}
            {selectedFile && (
                <MediaViewerModal
                    isOpen={viewerOpen}
                    onClose={() => setViewerOpen(false)}
                    fileUrl={selectedFile.url}
                    fileName={selectedFile.name}
                    fileType={selectedFile.type}
                    driveLink={selectedFile.driveLink}
                />
            )}
        </>
    );
}
