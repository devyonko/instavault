'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

export default function StatsCard() {
    const stats = [
        { label: 'Total Saved', value: '247' },
        { label: 'This Week', value: '12' },
        { label: 'This Month', value: '45' },
        { label: 'Storage', value: '1.2 GB' },
        { label: 'Folders', value: '8' },
    ];

    return (
        <div className="h-full p-6 border border-dashed border-white/20 rounded-2xl bg-white/5 backdrop-blur-sm flex flex-col font-mono">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-dashed border-white/20">
                <BarChart3 size={20} className="text-[#6366f1]" />
                <h3 className="text-lg font-bold text-white tracking-wide">Your Stats</h3>
            </div>

            {/* Stats List */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between group">
                        <span className="text-gray-400 group-hover:text-gray-300 transition-colors">{stat.label}:</span>
                        <span className="text-[#a5b4fc] font-semibold">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
