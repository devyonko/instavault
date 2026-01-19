'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
    User,
    Users,
    CreditCard,
    Settings as SettingsIcon,
    HelpCircle,
    LogOut,
    ChevronDown
} from 'lucide-react';
import { ComingSoonModal } from './coming-soon-modal';
import { useRouter } from 'next/navigation';
import { usePreferences } from '@/components/providers/preferences-provider';
import { useMediaQuery } from '@/hooks/use-media-query';

export default function ProfileMenu() {
    const { data: session } = useSession();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { userAvatar } = usePreferences(); // Get custom avatar from context
    const isDesktop = useMediaQuery('(min-width: 1024px)');

    // Coming Soon State
    const [comingSoonModal, setComingSoonModal] = useState<{
        isOpen: boolean;
        feature: 'Community' | 'Subscription' | 'Help Center' | null;
    }>({ isOpen: false, feature: null });

    // User Data - STRICTLY from Session
    const userEmail = session?.user?.email;
    const userName = session?.user?.name;

    // Display Logic: Custom Avatar > Google Image > Placeholder
    const displayImage = userAvatar || session?.user?.image;

    // If session is loading or not present (and not redirected yet), show nothing or skeleton
    // This removes the "User / user@example.com" flash
    if (!session?.user) return null;

    const showComingSoon = (feature: 'Community' | 'Subscription' | 'Help Center') => {
        setIsOpen(false);
        setComingSoonModal({ isOpen: true, feature });
    };

    return (
        <>
            <div className={`relative ${isOpen ? 'z-50' : ''}`}>
                {/* Profile Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                >
                    {/* Dynamic Profile Picture */}
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-purple-500/50">
                        {displayImage ? (
                            <img
                                src={displayImage}
                                alt={userName ?? "User"} // Fallback for alt text only
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            // Fallback gradient avatar
                            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm font-bold text-white">
                                {userName?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Dropdown Menu / Bottom Sheet */}
                <AnimatePresence>
                    {isOpen && (
                        <>
                            {/* Backdrop to close on outside click */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:bg-transparent lg:backdrop-blur-none"
                                onClick={() => setIsOpen(false)}
                            />

                            {/* Menu */}
                            <motion.div
                                // Desktop Animation
                                initial={isDesktop ? { opacity: 0, y: 10, scale: 0.95 } : { y: "100%" }}
                                animate={isDesktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
                                exit={isDesktop ? { opacity: 0, y: 10, scale: 0.95 } : { y: "100%" }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className={`
                                    z-50 font-sans overflow-hidden
                                    fixed bottom-0 left-0 w-full bg-[#18181b] rounded-t-[2rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
                                    lg:absolute lg:top-full lg:right-0 lg:bottom-auto lg:left-auto lg:w-72 lg:mt-2
                                    lg:bg-[#0f0f0f]/95 lg:backdrop-blur-xl lg:border lg:border-purple-500/30 lg:rounded-2xl lg:shadow-2xl lg:shadow-purple-500/20
                                `}
                            >
                                {/* Mobile Pull Indicator */}
                                <div className="w-full flex justify-center pt-3 pb-1 lg:hidden">
                                    <div className="w-12 h-1.5 rounded-full bg-white/20" />
                                </div>

                                {/* User Info Section */}
                                <div className="p-5 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/50 flex-shrink-0 shadow-lg shadow-purple-500/10">
                                            {displayImage ? (
                                                <img
                                                    src={displayImage}
                                                    alt={userName ?? "User"} // Fallback for alt text only
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white">
                                                    {userName?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="font-bold text-white truncate text-base">{userName}</div>
                                            <div className="text-xs text-gray-400 truncate mt-0.5">{userEmail}</div>
                                            <div className="text-[10px] text-purple-400 font-medium mt-1.5 px-2 py-0.5 bg-purple-500/10 rounded-full inline-block border border-purple-500/20">
                                                Free Plan
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="p-2 space-y-1 pb-8 lg:pb-2">
                                    {/* Profile */}
                                    <MenuItem
                                        icon={User}
                                        label="Profile"
                                        onClick={() => {
                                            router.push('/about');
                                            setIsOpen(false);
                                        }}
                                    />

                                    {/* Community - Coming Soon */}
                                    <MenuItem
                                        icon={Users}
                                        label="Community"
                                        badge="COMING SOON"
                                        onClick={() => showComingSoon('Community')}
                                    />

                                    {/* Subscription - Coming Soon */}
                                    <MenuItem
                                        icon={CreditCard}
                                        label="Subscription"
                                        badge="COMING SOON"
                                        badgeColor="pro"
                                        onClick={() => showComingSoon('Subscription')}
                                    />

                                    {/* Settings */}
                                    <MenuItem
                                        icon={SettingsIcon}
                                        label="Settings"
                                        onClick={() => {
                                            router.push('/settings');
                                            setIsOpen(false);
                                        }}
                                    />

                                    <div className="h-[1px] bg-white/10 mx-2 my-1" />

                                    {/* Help Center - Coming Soon */}
                                    <MenuItem
                                        icon={HelpCircle}
                                        label="Help Center"
                                        badge="COMING SOON"
                                        onClick={() => showComingSoon('Help Center')}
                                    />

                                    {/* Sign Out */}
                                    <MenuItem
                                        icon={LogOut}
                                        label="Sign Out"
                                        danger
                                        onClick={async () => {
                                            await signOut({ callbackUrl: '/login' });
                                        }}
                                    />
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Coming Soon Modal */}
            <ComingSoonModal
                isOpen={comingSoonModal.isOpen && comingSoonModal.feature !== null}
                onClose={() => setComingSoonModal({ isOpen: false, feature: null })}
                feature={comingSoonModal.feature!}
            />
        </>
    );
}

// Menu Item Component
function MenuItem({ icon: Icon, label, badge, badgeColor, danger, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${danger
                ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
        >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1 text-left text-sm font-medium">{label}</span>
            {badge && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg ${badgeColor === 'pro'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/20'
                    : 'bg-white/10 text-gray-400 border border-white/10'
                    }`}>
                    {badge}
                </span>
            )}
        </button>
    );
}
