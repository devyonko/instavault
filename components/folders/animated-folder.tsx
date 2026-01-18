'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Project } from './types';
import { ProjectCard } from './project-card';
import { ImageLightbox } from './image-lightbox';

interface AnimatedFolderProps {
    title: string;
    projects?: Project[]; // Optional now
    fileCount?: number;   // New prop
    className?: string;
    gradient?: string;
}

export const AnimatedFolder: React.FC<AnimatedFolderProps> = ({ title, projects = [], fileCount = 0, className, gradient }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Dynamic label for file count
    const getCountLabel = () => {
        if (fileCount === 0) return "Empty folder";
        if (fileCount === 1) return "1 item";
        return `${fileCount} items`;
    };

    const backBg = gradient || "linear-gradient(135deg, var(--folder-back, #2d3748) 0%, var(--folder-tab, #4a5568) 100%)";
    const tabBg = gradient || "var(--folder-tab, #4a5568)";
    const frontBg = gradient || "linear-gradient(135deg, var(--folder-front, #4a5568) 0%, var(--folder-back, #2d3748) 100%)";

    return (
        <div
            className={cn("relative flex flex-col items-center justify-center p-6 rounded-2xl cursor-pointer bg-[#0f0f0f] border border-white/5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-2xl hover:shadow-[#6366f1]/20 hover:border-[#6366f1]/40 group aspect-[6/5] w-full", className)}
            style={{
                perspective: "1200px",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="absolute inset-0 rounded-2xl transition-opacity duration-700"
                style={{ background: gradient ? `radial-gradient(circle at 50% 70%, ${gradient.match(/#[a-fA-F0-9]{3,6}/)?.[0] || 'var(--accent)'} 0%, transparent 70%)` : "radial-gradient(circle at 50% 70%, #6366f1 0%, transparent 70%)", opacity: isHovered ? 0.2 : 0 }}
            />

            {/* Folder Icon Construction */}
            <div className="relative flex items-center justify-center mb-3 scale-110 lg:scale-125 transition-transform duration-500" style={{ height: "80px", width: "100px" }}>
                <div className="absolute w-20 h-16 rounded-lg shadow-md border border-white/10" style={{ background: backBg, filter: gradient ? "brightness(0.9)" : "none", transformOrigin: "bottom center", transform: isHovered ? "rotateX(-10deg) scaleY(1.05)" : "rotateX(0deg) scaleY(1)", transition: "transform 500ms ease", zIndex: 10 }} />
                <div className="absolute w-8 h-3 rounded-t-md border-t border-x border-white/10" style={{ background: tabBg, filter: gradient ? "brightness(0.85)" : "none", top: "calc(50% - 32px - 10px)", left: "calc(50% - 40px + 8px)", transformOrigin: "bottom center", transform: isHovered ? "rotateX(-15deg) translateY(-2px)" : "rotateX(0deg) translateY(0)", transition: "transform 500ms ease", zIndex: 10 }} />

                {/* Papers inside */}
                {fileCount > 0 && (
                    <div className="absolute w-16 h-12 bg-white/10 rounded-sm" style={{ top: "45%", transform: isHovered ? "translateY(-12px)" : "translateY(0)", transition: "transform 500ms ease", zIndex: 15 }} />
                )}

                <div className="absolute w-20 h-16 rounded-lg shadow-lg border border-white/20" style={{ background: frontBg, top: "calc(50% - 32px + 4px)", transformOrigin: "bottom center", transform: isHovered ? "rotateX(20deg) translateY(6px)" : "rotateX(0deg) translateY(0)", transition: "transform 500ms ease", zIndex: 30 }} />
            </div>

            <div className="text-center w-full relative z-40">
                <h3 className="text-[16px] font-semibold text-white truncate px-2">{title}</h3>
                <p className="text-[13px] text-white/50 mt-1">{getCountLabel()}</p>
            </div>
        </div>
    );
};
