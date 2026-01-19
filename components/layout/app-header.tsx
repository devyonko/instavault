'use client';

import React from 'react';
import { SearchBar } from '@/components/ui/search-bar';
import ProfileMenu from '@/components/ui/profile-menu';

interface AppHeaderProps {
    /** The main page title (e.g. "Dashboard", "Gallery") */
    title: string;
    /** Optional subtitle or status text */
    subtitle?: React.ReactNode;
    /** Optional placeholder for the search bar */
    searchPlaceholder?: string;
    /** Callback for search input. If provided, search bar is shown. */
    onSearch?: (term: string) => void;
    /** Optional custom actions (Filter, New Folder, etc.) to render before the Profile */
    children?: React.ReactNode;
}

/**
 * Global AppHeader Component
 * 
 * Implements the system-wide header layout rules:
 * - Full width outer container
 * - Constrained inner content (max-w-7xl mx-auto px-6) to match page grids
 * - 3-zone layout: Title | Search | Actions
 * - Responsive behavior: 
 *   - Desktop: Row layout, centered search
 *   - Mobile: Stacked or adjusted layout, always preserving access to Profile
 */
export const AppHeader: React.FC<AppHeaderProps> = ({
    title,
    subtitle,
    searchPlaceholder = "Search...",
    onSearch,
    children
}) => {
    return (
        <header className="w-full flex-none relative z-40 sticky top-0 bg-[#030303]/80 backdrop-blur-md border-b border-white/5 md:bg-transparent md:backdrop-blur-none md:border-none md:static">

            <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full py-4 lg:py-10">
                {/* 
                    MOBILE LAYOUT STRATEGY (Grid):
                    [Hamburger Space] [Title (Centered)] [Profile]
                    [       Search / Actions (Full Width)      ]
                */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-4">

                    {/* TOP ROW (Mobile) / LEFT & RIGHT (Desktop) */}
                    <div className="grid grid-cols-[40px_1fr_auto] items-center md:flex md:w-full md:justify-between">

                        {/* 1. HAMBURGER SPACER (Mobile Only) */}
                        <div className="md:hidden"></div>

                        {/* 2. TITLE SECTION */}
                        <div className="text-center md:text-left md:flex-1">
                            <h1 className="text-xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight truncate">
                                {title}
                            </h1>
                            {subtitle && (
                                <div className="text-white/60 text-[11px] lg:text-[15px] mt-0.5 lg:mt-1 truncate max-w-[200px] mx-auto md:mx-0 md:max-w-none">
                                    {subtitle}
                                </div>
                            )}
                        </div>

                        {/* 3. PROFILE (Always Top Right) */}
                        <div className="flex justify-end md:order-last md:ml-4">
                            <ProfileMenu />
                        </div>
                    </div>

                    {/* BOTTOM ROW (Mobile) / CENTER (Desktop) */}
                    <div className="w-full md:w-auto flex flex-wrap items-center justify-start md:justify-end gap-3 lg:gap-4">

                        {/* Search */}
                        {onSearch && (
                            <div className="w-full md:w-auto">
                                <SearchBar
                                    variant="compact"
                                    placeholder={searchPlaceholder}
                                    onSearch={onSearch}
                                    className="w-full md:w-[240px]"
                                />
                            </div>
                        )}

                        {/* Actions (Filter, Buttons) */}
                        {children}
                    </div>

                </div>
            </div>
        </header>
    );
};
