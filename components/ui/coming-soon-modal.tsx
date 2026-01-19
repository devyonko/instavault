'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
    feature: 'Community' | 'Subscription' | 'Help Center' | 'Portfolio';
}

export function ComingSoonModal({ isOpen, onClose, feature }: ComingSoonModalProps) {
    if (!isOpen) return null;

    const featureDetails = {
        Community: {
            title: 'Community Forum',
            description: 'Connect with other users, share tips, and discover new content!',
            features: [
                '💬 Discussion boards',
                '👥 User groups',
                '🎨 Share collections',
                '⭐ Featured creators'
            ]
        },
        Subscription: {
            title: 'Premium Subscription',
            description: 'Unlock advanced features and unlimited storage!',
            features: [
                '☁️ Unlimited storage',
                '⚡ Priority downloads',
                '🎯 Advanced analytics',
                '🎨 Custom themes'
            ]
        },
        'Help Center': {
            title: 'Help Center',
            description: 'Get assistance and learn how to use InstaVault!',
            features: [
                '📚 Documentation',
                '🎥 Video tutorials',
                '💡 Tips & tricks',
                '🐛 Report issues'
            ]
        },
        Portfolio: {
            title: 'Creative Portfolio',
            description: 'A showcase of 3D web experiences and UI experiments.',
            features: [
                '🎨 Interactive 3D Scenes',
                '✨ WebGL Experiments',
                '📱 UI/UX Case Studies',
                '🚀 Live Demos'
            ]
        }
    };

    const details = featureDetails[feature];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 border border-purple-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl shadow-purple-500/20 animate-in fade-in zoom-in-95">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                >
                    <X className="w-5 h-5 text-white" />
                </button>

                {/* Coming Soon Image */}
                <div className="flex justify-center mb-6">
                    <div className="relative w-48 h-48">
                        <Image
                            src="/flight/comingsoon.gif"
                            alt="Coming Soon"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {details.title}
                    </h2>
                    <p className="text-slate-400 text-lg mb-6">
                        {details.description}
                    </p>

                    {/* Features List */}
                    <div className="bg-white/5 rounded-2xl p-6 mb-6">
                        <div className="text-sm font-semibold mb-4 text-purple-300">Coming Features:</div>
                        <div className="space-y-3">
                            {details.features.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-left">
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-white">✓</span>
                                    </div>
                                    <span className="text-slate-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notify Me Button */}
                    <button className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold text-white transition-all transform hover:scale-105 active:scale-[0.98]">
                        Notify Me When Ready 🔔
                    </button>
                </div>

                {/* Footer */}
                <div className="text-center text-xs text-slate-500">
                    Expected launch: Q2 2025
                </div>
            </div>
        </div>
    );
}
