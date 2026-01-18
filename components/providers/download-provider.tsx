'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useActivity } from './activity-provider';

export interface DownloadState {
    id: string;
    fileName: string;
    progress: number; // 0-100
    status: 'pending' | 'downloading' | 'completed' | 'error';
    error?: string;
    isMinimized: boolean;
}

interface DownloadContextType {
    activeDownload: DownloadState | null;
    startDownload: (url: string, folderId: string) => Promise<void>;
    minimizeDownload: () => void;
    maximizeDownload: () => void;
    closeDownload: () => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function DownloadProvider({ children }: { children: ReactNode }) {
    const [activeDownload, setActiveDownload] = useState<DownloadState | null>(null);
    const { addActivity } = useActivity();

    const startDownload = useCallback(async (url: string, folderId: string) => {
        const id = crypto.randomUUID();
        // Extract basic name or use generic
        const name = "Instagram Media";

        setActiveDownload({
            id,
            fileName: name,
            progress: 0,
            status: 'pending',
            isMinimized: false
        });

        try {
            addActivity('download', 'Download Started', `Downloading from ${url}`);

            setActiveDownload(prev => prev ? { ...prev, status: 'downloading', progress: 10 } : null);

            // Simulate progress since our API doesn't support streams yet
            const progressInterval = setInterval(() => {
                setActiveDownload(prev => {
                    if (!prev || prev.status !== 'downloading') return prev;
                    const nextProgress = prev.progress + (Math.random() * 10);
                    return nextProgress >= 90 ? { ...prev, progress: 90 } : { ...prev, progress: nextProgress };
                });
            }, 500);

            const res = await fetch('/api/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, folderId }),
            });

            clearInterval(progressInterval);

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Download failed');
            }

            setActiveDownload(prev => prev ? { ...prev, status: 'completed', progress: 100 } : null);
            addActivity('success', 'Download Complete', 'Saved successfully to Google Drive');

            // Auto close after 3s
            setTimeout(() => {
                setActiveDownload(null);
            }, 5000);

        } catch (error: any) {
            console.error("Download Error:", error);
            setActiveDownload(prev => prev ? { ...prev, status: 'error', error: error.message } : null);
            addActivity('error', 'Download Failed', error.message);
        }
    }, [addActivity]);

    const minimizeDownload = () => {
        setActiveDownload(prev => prev ? { ...prev, isMinimized: true } : null);
    };

    const maximizeDownload = () => {
        setActiveDownload(prev => prev ? { ...prev, isMinimized: false } : null);
    };

    const closeDownload = () => {
        setActiveDownload(null);
    };

    return (
        <DownloadContext.Provider value={{
            activeDownload,
            startDownload,
            minimizeDownload,
            maximizeDownload,
            closeDownload
        }}>
            {children}
        </DownloadContext.Provider>
    );
}

export function useDownload() {
    const context = useContext(DownloadContext);
    if (context === undefined) {
        throw new Error('useDownload must be used within a DownloadProvider');
    }
    return context;
}
