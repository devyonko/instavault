import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface HeaderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    icon?: React.ElementType;
    loading?: boolean;
}

export const HeaderButton: React.FC<HeaderButtonProps> = ({
    children,
    className,
    variant = 'secondary',
    icon: Icon,
    loading,
    disabled,
    ...props
}) => {
    const variants = {
        primary: "bg-[#6366f1] hover:bg-[#4f46e5] text-white border-transparent shadow-[0_2px_10px_rgba(99,102,241,0.3)]",
        secondary: "bg-[#1a1a1a] hover:bg-[#252525] text-white/90 border-white/10 hover:border-white/20",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20",
        ghost: "bg-transparent hover:bg-white/5 text-white/60 hover:text-white border-transparent"
    };

    return (
        <button
            disabled={disabled || loading}
            className={cn(
                "h-10 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200 border flex-shrink-0 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                className
            )}
            {...props}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : Icon ? (
                <Icon size={16} className={cn("shrink-0", variant === 'secondary' ? "text-gray-400" : "currentColor")} />
            ) : null}
            <span className="whitespace-nowrap">{children}</span>
        </button>
    );
};
