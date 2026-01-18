'use client';

import React from 'react';
import { LayoutGrid, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'motion/react';

export default function RecentActivity() {
    const items = [
        { id: 1, title: 'Workout Tips', tag: 'Fitness', time: '2 hrs ago' },
        { id: 2, title: 'Pasta Recipe', tag: 'Food', time: 'Yesterday' },
        { id: 3, title: 'UI Design Tips', tag: 'Design', time: '2 days ago' },
    ];

    return (
        <div className="h-full p-6 border border-dashed border-white/20 rounded-2xl bg-white/5 backdrop-blur-sm flex flex-col font-mono relative">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-dashed border-white/20">
                <LayoutGrid size={20} className="text-[#a855f7]" />
                <h3 className="text-lg font-bold text-white tracking-wide">Recently Saved</h3>
            </div>

            {/* List */}
            <div className="flex-1 flex flex-col gap-6">
                {items.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-4 group cursor-pointer"
                    >
                        {/* Thumbnail Placeholder */}
                        <div className="w-16 h-16 border border-white/10 rounded flex items-center justify-center bg-[#0a0a0a] group-hover:border-[#a855f7]/50 transition-colors">
                            <span className="text-xs text-gray-600 group-hover:text-[#a855f7]/70">img</span>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col">
                            <span className="text-white font-semibold group-hover:text-[#a855f7] transition-colors">{item.title}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <span className="text-gray-400">{item.tag}</span>
                                <span>•</span>
                                <span>{item.time}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Footer Link */}
            <div className="mt-6 pt-4 border-t border-dashed border-white/10 flex justify-center">
                <Link href="/gallery" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
                    [ View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /> ]
                </Link>
            </div>
        </div>
    );
}
