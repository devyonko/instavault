/**
 * Lightweight IndexedDB wrapper for storing video thumbnails.
 * Database: InstaSaveDB
 * Store: thumbnails (key: fileId, value: Blob/DataURL)
 */

const DB_NAME = 'InstaSaveDB';
const STORE_NAME = 'thumbnails';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        if (typeof window === 'undefined') {
            reject(new Error('IndexedDB not supported on server'));
            return;
        }

        // console.log('[ThumbnailDB] Opening DB...');
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            // console.log('[ThumbnailDB] Upgrading DB...');
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            // console.log('[ThumbnailDB] DB Open Success');
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            console.error('[ThumbnailDB] DB Open Error', (event.target as IDBOpenDBRequest).error);
            reject((event.target as IDBOpenDBRequest).error);
        };
    });

    return dbPromise;
}

export async function getThumbnailFromDB(id: string): Promise<string | null> {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn('Failed to get thumbnail from DB', e);
        return null; // Fail gracefully
    }
}

export async function saveThumbnailToDB(id: string, dataUrl: string): Promise<void> {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(dataUrl, id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (e) {
        console.warn('Failed to save thumbnail to DB', e);
    }
}
