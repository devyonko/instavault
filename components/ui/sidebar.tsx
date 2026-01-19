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
        { label: 'Folders', icon: Folder, href: '/folders', active: pathname === '/folders' },
        { label: 'Settings', icon: Settings, href: '/settings', active: pathname === '/settings' },
    ];

    return (
        <>
            {/* Mobile Menu (Visible on Mobile) */}
            <MobileMenu session={session} />

            {/* Desktop Sidebar (Hidden on Mobile) */}
            <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[280px] bg-gradient-to-b from-[#2d3748] to-[#1a2332] text-slate-200 flex-col shadow-none border-none z-40 font-sans">

                {/* Top Branding Section */}
                <div className="flex items-center gap-3 px-6 py-6 bg-[#242d3d] border-b border-white/5">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <img
                            src="/instavault/instavault-icon.svg"
                            alt="InstaVault Logo"
                            className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        />
                    </div>
                    <span className="text-xl font-bold text-white tracking-wide">InstaVault</span>
                </div>

                {/* Navigation Items - FLex Grow to push items up */}
                <nav className="flex-1 px-4 py-6 overflow-y-auto no-scrollbar flex flex-col gap-6">

                    {/* Main Links */}
                    <ul className="space-y-1">
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    className={`
                  group flex items-center gap-4 px-4 py-3.5 rounded-[10px] transition-all duration-200 ease-in-out cursor-pointer
                  ${item.active
                                            ? 'bg-[#6366f1]/15 text-white'
                                            : 'text-slate-200 hover:bg-[#6366f1]/10'
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
                        transition-colors duration-200 
                        ${item.active ? 'text-[#818cf8]' : 'text-[#94a3b8] group-hover:text-[#818cf8]'}
                    `}
                                        />
                                    </motion.div>
                                    <span className={`text-[15px] font-medium ${item.active ? 'text-white' : 'text-[#e2e8f0]'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* User Profile Section Removed - Identity is only in Top Bar */}

                {/* About Dev Button - Pushed to bottom with Flex-1 in Nav */}
                <div className="px-4 pb-4">
                    <div className="relative group rounded-[12px] p-[1px] overflow-hidden">
                        {/* Rotating Gradient Border */}
                        <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0%,rgba(168,85,247,0.8)_10%,rgba(236,72,153,0.8)_20%,transparent_30%,transparent_100%)] animate-spin" style={{ animationDuration: '3s' }} />

                        {/* Button Content */}
                        <Link
                            href="/about"
                            className="relative w-full flex items-center gap-3 px-4 py-3.5 bg-[#1a2332] hover:bg-[#2d3748] rounded-[11px] transition-all duration-200 group-hover:text-white text-white/70 border border-transparent"
                        >
                            <Info size={20} className="text-[#a855f7] group-hover:text-[#c084fc] transition-colors" />
                            <span className="font-medium text-[15px]">About Dev</span>
                        </Link>
                    </div>
                </div>

                {/* Top Inner Shadow Overlay */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 pointer-events-none"></div>

            </aside>
        </>
    );
}
