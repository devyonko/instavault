'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { PLACEHOLDER_IMAGE } from './types';

interface ProjectCardProps {
    image: string;
    title: string;
    delay: number;
    isVisible: boolean;
    index: number;
    totalCount: number;
    onClick: () => void;
    isSelected: boolean;
}

export const ProjectCard = forwardRef<HTMLDivElement, ProjectCardProps>(
    ({ image, title, delay, isVisible, index, totalCount, onClick, isSelected }, ref) => {
        const middleIndex = (totalCount - 1) / 2;
        const factor = totalCount > 1 ? (index - middleIndex) / middleIndex : 0;

        const rotation = factor * 25;
        const translationX = factor * 85;
        const translationY = Math.abs(factor) * 12;

        return (
            <div
                ref={ref}
                className={cn(
                    "absolute w-20 h-28 cursor-pointer group/card",
                    isSelected && "opacity-0",
                )}
                style={{
                    transform: isVisible
                        ? `translateY(calc(-100px + ${translationY}px)) translateX(${translationX}px) rotate(${rotation}deg) scale(1)`
                        : "translateY(0px) translateX(0px) rotate(0deg) scale(0.4)",
                    opacity: isSelected ? 0 : isVisible ? 1 : 0,
                    transition: `all 700ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
                    zIndex: 10 + index,
                    left: "-40px",
                    top: "-56px",
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <div className={cn(
                    "w-full h-full rounded-lg overflow-hidden shadow-xl bg-card border border-white/5 relative",
                    "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "group-hover/card:-translate-y-6 group-hover/card:shadow-2xl group-hover/card:shadow-accent/40 group-hover/card:ring-2 group-hover/card:ring-accent group-hover/card:scale-125"
                )}>
                    <img
                        src={image || PLACEHOLDER_IMAGE}
                        alt={title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    <p className="absolute bottom-1.5 left-1.5 right-1.5 text-[9px] font-black uppercase tracking-tighter text-white truncate drop-shadow-md">
                        {title}
                    </p>
                </div>
            </div>
        );
    }
);
ProjectCard.displayName = "ProjectCard";
