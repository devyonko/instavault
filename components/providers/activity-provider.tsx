'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ActivityType = 'download' | 'error' | 'success' | 'info';

export interface ActivityItem {
    id: string;
    type: ActivityType;
    title: string;
    description: string;
    timestamp: number;
    read: boolean;
}

interface ActivityContextType {
    activities: ActivityItem[];
    notifications: ActivityItem[];
    addActivity: (type: ActivityType, title: string, description: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearActivity: () => void;
    unreadCount: number;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export function ActivityProvider({ children }: { children: ReactNode }) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('user_activity_log');
        if (saved) {
            try {
                setActivities(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse activity log", e);
            }
        }
        setMounted(true);
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('user_activity_log', JSON.stringify(activities));
        }
    }, [activities, mounted]);

    const addActivity = (type: ActivityType, title: string, description: string) => {
        const newItem: ActivityItem = {
            id: crypto.randomUUID(),
            type,
            title,
            description,
            timestamp: Date.now(),
            read: false
        };
        setActivities(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50
    };

    const markAsRead = (id: string) => {
        setActivities(prev => prev.map(item => item.id === id ? { ...item, read: true } : item));
    };

    const markAllAsRead = () => {
        setActivities(prev => prev.map(item => ({ ...item, read: true })));
    };

    const clearActivity = () => {
        setActivities([]);
    };

    const unreadCount = activities.filter(a => !a.read).length;

    return (
        <ActivityContext.Provider value={{
            activities,
            notifications: activities, // For now same list, can be separated if needed
            addActivity,
            markAsRead,
            markAllAsRead,
            clearActivity,
            unreadCount
        }}>
            {children}
        </ActivityContext.Provider>
    );
}

export function useActivity() {
    const context = useContext(ActivityContext);
    if (context === undefined) {
        throw new Error('useActivity must be used within an ActivityProvider');
    }
    return context;
}
