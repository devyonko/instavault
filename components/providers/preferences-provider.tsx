'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Total number of available avatars (matching our assets)
const TOTAL_AVATARS = 39;

interface PreferencesContextType {
    userAvatar: string;
    randomizeAvatar: () => void;
    setAvatar: (index: number) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
    const [userAvatar, setUserAvatar] = useState<string>('');

    useEffect(() => {
        // Run on client mount
        const storedAvatar = localStorage.getItem('instaVault_avatar');

        if (storedAvatar) {
            setUserAvatar(storedAvatar);
        } else {
            // First time logic: Pick random
            randomizeAvatar();
        }
    }, []);

    const randomizeAvatar = () => {
        // Random number between 1 and TOTAL_AVATARS
        const randomIndex = Math.floor(Math.random() * TOTAL_AVATARS) + 1;
        const newAvatar = `/avatars/avatar-${randomIndex}.jpg`;

        setUserAvatar(newAvatar);
        localStorage.setItem('instaVault_avatar', newAvatar);
    };

    const setAvatar = (index: number) => {
        if (index < 1 || index > TOTAL_AVATARS) return;
        const newAvatar = `/avatars/avatar-${index}.jpg`;
        setUserAvatar(newAvatar);
        localStorage.setItem('instaVault_avatar', newAvatar);
    };

    return (
        <PreferencesContext.Provider value={{ userAvatar, randomizeAvatar, setAvatar }}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}
