'use client';

import React, { useState } from 'react';
import { Home, Grid, Folder, Settings, Menu, X, Info, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import Image from 'next/image';

export default function MobileMenu({ session }: { session?: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', icon: Home, href: '/home', active: pathname === '/home' },
        { label: 'Gallery', icon: Grid, href: '/gallery', active: pathname === '/gallery' },
        { label: 'Folders', icon: Folder, href: '/folders', active: pathname === '/folders' },
        { label: 'Settings', icon: Settings, href: '/settings', active: pathname === '/settings' },
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#1e293b]/80 backdrop-blur-md border border-white/10 rounded-xl text-white shadow-lg shadow-black/20 active:scale-95 transition-all"
                aria-label="Open Menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-[280px] bg-[#0f172a] z-[70] lg:hidden flex flex-col border-r border-white/5"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <span className="text-xl font-bold text-white tracking-wide">InstaVault</span>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* User Profile Summary (Optional for mobile feeling) */}
                            {session?.user && (
                                <div className="px-6 py-6 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-[1px]">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-black">
                                            {session.user.image ? (
                                                <Image src={session.user.image} alt="User" width={40} height={40} className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                                    {session.user.name?.[0]}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-white font-medium truncate">{session.user.name}</div>
                                        <div className="text-xs text-gray-400 truncate">{session.user.email}</div>
                                    </div>
                                </div>
                            )}

                            {/* Nav Items */}
                            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.label}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-4 px-4 py-3.5 rounded-[12px] transition-all font-medium ${item.active
                                            ? 'bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <item.icon size={20} className={item.active ? 'text-white' : 'text-current'} />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-white/5 space-y-2">
                                <Link
                                    href="/about"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                >
                                    <Info size={20} />
                                    About Dev
                                </Link>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <LogOut size={20} />
                                    Sign Out
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
