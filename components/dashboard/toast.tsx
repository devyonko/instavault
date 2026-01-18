'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
    type: 'success' | 'error';
    message: string;
    subMessage?: string;
    onClose: () => void;
}

export default function Toast({ type, message, subMessage, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const gifSrc = type === 'success' ? '/assets/anya-success.gif' : '/assets/anya-error.gif';

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-[slideUp_0.3s_ease-out]">
            <div className="relative bg-[rgba(30,30,50,0.95)] backdrop-blur-xl border border-purple-500/50 rounded-[20px] p-5 pr-12 shadow-[0_20px_60px_rgba(168,85,247,0.3)] max-w-[400px] flex gap-4 items-start">

                {/* GIF */}
                <img
                    src={gifSrc}
                    alt={type}
                    className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                />

                {/* Content */}
                <div className="flex flex-col pt-1">
                    <h4 className="text-lg font-bold text-white leading-tight mb-1">
                        {message}
                    </h4>
                    {subMessage && (
                        <p className="text-sm text-white/70">
                            {subMessage}
                        </p>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
}
