'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export default function AuroraBackground() {
    const pathname = usePathname();

    // Exclude login page (adjust path if your login page is at /login or /sign-in)
    if (pathname === '/login' || pathname === '/signin') {
        return null;
    }

    return <div className="aurora-container" />;
}
