import React from 'react';
import { Home, Grid, Folder, Settings, Layers, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import MobileMenu from './mobile-menu';
import { useSession } from 'next-auth/react';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
        { label: 'Home', icon: Home, href: '/home', active: pathname === '/home' },
        { label: 'Gallery', icon: Grid, href: '/gallery', active: pathname === '/gallery' },
        { label: 'Folders', icon: Folder, href: '/folders', active: pathname?.startsWith('/folders') ?? false },
        { label: 'Settings', icon: Settings, href: '/settings', active: pathname?.startsWith('/settings') ?? false },
    ];

    return (
        <>
            {/* Mobile Menu (Visible on Mobile) */}
            <MobileMenu session={session} />

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] bg-gradient-to-b from-[#1e293b]/15 to-[#020617]/15 backdrop-blur-2xl border-r border-white/10 text-slate-200 flex-col shadow-2xl z-40 font-sans">

                {/* Top Branding Section */}
                <div className="flex items-center gap-3 px-6 py-8 border-b border-white/5 relative overflow-hidden">
                    {/* Glow effect behind logo */}
                    <div className="absolute top-1/2 left-6 w-8 h-8 bg-indigo-500/30 blur-xl rounded-full -translate-y-1/2" />

                    <div className="relative w-8 h-8 flex items-center justify-center z-10">
                        <img
                            src="/instavault/instavault-icon.svg"
                            alt="InstaVault Logo"
                            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                        />
                    </div>
                    <span className="text-xl font-bold text-white tracking-wide z-10">InstaVault</span>
                </div>

                {/* Navigation Items - FLex Grow to push items up */}
                <nav className="flex-1 px-4 py-8 overflow-y-auto no-scrollbar flex flex-col gap-6">

                    {/* Main Links */}
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`
                  group flex items-center gap-4 px-4 py-3.5 rounded-[12px] transition-all duration-300 ease-out cursor-pointer border border-transparent
                  ${item.active
                                            ? 'bg-white/10 text-white border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                                        }
                `}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.2, rotate: 5 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <item.icon
                                            size={22}
                                            className={`
                        transition-colors duration-300 
                        ${item.active ? 'text-[#a855f7]' : 'text-slate-500 group-hover:text-[#a855f7]'}
                    `}
                                        />
                                    </motion.div>
                                    <span className={`text-[15px] font-medium tracking-wide ${item.active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile Section Removed - Identity is only in Top Bar */}

                {/* About Dev Button - Pushed to bottom with Flex-1 in Nav */}
                <div className="px-4 pb-6">
                    <div className="relative group rounded-[16px] p-[1px] overflow-hidden shadow-lg">
                        {/* Rotating Gradient Border */}
                        <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(168,85,247,0.5)_10%,rgba(236,72,153,0.5)_20%,transparent_30%,transparent_100%)] animate-spin" style={{ animationDuration: '4s' }} />

                        {/* Button Content */}
                        <Link
                            href="/about"
                            className="relative w-full flex items-center gap-3 px-4 py-4 bg-black/40 hover:bg-black/60 backdrop-blur-xl rounded-[15px] transition-all duration-300 group-hover:text-white text-white/70 border border-white/5"
                        >
                            <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-[#a855f7]/20 transition-colors duration-300">
                                <Info size={18} className="text-[#a855f7] group-hover:text-white transition-colors" />
                            </div>
                            <span className="font-semibold text-[14px]">About Dev</span>
                        </Link>
                    </div>
                </div>

            </aside>
        </>
    );
}
