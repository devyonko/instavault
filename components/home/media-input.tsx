'use client';

import React, { useState } from 'react';
import { Download, Loader2, Folder, Plus, X, Search, CheckCircle2, ChevronRight, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface MediaInputProps {
    onSaveSuccess?: () => void;
}

export default function MediaInput({ onSaveSuccess }: MediaInputProps) {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [folders, setFolders] = useState<{ id: string, name: string }[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string>('');
    const [fetchingFolders, setFetchingFolders] = useState(false);

    // Inline Folder Creation State
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [creatingFolderLoading, setCreatingFolderLoading] = useState(false);


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        // 1. Fetch folders and show modal selection
        setFetchingFolders(true);
        try {
            const res = await fetch('/api/drive/folders');
            if (res.ok) {
                const data = await res.json();
                setFolders(data.folders || []);
                setShowFolderModal(true);
            }
        } catch (error) {
            console.error("Failed to fetch folders", error);
        } finally {
            setFetchingFolders(false);
        }
    };

    const handleConfirmDownload = async () => {
        setShowFolderModal(false);
        setLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            const res = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, folderId: selectedFolderId }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Download failed'); // Use specific error message
            }

            const data = await res.json();
            console.log("Download success:", data);

            setStatus('success');
            setUrl(''); // Clear input
            if (onSaveSuccess) onSaveSuccess(); // Refresh parents

            // Reset status after a delay
            setTimeout(() => setStatus('idle'), 3000);

        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setErrorMessage(error.message || "Connection failed");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        setCreatingFolderLoading(true);
        try {
            const res = await fetch('/api/drive/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newFolderName }),
            });
            if (res.ok) {
                const data = await res.json();
                // Add new folder to list and select it
                setFolders(prev => [data.folder, ...prev]);
                setSelectedFolderId(data.folder.id);
                setIsCreatingFolder(false);
                setNewFolderName("");
            }
        } catch (error) {
            console.error("Failed to create folder", error);
        } finally {
            setCreatingFolderLoading(false);
        }
    };


    return (
        <>
            <form onSubmit={handleSave} className="w-full relative z-10">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center bg-black rounded-lg p-1.5 ring-1 ring-white/10">
                        <input
                            type="text"
                            placeholder="Paste Instagram URL..."
                            className="flex-1 bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-500 font-medium text-base md:text-sm"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={loading || !url}
                            className="px-4 md:px-6 py-3 bg-[#6366f1] hover:bg-[#5558e6] text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                            <span>Save</span>
                        </button>
                    </div>
                </div>

                {/* Status Messages */}
                <AnimatePresence>
                    {status === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-400"
                        >
                            <CheckCircle2 size={20} />
                            <span>Successfully saved to Drive!</span>
                        </motion.div>
                    )}
                    {status === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400"
                        >
                            <X size={20} />
                            <span>{errorMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {/* Folder Selection Modal */}
            <AnimatePresence>
                {showFolderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#18181b]">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Select Destination</h3>
                                    <p className="text-xs text-gray-400 mt-1">Where should we save this?</p>
                                </div>
                                <button onClick={() => setShowFolderModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Folder List */}
                            <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
                                {folders.map((folder) => (
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
                                            <motion.div layoutId="check">
                                                <CheckCircle2 size={18} className="text-[#6366f1]" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Create New Folder Inline */}
                            <div className="p-4 border-t border-white/5 bg-[#18181b]">
                                {isCreatingFolder ? (
                                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">

                                        {/* Use a simple div instead of form to avoid nesting issues since it's inside another structure */}
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <FolderPlus size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    disabled={creatingFolderLoading}
                                                    placeholder="Folder Name"
                                                    value={newFolderName}
                                                    onChange={(e) => setNewFolderName(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                                    className="w-full bg-[#27272a] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-[#6366f1]"
                                                />
                                            </div>
                                            <button
                                                onClick={handleCreateFolder}
                                                disabled={creatingFolderLoading || !newFolderName.trim()}
                                                className="bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-lg px-3 flex items-center justify-center disabled:opacity-50"
                                            >
                                                {creatingFolderLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />}
                                            </button>
                                            <button
                                                onClick={() => setIsCreatingFolder(false)}
                                                className="bg-[#27272a] hover:bg-white/10 text-white rounded-lg px-3 flex items-center justify-center"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsCreatingFolder(true)}
                                        className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-lg border border-dashed border-white/10 hover:border-white/20 transition-all"
                                    >
                                        <Plus size={16} /> Create New Folder
                                    </button>
                                )}

                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <button
                                        onClick={handleConfirmDownload}
                                        disabled={!selectedFolderId || loading}
                                        className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#5558e6] hover:to-[#7c3aed] text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <> Confirm & Download <ChevronRight size={16} /> </>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
