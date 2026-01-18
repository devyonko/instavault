import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortOption {
    label: string;
    value: string;
}

interface SortDropdownProps {
    value: string;
    onChange: (value: string) => void;
    options: SortOption[];
    className?: string;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
    value,
    onChange,
    options,
    className
}) => {
    return (
        <div className={cn("relative group z-20 h-10 flex-shrink-0", className)}>
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Filter size={14} className="text-gray-400" />
            </div>

            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-full w-full appearance-none pl-9 pr-10 bg-[#1a1a1a] border border-white/10 rounded-xl focus:outline-none focus:border-[#6366f1] text-sm cursor-pointer hover:bg-[#252525] transition-colors text-white/90 min-w-[160px]"
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-400 transition-colors" />
            </div>
        </div>
    );
};
