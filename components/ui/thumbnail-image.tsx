'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getThumbnailFromDB, saveThumbnailToDB } from '@/lib/thumbnail-db';
import { requestThumbnailGeneration } from '@/lib/thumbnail-gen';
import { Loader2, Video } from 'lucide-react';

interface ThumbnailImageProps {
    fileId: string;
    videoUrl?: string; // Stream URL for generation
    fallbackSrc?: string; // Existing weak thumbnail (optional)
    alt: string;
    className?: string;
    isVideo?: boolean;
}

export const ThumbnailImage: React.FC<ThumbnailImageProps> = ({
    fileId,
    videoUrl,
    fallbackSrc,
    alt,
    className,
    isVideo = false
}) => {
    const [src, setSrc] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'cached' | 'generating' | 'error' | 'fallback'>('loading');
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        checkCache();
        return () => { mounted.current = false; };
    }, [fileId]);

    const checkCache = async () => {
        try {
            // 1. Check DB first (Fastest persistent)
            const cached = await getThumbnailFromDB(fileId);
            if (cached && mounted.current) {
                // console.log(`[Thumbnail] Cache HIT for ${fileId}`);
                setSrc(cached);
                setStatus('cached');
                return;
            }

            // 2. If no cache, but we have a video URL, generate it
            if (isVideo && videoUrl) {
                // console.log(`[Thumbnail] Generating for ${fileId}`);
                setStatus('generating');
                requestThumbnailGeneration(videoUrl)
                    .then(async (generatedUrl) => {
                        if (!mounted.current) return;
                        setSrc(generatedUrl);
                        setStatus('cached');
                        await saveThumbnailToDB(fileId, generatedUrl);
                    })
                    .catch((e) => {
                        console.warn(`[Thumbnail] Gen failed for ${fileId}:`, e);
                        if (mounted.current) handleFallback();
                    });
            } else {
                handleFallback();
            }

        } catch (e) {
            console.error(`[Thumbnail] Error in checkCache for ${fileId}:`, e);
            handleFallback();
        }
    };

    const handleFallback = () => {
        if (fallbackSrc) {
            setSrc(fallbackSrc);
            setStatus('fallback');
        } else {
            setStatus('error');
        }
    };

    // Render Logic
    // If we have a source (Cache or Generated), show it.
    // If generating, show a nice placeholder (or the fallback if available).

    // We want to avoid flicker. 
    // Ideally: If generating, show a "skeleton" or standard placeholder.

    if (src) {
        return (
            <img
                src={src}
                alt={alt}
                className={`${className} object-cover animate-in fade-in duration-300`}
                onError={() => {
                    // If our blob fails for some reason, remove it?
                    // For now just hide
                }}
            />
        );
    }

    // Placeholder State
    return (
        <div className={`${className} bg-[#1a1a1a] flex items-center justify-center relative overflow-hidden`}>
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />

            {status === 'generating' ? (
                // Only show loader if taking > 200ms? 
                // For now, simple consistent icon
                <div className="flex flex-col items-center gap-2 text-white/20">
                    <Video size={24} />
                </div>
            ) : (
                <div className="text-white/10">
                    <Video size={32} />
                </div>
            )}
        </div>
    );
};
