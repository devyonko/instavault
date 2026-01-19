'use client';

import React, { useState, useEffect } from 'react';
import { Folder, Plus, X, Search, CheckCircle2, ChevronRight, FolderPlus } from 'lucide-react';
import { BarsLoader } from '@/components/ui/bars-loader';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';

interface SaveToDriveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (folderId: string) => void;
    initialUrl?: string;
}

export function SaveToDriveModal({ isOpen, onClose, onConfirm, initialUrl }: SaveToDriveModalProps) {
    const { data: session } = useSession();
    const [folders, setFolders] = useState<{ id: string, name: string }[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('');
    const [fetching, setFetching] = useState(false);

    // Create Folder State
    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [creatingLoading, setCreatingLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFolders();
        }
    }, [isOpen]);

    const fetchFolders = async () => {
        setFetching(true);
        try {
            const res = await fetch('/api/drive/folders');
            if (res.ok) {
                const data = await res.json();

                // Add "Root" option manually if not present
                const rootOption = { id: '', name: 'InstaSave (Root)' };
                // Filter out any folder named 'InstaSave' duplicate if API returns it, though usually it returns subfolders
                const subfolders = data.folders || [];

                setFolders([rootOption, ...subfolders]);

                // Default to Root if nothing selected
                if (!selectedFolderId) {
                    setSelectedFolderId('');
                }
            }
        } catch (error) {
            console.error("Failed to fetch folders", error);
        } finally {
            setFetching(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setCreatingLoading(true);
        try {
            const res = await fetch('/api/drive/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newFolderName }),
            });
            if (res.ok) {
                const data = await res.json();
                setFolders(prev => [data, ...prev]);
                setSelectedFolderId(data.id);
                setIsCreating(false);
                setNewFolderName("");
            }
        } catch (error) {
            console.error("Failed to create folder", error);
        } finally {
            setCreatingLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div
                className="w-full h-full lg:h-auto max-w-md bg-[#0f0f0f] border-x-0 border-y-0 lg:border border-white/10 lg:rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#18181b]">
                    <div>
                        <h3 className="text-lg font-bold text-white">Select Destination</h3>
                        <p className="text-xs text-gray-400 mt-1">Where should we save this post?</p>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1 min-h-[150px]">
                    {fetching ? (
                        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                            <div className="scale-75"><BarsLoader /></div>
                            <p className="text-xs mt-2">Loading folders...</p>
                        </div>
                    ) : (
                        folders.map((folder) => (
                            <button
                                key={folder.id}
                                onClick={() => setSelectedFolderId(folder.id)}
                                className={cn(
                                    "w-full flex items-center justify-between p-3 rounded-lg group transition-all duration-200 border border-transparent",
                                    selectedFolderId === folder.id
                                        ? "bg-[#6366f1]/10 border-[#6366f1]/40"
                                        : "hover:bg-white/5 hover:border-white/5"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        selectedFolderId === folder.id ? "bg-[#6366f1] text-white" : "bg-[#27272a] text-gray-400 group-hover:text-white"
                                    )}>
                                        <Folder size={18} />
                                    </div>
                                    <span className={cn(
                                        "font-medium",
                                        selectedFolderId === folder.id ? "text-white" : "text-gray-300 group-hover:text-white"
                                    )}>{folder.name}</span>
                                </div>
                                {selectedFolderId === folder.id && (
                                    <CheckCircle2 size={18} className="text-[#6366f1]" />
                                )}
                            </button>
                        ))
                    )}
                </div>

                {/* Footer / Create New */}
                <div className="p-4 border-t border-white/5 bg-[#18181b]">
                    {isCreating ? (
                        <div className="flex gap-2 mb-4 animate-in slide-in-from-bottom-2">
                            <div className="relative flex-1">
                                <FolderPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    autoFocus
                                    type="text"
                                    disabled={creatingLoading}
                                    placeholder="Folder Name"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                    className="w-full bg-[#27272a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#6366f1]"
                                />
                            </div>
                            <button
                                onClick={handleCreateFolder}
                                disabled={creatingLoading || !newFolderName.trim()}
                                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg px-3 flex items-center justify-center disabled:opacity-50"
                            >
                                {creatingLoading ? <div className="scale-50"><BarsLoader /></div> : <Plus size={18} />}
                            </button>
                            <button
                                onClick={() => setIsCreating(false)}
                                className="bg-[#27272a] hover:bg-white/10 text-white rounded-lg px-3 flex items-center justify-center"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full flex items-center justify-center gap-2 py-2 mb-4 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-dashed border-white/10 hover:border-white/20 transition-all"
                        >
                            <Plus size={16} /> Create New Folder
                        </button>
                    )}

                    <button
                        onClick={() => onConfirm(selectedFolderId)}
                        disabled={selectedFolderId === undefined || fetching} // Allow empty string (Root)
                        className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c3aed] text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        Confirm & Download <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
