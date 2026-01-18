/**
 * Generates thumbnails from video URLs using a hidden video element.
 * Includes a concurrent queue to prevent browser overloading.
 */

// Max concurrent video elements processing
const MAX_CONCURRENT = 2;
const QUEUE: Array<() => Promise<void>> = [];
let ACTIVE_COUNT = 0;

function processQueue() {
    if (ACTIVE_COUNT >= MAX_CONCURRENT || QUEUE.length === 0) return;

    ACTIVE_COUNT++;
    const task = QUEUE.shift();
    if (task) {
        task().finally(() => {
            ACTIVE_COUNT--;
            processQueue();
        });
    }
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        const wrappedTask = async () => {
            try {
                const result = await task();
                resolve(result);
            } catch (e) {
                reject(e);
            }
        };

        QUEUE.push(wrappedTask);
        processQueue();
    });
}

function generateThumbnail(videoUrl: string, quality = 0.7): Promise<string> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous'; // Important for canvas export
        video.src = videoUrl;
        video.muted = true;
        video.autoplay = false;
        video.playsInline = true;
        video.currentTime = 1.0; // Seek to 1s to capture content not black start

        // Timeout guard (10s)
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Thumbnail generation timed out'));
        }, 10000);

        function cleanup() {
            clearTimeout(timeout);
            video.pause();
            video.src = '';
            video.load();
            video.remove();
        }

        // Wait for seek to complete and data to be ready
        video.onloadeddata = () => {
            video.currentTime = 0.5; // Trigger a seek if needed, or just rely on 'seeked'
        };

        video.onseeked = () => {
            try {
                const canvas = document.createElement('canvas');
                // Target dimensions: optimized for 9:16 thumb but keep reasonable res
                // Let's use video's natural size but cap it to 480px width for performance
                let width = video.videoWidth;
                let height = video.videoHeight;

                // Downscale if too huge
                if (width > 480) {
                    const scale = 480 / width;
                    width = 480;
                    height = height * scale;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Could not get canvas context');

                ctx.drawImage(video, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);

                cleanup();
                resolve(dataUrl);

            } catch (e) {
                cleanup();
                reject(e);
            }
        };

        video.onerror = (e) => {
            cleanup();
            const event = e as Event;
            const target = event.target as HTMLVideoElement;
            const err = target.error as any;
            const msg = err?.message || 'Unknown error';
            reject(new Error(`Video load error: ${msg}`));
        };
    });
}

// Public API
export function requestThumbnailGeneration(videoUrl: string): Promise<string> {
    return enqueue(() => generateThumbnail(videoUrl));
}
