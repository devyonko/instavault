'use client';

import React from 'react';
import { useDownload } from '@/components/providers/download-provider';
import { Minimize2, Maximize2, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function DownloadProgress() {
    const { activeDownload, minimizeDownload, maximizeDownload, closeDownload } = useDownload();

    if (!activeDownload) return null;

    return (
        <AnimatePresence>
            {!activeDownload.isMinimized ? (
                // Maximized Card
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-6 right-6 w-96 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-5 z-50 overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none" />

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${activeDownload.status === 'error' ? 'bg-red-500/10 text-red-500' :
                                    activeDownload.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' :
                                        'bg-purple-500/10 text-purple-500'
                                }`}>
                                {activeDownload.status === 'downloading' && <Loader2 size={20} className="animate-spin" />}
                                {activeDownload.status === 'completed' && <CheckCircle size={20} />}
                                {activeDownload.status === 'error' && <AlertCircle size={20} />}
                                {activeDownload.status === 'pending' && <Loader2 size={20} className="animate-spin" />}
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm">
                                    {activeDownload.status === 'downloading' ? 'Downloading...' :
                                        activeDownload.status === 'completed' ? 'Download Complete' :
                                            activeDownload.status === 'error' ? 'Download Failed' : 'Starting...'}
                                </h4>
                                <p className="text-xs text-white/50 truncate max-w-[180px]">
                                    {activeDownload.fileName}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={minimizeDownload}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                            >
                                <Minimize2 size={16} />
                            </button>
                            <button
                                onClick={closeDownload}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative z-10">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-white/40">{Math.round(activeDownload.progress)}%</span>
                            {activeDownload.status === 'error' && <span className="text-red-400">Error</span>}
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${activeDownload.status === 'error' ? 'bg-red-500' :
                                        activeDownload.status === 'completed' ? 'bg-emerald-500' :
                                            'bg-gradient-to-r from-purple-500 to-pink-500'
                                    }`}
                                initial={{ width: 0 }}
                                animate={{ width: `${activeDownload.progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        {activeDownload.error && (
                            <p className="text-xs text-red-400 mt-2">
                                {activeDownload.error}
                            </p>
                        )}
                    </div>
                </motion.div>
            ) : (
                // Minimized Pill
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="fixed bottom-6 right-6 bg-[#1e293b] border border-white/10 rounded-full shadow-lg z-50 flex items-center gap-3 pr-2 pl-4 py-2 cursor-pointer hover:border-white/20"
                    onClick={maximizeDownload}
                >
                    <div className={`w-2 h-2 rounded-full ${activeDownload.status === 'downloading' ? 'bg-purple-500 animate-pulse' :
                            activeDownload.status === 'completed' ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                    <span className="text-sm font-medium text-white">
                        {Math.round(activeDownload.progress)}%
                    </span>
                    <button className="p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white">
                        <Maximize2 size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
