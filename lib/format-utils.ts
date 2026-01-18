
/**
 * Formats a raw filename into a human-readable video title.
 * Priority:
 * 1. "Reel by {author}" (if filename matches pattern)
 * 2. "Instagram Reel - {Date}" (Fallback)
 */
export function formatVideoName(filename: string, createdTime?: string): string {
    // 1. Try to parse "Video_by_AUTHOR_ID" pattern
    // Typical format: "Video_by_mira_iedits_DP3PyFnKRNU_..."
    const authorMatch = filename.match(/^Video_by_([^_]+)_/);
    if (authorMatch && authorMatch[1]) {
        // Clean up author name (replace remaining underscores if any, though usually the first part is the name)
        // If the caption was long, it might be "Video_by_author_caption..."
        // Let's try to grab the segment after "Video_by_"
        const parts = filename.split('_');
        if (parts.length >= 3 && parts[0] === 'Video' && parts[1] === 'by') {
            // parts[2] is likely the author
            return `Reel by @${parts[2]}`;
        }
    }

    // Pattern 2: Maybe it's just "insta_123..."
    // If no clear author pattern, use Date fallback
    if (createdTime) {
        try {
            const date = new Date(createdTime);
            // Format: Jan 17, 2026
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `Instagram Reel • ${dateStr}`;
        } catch (e) {
            // ignore invalid date
        }
    }

    // Final Fallback: Clean up extension
    return filename.replace(/\.[^/.]+$/, "").substring(0, 30);
}

/**
 * Session storage keys
 */
export const CACHE_KEYS = {
    FOLDERS_LIST: 'instavault_folders_list',
    GALLERY_ALL: 'instavault_gallery_all',
    FOLDER_CONTENTS: (id: string) => `instavault_folder_${id}`
};

/**
 * Helper to save to cache with timestamp
 */
export function saveToCache(key: string, data: any) {
    if (typeof window === 'undefined') return;
    try {
        const payload = {
            timestamp: Date.now(),
            data
        };
        sessionStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {
        console.warn('Cache save failed', e);
    }
}

/**
 * Helper to load from cache if valid (TTL in ms)
 * Default TTL: 60 seconds
 */
export function loadFromCache(key: string, ttl = 60000) {
    if (typeof window === 'undefined') return null;
    try {
        const item = sessionStorage.getItem(key);
        if (!item) return null;

        const payload = JSON.parse(item);
        const age = Date.now() - payload.timestamp;

        if (age < ttl) {
            return payload.data;
        }
        return null; // Expired
    } catch (e) {
        console.warn('Cache load failed', e);
        return null;
    }
}
/**
 * Helper to invalidate a specific cache key
 */
export function invalidateCache(key: string) {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.removeItem(key);
    } catch (e) {
        console.warn('Cache invalidate failed', e);
    }
}

/**
 * Helper to invalidate all cache keys starting with a prefix
 * Useful for clearing all folder caches
 */
export function invalidateCachePrefix(prefix: string) {
    if (typeof window === 'undefined') return;
    try {
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith(prefix)) {
                sessionStorage.removeItem(key);
            }
        });
    } catch (e) {
        console.warn('Cache prefix invalidate failed', e);
    }
}
