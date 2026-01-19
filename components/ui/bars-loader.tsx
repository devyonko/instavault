'use client';

import React from 'react';
import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface BarsLoaderProps {
    className?: string;
    text?: string;
}

export function BarsLoader({ className, text }: BarsLoaderProps) {
    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="flex items-end gap-1 h-6">
                <motion.div
                    className="w-1.5 bg-white"
                    animate={{
                        height: ["8px", "24px", "8px"],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0
                    }}
                />
                <motion.div
                    className="w-1.5 bg-white"
                    animate={{
                        height: ["12px", "24px", "12px"],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.2
                    }}
                />
                <motion.div
                    className="w-1.5 bg-white"
                    animate={{
                        height: ["8px", "24px", "8px"],
                        opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.4
                    }}
                />
            </div>
            {text && <span className="text-sm text-gray-400 font-medium animate-pulse">{text}</span>}
        </div>
    );
}
