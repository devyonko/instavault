'use client';

import { usePathname } from 'next/navigation';
import ProceduralGroundBackground from './procedural-ground-background';

export default function BackgroundWrapper() {
    const pathname = usePathname();

    // Exclude Login page
    if (pathname === '/login') {
        return null;
    }

    return <ProceduralGroundBackground />;
}
