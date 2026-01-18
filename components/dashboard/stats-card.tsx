'use client';

import React from 'react';
import { BarChart3, Image as ImageIcon, Video, Folder, HardDrive } from 'lucide-react';

interface Stats {
    reels: number;
    posts: number;
    total: number;
    week: number;
    month: number;
    folders: number;
    storageUsed: number;
    storageTotal: number;
}

interface StatsCardProps {
    stats: Stats;
}

export default function StatsCard({ stats }: StatsCardProps) {
    const usagePercent = Math.min(100, Math.max(0, (stats.storageUsed / stats.storageTotal) * 100));

    const StatRow = ({ icon: Icon, label, value, color, bg }: { icon: React.ElementType, label: string, value: string | number, color: string, bg: string }) => (
        <div className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors px-2">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon className={`${color} w-5 h-5`} />
                </div>
                <span className="text-[15px] font-medium text-white/70">{label}</span>
            </div>
            <span className="text-[20px] lg:text-[24px] font-bold font-mono tracking-tight text-white/90">{value}</span>
        </div>
    );

    return (
        <div className="w-full bg-[#18181b] border border-white/10 rounded-2xl p-6 lg:p-8 relative overflow-hidden group hover:border-white/20 transition-all duration-500 shadow-2xl h-full flex flex-col">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] group-hover:bg-purple-600/10 transition-colors pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-600/5 rounded-full blur-[80px] group-hover:bg-pink-600/10 transition-colors pointer-events-none" />

            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-white/5 shadow-inner">
                    <BarChart3 className="text-white w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white">Overview</h2>
                    <p className="text-white/40 text-sm">Your vault statistics</p>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <StatRow
                    icon={Video}
                    label="Reels Saved"
                    value={stats.reels}
                    color="text-purple-400"
                    bg="bg-purple-400/10"
                />
                <StatRow
                    icon={ImageIcon}
                    label="Posts Saved"
                    value={stats.posts}
                    color="text-pink-400"
                    bg="bg-pink-400/10"
                />
                <StatRow
                    icon={Folder}
                    label="Folders Created"
                    value={stats.folders}
                    color="text-blue-400"
                    bg="bg-blue-400/10"
                />
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-2 text-white/60">
                        <HardDrive size={16} />
                        <span className="text-sm font-medium">Storage Usage</span>
                    </div>
                    <span className="text-white font-mono font-bold">
                        {(stats.storageUsed / (1024 * 1024 * 1024)).toFixed(2)} GB
                        <span className="text-white/40 text-sm font-normal ml-1">
                            / {(stats.storageTotal / (1024 * 1024 * 1024)).toFixed(0)} GB
                        </span>
                    </span>
                </div>

                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${usagePercent}%` }}
                    />
                </div>
                <p className="text-right text-[13px] text-white/50 mt-2">
                    {usagePercent.toFixed(1)}% used
                </p>
            </div>
        </div>
    );
}
