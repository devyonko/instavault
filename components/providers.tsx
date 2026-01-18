'use client';

import { SessionProvider } from 'next-auth/react';
import { PreferencesProvider } from '@/components/providers/preferences-provider';
import { ActivityProvider } from '@/components/providers/activity-provider';
import { DownloadProvider } from '@/components/providers/download-provider';
import { DownloadProgress } from '@/components/ui/download-progress';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <PreferencesProvider>
                <ActivityProvider>
                    <DownloadProvider>
                        {children}
                        <DownloadProgress />
                    </DownloadProvider>
                </ActivityProvider>
            </PreferencesProvider>
        </SessionProvider>
    );
}
