'use client';

import React from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import ProfileMenu from '@/components/ui/profile-menu';
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface AppHeaderProps {
    /** The main page title (e.g. "Dashboard", "Gallery") */
    title: string | React.ReactNode;
    /** Optional subtitle or status text */
    subtitle?: React.ReactNode;
    /** Optional placeholder for the search bar */
    searchPlaceholder?: string;
    /** Callback for search input. If provided, search bar is shown. */
    onSearch?: (term: string) => void;
    /** Optional custom actions (Filter, New Folder, etc.) to render in the MAIN content area (Bottom on mobile, Right on desktop) */
    children?: React.ReactNode;
    /** Optional secondary actions (NotificationBell) to render in the TOP ROW on mobile (Right on desktop) */
    actions?: React.ReactNode;
}

/**
 * Global AppHeader Component
 * 
 * Implements the system-wide header layout rules:
 * - Mobile: sticky top-0, single row preference + expansion for tools
 * - Desktop: flex row, 3-zone layout
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    subtitle,
    searchPlaceholder = "Search...",
    onSearch,
    children,
    actions
}) => {
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    return (
        <header className="w-full flex-none relative z-40 sticky top-0 bg-[#030303]/90 backdrop-blur-xl border-b border-white/5 md:bg-transparent md:backdrop-blur-none md:border-none md:static transition-all duration-300">

            <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full py-3 lg:py-10">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">

                    {/* --- MOBILE TOP ROW --- */}
                    {/* Grid: [Hamburger Space] [Title] [Right Actions] */}
                    <div className="grid grid-cols-[48px_1fr_auto] items-center md:flex md:w-full md:justify-between">

                        {/* 1. HAMBURGER SPACER (Mobile Only) */}
                        <div className="md:hidden"></div>

                        {/* 2. TITLE SECTION */}
                        <div className="flex flex-col items-center md:items-start md:flex-1 min-w-0 px-2">
                            {/* Allow title to be a node (Icon) or text */}
                            {typeof title === 'string' ? (
                                <h1 className="text-lg lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight truncate max-w-full">
                                    {title}
                                </h1>
                            ) : (
                                title
                            )}
                            {subtitle && (
                                <div className="text-white/60 text-[11px] lg:text-[15px] mt-0.5 lg:mt-1 truncate max-w-[150px] mx-auto md:mx-0 md:max-w-none">
                                    {subtitle}
                                </div>
                            )}
                        </div>

                        {/* 3. RIGHT ICONS (Search, Actions, Profile) */}
                        <div className="flex items-center justify-end gap-1 md:gap-4 md:order-last md:ml-4">

                            {/* Mobile Search Toggle */}
                            {onSearch && (
                                <button
                                    onClick={() => setShowMobileSearch(!showMobileSearch)}
                                    className="md:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    {showMobileSearch ? <X size={20} /> : <Search size={20} />}
                                </button>
                            )}

                            {/* Actions Slot (Notifications) */}
                            {actions && (
                                <div className="flex items-center">
                                    {actions}
                                </div>
                            )}

                            {/* Profile */}
                            <div className="pl-1">
                                <ProfileMenu />
                            </div>
                        </div>
                    </div>

                    {/* --- SECONDARY ROW (Search Bar + Main Actions) --- */}
                    {/* Visible if children exist OR if Search is enabled (Desktop: Always, Mobile: Conditional) */}
                    <div className={`
                        w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center justify-start md:justify-end gap-3 lg:gap-4
                        ${(children || (onSearch && (showMobileSearch || /* Always show on desktop? No, logic below handles desktop layout structure */ false))) ? 'flex' : 'hidden md:flex'}
                    `}>

                        {/* Search Bar */}
                        {onSearch && (
                            <div className={`${showMobileSearch ? 'block' : 'hidden'} md:block w-full md:w-auto animate-in slide-in-from-top-2 duration-200`}>
                                <SearchBar
                                    variant="compact"
                                    placeholder={searchPlaceholder}
                                    onSearch={onSearch}
                                    className="w-full md:w-[240px]"
                                />
                            </div>
                        )}

                        {/* Main Actions (Filter, Buttons) */}
                        {children && (
                            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
                                {children}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
};
