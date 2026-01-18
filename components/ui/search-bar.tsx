import React, { useState, useEffect, useRef } from 'react';
import styles from './search-bar.module.css';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
    className?: string;
    variant?: 'hero' | 'compact';
    onFilterClick?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = "Search...",
    onSearch,
    className = "",
    variant = 'hero',
    onFilterClick
}) => {
    const isDesktop = useMediaQuery("(min-width: 1024px)");
    const [isMobileExpanded, setIsMobileExpanded] = useState(false);
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle click outside to close mobile search
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsMobileExpanded(false);
            }
        };

        if (isMobileExpanded && !isDesktop) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobileExpanded, isDesktop]);

    if (!mounted) return null;

    // Mobile View (unchanged)
    if (!isDesktop) {
        return (
            <div ref={containerRef} className={cn("relative z-50", className)}>
                {isMobileExpanded ? (
                    <div className="absolute right-0 -top-2 flex items-center gap-2 bg-[#18181b] p-2 border border-white/10 rounded-xl shadow-2xl animate-in fade-in slide-in-from-right-5 w-[calc(100vw-80px)] max-w-[350px]">
                        <Search size={18} className="text-gray-400 shrink-0 ml-1" />
                        <input
                            autoFocus
                            type="text"
                            placeholder={placeholder}
                            className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-500"
                            onChange={(e) => onSearch?.(e.target.value)}
                        />
                        <button
                            onClick={() => {
                                setIsMobileExpanded(false);
                                onSearch?.('');
                            }}
                            className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsMobileExpanded(true)}
                        className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all active:scale-95"
                    >
                        <Search size={20} className="text-white" />
                    </button>
                )}
            </div>
        );
    }

    // Unified Desktop View (Glowing)
    // Applies 'compact' class if variant is compact
    return (
        <div className={cn(styles.container, variant === 'compact' && styles.compact, className)}>
            {/* Background Glows and Borders */}
            <div className={styles.grid}></div>
            <div className={styles.glow}></div>
            <div className={styles.darkBorderBg}></div>
            <div className={styles.darkBorderBg}></div>
            <div className={styles.darkBorderBg}></div>
            <div className={styles.white}></div>
            <div className={styles.border}></div>

            <div className={styles.main}>
                <input
                    placeholder={placeholder}
                    type="text"
                    className={styles.input}
                    onChange={(e) => onSearch?.(e.target.value)}
                />
                <div className={styles.inputMask}></div>
                <div className={styles.pinkMask}></div>

                <div className={styles.filterBorder}></div>
                <div
                    className={styles.filterIcon}
                    onClick={onFilterClick}
                    role="button"
                    tabIndex={0}
                >
                    <svg
                        preserveAspectRatio="none"
                        height="27"
                        width="27"
                        viewBox="4.8 4.56 14.832 15.408"
                        fill="none"
                    >
                        <path
                            d="M8.16 6.65002H15.83C16.47 6.65002 16.99 7.17002 16.99 7.81002V9.09002C16.99 9.56002 16.7 10.14 16.41 10.43L13.91 12.64C13.56 12.93 13.33 13.51 13.33 13.98V16.48C13.33 16.83 13.1 17.29 12.81 17.47L12 17.98C11.24 18.45 10.2 17.92 10.2 16.99V13.91C10.2 13.5 9.97 12.98 9.73 12.69L7.52 10.36C7.23 10.08 7 9.55002 7 9.20002V7.87002C7 7.17002 7.52 6.65002 8.16 6.65002Z"
                            stroke="#d6d6e6"
                            strokeWidth="1"
                            strokeMiterlimit="10"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        ></path>
                    </svg>
                </div>

                <div className={styles.searchIcon}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        height="24"
                        fill="none"
                    >
                        <circle stroke="url(#search)" r="8" cy="11" cx="11"></circle>
                        <line
                            stroke="url(#searchl)"
                            y2="16.65"
                            y1="22"
                            x2="16.65"
                            x1="22"
                        ></line>
                        <defs>
                            <linearGradient gradientTransform="rotate(50)" id="search">
                                <stop stopColor="#f8e7f8" offset="0%"></stop>
                                <stop stopColor="#b6a9b7" offset="50%"></stop>
                            </linearGradient>
                            <linearGradient id="searchl">
                                <stop stopColor="#b6a9b7" offset="0%"></stop>
                                <stop stopColor="#837484" offset="50%"></stop>
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>
        </div>
    );
};
