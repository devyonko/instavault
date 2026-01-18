'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project, PLACEHOLDER_IMAGE } from './types';

interface ImageLightboxProps {
    projects: Project[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    sourceRect: DOMRect | null;
    onCloseComplete?: () => void;
    onNavigate: (index: number) => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
    projects,
    currentIndex,
    isOpen,
    onClose,
    sourceRect,
    onCloseComplete,
    onNavigate,
}) => {
    const [animationPhase, setAnimationPhase] = useState<"initial" | "animating" | "complete">("initial");
    const [isClosing, setIsClosing] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);
    const [internalIndex, setInternalIndex] = useState(currentIndex);
    const [isSliding, setIsSliding] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const totalProjects = projects.length;
    const hasNext = internalIndex < totalProjects - 1;
    const hasPrev = internalIndex > 0;
    const currentProject = projects[internalIndex];

    useEffect(() => {
        if (isOpen && currentIndex !== internalIndex && !isSliding) {
            setIsSliding(true);
            const timer = setTimeout(() => {
                setInternalIndex(currentIndex);
                setIsSliding(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [currentIndex, isOpen, internalIndex, isSliding]);

    useEffect(() => {
        if (isOpen) {
            setInternalIndex(currentIndex);
            setIsSliding(false);
        }
    }, [isOpen, currentIndex]);

    const navigateNext = useCallback(() => {
        if (internalIndex >= totalProjects - 1 || isSliding) return;
        onNavigate(internalIndex + 1);
    }, [internalIndex, totalProjects, isSliding, onNavigate]);

    const navigatePrev = useCallback(() => {
        if (internalIndex <= 0 || isSliding) return;
        onNavigate(internalIndex - 1);
    }, [internalIndex, isSliding, onNavigate]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        onClose();
        setTimeout(() => {
            setIsClosing(false);
            setShouldRender(false);
            setAnimationPhase("initial");
            onCloseComplete?.();
        }, 500);
    }, [onClose, onCloseComplete]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === "Escape") handleClose();
            if (e.key === "ArrowRight") navigateNext();
            if (e.key === "ArrowLeft") navigatePrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        if (isOpen) document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleClose, navigateNext, navigatePrev]);

    useLayoutEffect(() => {
        if (isOpen && sourceRect) {
            setShouldRender(true);
            setAnimationPhase("initial");
            setIsClosing(false);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    setAnimationPhase("animating");
                });
            });
            const timer = setTimeout(() => {
                setAnimationPhase("complete");
            }, 700);
            return () => clearTimeout(timer);
        }
    }, [isOpen, sourceRect]);

    const handleDotClick = (idx: number) => {
        if (isSliding || idx === internalIndex) return;
        onNavigate(idx);
    };

    if (!shouldRender || !currentProject) return null;

    const getInitialStyles = (): React.CSSProperties => {
        if (!sourceRect) return {};
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const targetWidth = Math.min(800, viewportWidth - 64);
        const targetHeight = Math.min(viewportHeight * 0.85, 600);
        const targetX = (viewportWidth - targetWidth) / 2;
        const targetY = (viewportHeight - targetHeight) / 2;
        const scaleX = sourceRect.width / targetWidth;
        const scaleY = sourceRect.height / targetHeight;
        const scale = Math.max(scaleX, scaleY);
        const translateX = sourceRect.left + sourceRect.width / 2 - (targetX + targetWidth / 2) + window.scrollX;
        const translateY = sourceRect.top + sourceRect.height / 2 - (targetY + targetHeight / 2) + window.scrollY;
        return {
            transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
            opacity: 0.5,
            borderRadius: "12px",
        };
    };

    const getFinalStyles = (): React.CSSProperties => ({
        transform: "translate(0, 0) scale(1)",
        opacity: 1,
        borderRadius: "24px",
    });

    const currentStyles = animationPhase === "initial" && !isClosing ? getInitialStyles() : getFinalStyles();

    return (
        <div
            className={cn("fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8")}
            onClick={handleClose}
            style={{
                opacity: isClosing ? 0 : 1,
                transition: "opacity 500ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
        >
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                style={{
                    opacity: (animationPhase === "initial" && !isClosing) ? 0 : 1,
                    transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            />
            <button
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
                className={cn(
                    "absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl text-white hover:bg-white/20 transition-all duration-300",
                )}
                style={{
                    opacity: animationPhase === "complete" && !isClosing ? 1 : 0,
                    transform: animationPhase === "complete" && !isClosing ? "translateY(0)" : "translateY(-30px)",
                    transition: "opacity 400ms ease-out 400ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 400ms",
                }}
            >
                <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); navigatePrev(); }}
                disabled={!hasPrev || isSliding}
                className={cn(
                    "absolute left-4 md:left-10 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none shadow-2xl",
                )}
                style={{
                    opacity: animationPhase === "complete" && !isClosing && hasPrev ? 1 : 0,
                    transform: animationPhase === "complete" && !isClosing ? "translateX(0)" : "translateX(-40px)",
                    transition: "opacity 400ms ease-out 600ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 600ms",
                }}
            >
                <ChevronLeft className="w-6 h-6" strokeWidth={3} />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); navigateNext(); }}
                disabled={!hasNext || isSliding}
                className={cn(
                    "absolute right-4 md:right-10 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:scale-110 active:scale-95 transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none shadow-2xl",
                )}
                style={{
                    opacity: animationPhase === "complete" && !isClosing && hasNext ? 1 : 0,
                    transform: animationPhase === "complete" && !isClosing ? "translateX(0)" : "translateX(40px)",
                    transition: "opacity 400ms ease-out 600ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) 600ms",
                }}
            >
                <ChevronRight className="w-6 h-6" strokeWidth={3} />
            </button>
            <div
                ref={containerRef}
                className="relative z-10 w-full max-w-4xl"
                onClick={(e) => e.stopPropagation()}
                style={{
                    ...currentStyles,
                    transform: isClosing ? "translate(0, 0) scale(0.92)" : currentStyles.transform,
                    transition: animationPhase === "initial" && !isClosing ? "none" : "transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 600ms ease-out, border-radius 700ms ease",
                    transformOrigin: "center center",
                }}
            >
                <div className={cn("relative overflow-hidden rounded-[inherit] bg-[#1a1a1a] border border-white/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)]")}>
                    <div className="relative overflow-hidden aspect-[4/3] md:aspect-[16/10]">
                        <div
                            className="flex w-full h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{
                                transform: `translateX(-${internalIndex * 100}%)`,
                                transition: isSliding ? "transform 500ms cubic-bezier(0.16, 1, 0.3, 1)" : "none",
                            }}
                        >
                            {projects.map((project, idx) => (
                                <div key={project.id} className="min-w-full h-full relative">
                                    <img
                                        src={project.image || PLACEHOLDER_IMAGE}
                                        alt={project.title}
                                        className="w-full h-full object-cover select-none"
                                        onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div
                        className={cn("px-8 py-7 bg-[#1a1a1a] border-t border-white/5")}
                        style={{
                            opacity: animationPhase === "complete" && !isClosing ? 1 : 0,
                            transform: animationPhase === "complete" && !isClosing ? "translateY(0)" : "translateY(40px)",
                            transition: "opacity 500ms ease-out 500ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 500ms",
                        }}
                    >
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-2xl font-bold text-white tracking-tight truncate">{currentProject?.title}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/5">
                                        {projects.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleDotClick(idx)}
                                                className={cn("w-1.5 h-1.5 rounded-full transition-all duration-500", idx === internalIndex ? "bg-white scale-150" : "bg-white/30 hover:bg-white/60")}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{internalIndex + 1} / {totalProjects}</p>
                                </div>
                            </div>
                            <button className={cn("flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white bg-[#6366f1] hover:brightness-110 rounded-xl shadow-lg shadow-[#6366f1]/20 transition-all duration-300 hover:scale-105 active:scale-95")}>
                                <span>View Post</span>
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
