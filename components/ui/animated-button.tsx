'use client';

import React from 'react';

interface AnimatedButtonProps {
    label: string;
    onClick?: () => void;
}

export default function AnimatedButton({ label, onClick }: AnimatedButtonProps) {
    return (
        <button className="animated-btn" onClick={onClick}>
            {label}
        </button>
    );
}
