'use client';

import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, Loader2 } from 'lucide-react';

interface MediaViewerProps {
    isOpen: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
    fileType: 'video' | 'image';
    fileSize?: string;
    driveLink?: string;
}

export function MediaViewerModal({
    isOpen,
    onClose,
    fileUrl,
    fileName,
    fileType,
    fileSize,
    driveLink
}: MediaViewerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            setError(false);
        }
    }, [isOpen, fileUrl]);

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyPress);
            return () => window.removeEventListener('keydown', handleKeyPress);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.click();
    };

    const handleLoad = () => {
        setLoading(false);
    };

    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Modal Content */}
            <div
                className="relative max-w-6xl w-full h-full lg:h-auto lg:max-h-[90vh] lg:mx-4 flex flex-col items-center justify-center lg:block"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="absolute -top-16 left-0 right-0 z-10 flex justify-between items-center text-white">
                    <div className="flex flex-col">
                        <span className="font-semibold text-lg">{fileName}</span>
                        {fileSize && <span className="text-sm text-white/60">{fileSize}</span>}
                    </div>

                    <div className="flex items-center gap-3">
                        {driveLink && (
                            <button
                                onClick={() => window.open(driveLink, '_blank')}
                                className="opacity-70 hover:opacity-100 transition-opacity p-2"
                                title="Open in Drive"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Media Content */}
                <div className="relative w-full h-[80vh] flex items-center justify-center bg-black/50 rounded-xl overflow-hidden border border-white/10">

                    {loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-0">
                            <img src="/assets/anya-loading.gif" alt="Loading" className="w-24 h-24 object-cover rounded-xl opacity-80" />
                            <p className="animate-pulse">Loading media...</p>
                        </div>
                    )}

                    {error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white z-10 bg-black">
                            <img src="/assets/anya-error.gif" alt="Error" className="w-24 h-24 object-cover rounded-xl" />
                            <div className="text-center">
                                <p className="text-red-400 mb-2">Could not load media</p>
                                {driveLink && (
                                    <button
                                        onClick={() => window.open(driveLink, '_blank')}
                                        className="text-sm underline hover:text-purple-400"
                                    >
                                        Open in Google Drive
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {fileType === 'video' ? (
                        <video
                            src={fileUrl}
                            controls
                            autoPlay
                            onLoadedData={handleLoad}
                            onError={handleError}
                            className={`max-w-full max-h-full rounded-lg shadow-2xl relative z-10 ${loading ? 'opacity-0' : 'opacity-100'}`}
                            style={{ transition: 'opacity 0.3s ease' }}
                        >
                            Your browser does not support video playback.
                        </video>
                    ) : (
                        <img
                            src={fileUrl}
                            alt={fileName}
                            onLoad={handleLoad}
                            onError={handleError}
                            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl relative z-10 ${loading ? 'opacity-0' : 'opacity-100'}`}
                            style={{ transition: 'opacity 0.3s ease' }}
                        />
                    )}
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <button
                        onClick={handleDownload}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-full font-medium text-white shadow-lg shadow-purple-500/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download Original
                    </button>
                </div>
            </div>
        </div>
    );
}
