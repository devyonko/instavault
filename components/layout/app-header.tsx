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
        <header className="w-full flex-none pt-16 lg:pt-0 relative z-40">
            {/* 
              Constraint Wrapper
              Matches the grid constraint: max-w-7xl mx-auto px-6 lg:px-10
              py-6 lg:py-10 matches the top spacing of page content usually, 
              but since this IS the top of the content, we generally want it inside the same padding context.
              However, pages usually define the padding on the container.
              
              To ensure alignment, this component assumes it's placed INSIDE the main flex-1 container,
              but potentially OUTSIDE the grid container if the grid container has its own padding.
              
              WAIT. The "Immutable Layout Rulebook" fix for Folders page put the Header INSIDE the max-w-7xl container.
              So this component should behave as a block that fills width.
              The PAGE is responsible for the max-w-7xl wrapper if it wraps EVERYTHING.
              
              BUT the objective says: "1. Create a global App Header... This component must Be w-full... Internally constrain content using: max-w-7xl mx-auto px-6".
              
              This suggests the PAGE should likely be:
              <div className="flex-1 ...">
                 <AppHeader ... />
                 <div className="max-w-7xl mx-auto px-6 ...">
                    <Grid />
                 </div>
              </div>
              OR
              <div className="flex-1 ...">
                 <div className="max-w-7xl mx-auto ...">
                    <AppHeader ... />
                    <Grid ... />
                 </div>
              </div>
              
              If the AppHeader internally constrains content, then it should be placed in a full-width context.
              Let's follow the instruction "Internally constrain content using: max-w-7xl mx-auto px-6".
            */}

            <div className="max-w-7xl mx-auto px-4 lg:px-8 w-full">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 lg:mb-10 lg:pt-8">

                    {/* LEFT SLOT: Title & Subtitle */}
                    <div className="w-full md:w-auto text-center md:text-left">
                        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent leading-tight">
                            {title}
                        </h1>
                        {subtitle && (
                            <div className="text-white/60 text-[15px] mt-1">
                                {subtitle}
                            </div>
                        )}
                    </div>

                    {/* CENTER & RIGHT SLOTS Wrapper */}
                    <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-3 lg:gap-4 relative z-0">

                        {/* CENTER SLOT: Search (Optional) */}
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

                        {/* RIGHT SLOT: Custom Actions */}
                        {children}

                        {/* ALWAYS PRESENT: Profile Menu (Visible on all screens) */}
                        <div className="relative z-50">
                            <ProfileMenu />
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
