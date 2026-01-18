'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Download, Info, X } from 'lucide-react';
import { useActivity, ActivityItem } from '@/components/providers/activity-provider';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationBell() {
    const { activities, unreadCount, markAsRead, markAllAsRead } = useActivity();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            case 'download': return <Download size={16} className="text-blue-500" />;
            default: return <Info size={16} className="text-gray-400" />;
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0f172a]" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-[#1e293b] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1e293b]">
                            <h3 className="font-semibold text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-[#a855f7] hover:text-[#c084fc] font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {activities.length === 0 ? (
                                <div className="p-8 text-center text-white/30 text-sm">
                                    No notifications yet
                                </div>
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    {activities.map((item) => (
                                        <li
                                            key={item.id}
                                            className={`p-4 hover:bg-white/5 transition-colors ${!item.read ? 'bg-white/[0.02]' : ''}`}
                                            onClick={() => markAsRead(item.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className="mt-1 shrink-0">
                                                    {getIcon(item.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`text-sm font-medium ${!item.read ? 'text-white' : 'text-white/60'}`}>
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-white/40 mt-0.5 line-clamp-2">
                                                        {item.description}
                                                    </p>
                                                    <span className="text-[10px] text-white/20 mt-2 block">
                                                        {new Date(item.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                                {!item.read && (
                                                    <div className="w-2 h-2 rounded-full bg-[#a855f7] mt-2" />
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
