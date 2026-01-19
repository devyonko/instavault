import fs from "fs";
import path from "path";
import axios from "axios";

// --- CONFIGURATION ---
const RATE_LIMIT_MS = 15000; // 15 seconds
const RETRY_DELAY = 2000; // Wait 2s if needed (though we mostly wait for rate limit)

// --- GLOBAL STATE ---
// In-memory cache: URL -> Metadata
const MEDIA_CACHE = new Map<string, VideoMetadata>();
let lastRequestTime = 0;

export interface VideoMetadata {
    title: string;
    url: string; // Direct download URL (CDN)
    thumbnail: string;
    width: number;
    height: number;
    ext: string;
    id: string;
}

/**
 * Validates if the URL is a supported specific public post/reel
 */
function isValidInstagramUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        // Must be instagram.com
        if (!parsed.hostname.includes("instagram.com")) return false;
        // Must be /p/ or /reel/
        // /stories/ is REJECTED
        return /\/(p|reel)\/[\w-]+\/?/.test(parsed.pathname);
    } catch {
        return false;
    }
}

/**
 * Enforces global rate limiting.
 * If called too soon, it WAITS until the cooldown passes.
 */
async function waitForRateLimit() {
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;

    if (timeSinceLast < RATE_LIMIT_MS) {
        const waitTime = RATE_LIMIT_MS - timeSinceLast;
        console.log(`[InstagramLib] Rate limit active. Waiting ${waitTime / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Update last request time immediately (optimistic)
    lastRequestTime = Date.now();
}

/**
 * Resolves Instagram URL to Video Metadata using PUBLIC OpenGraph tags only.
 * No API Login. No Cookies.
 */
export async function getInstagramVideo(postUrl: string): Promise<VideoMetadata> {

    // 1. GATEKEEPER
    if (!isValidInstagramUrl(postUrl)) {
        throw new Error("Invalid or unsupported URL. Only public /p/ and /reel/ URLs are allowed.");
    }

    // Normalize URL for cache key (remove query params)
    const cleanUrl = postUrl.split('?')[0];

    // 2. CACHE CHECK (Hard Cache)
    if (MEDIA_CACHE.has(cleanUrl)) {
        console.log(`[InstagramLib] Cache HIT for: ${cleanUrl}`);
        return MEDIA_CACHE.get(cleanUrl)!;
    }

    console.log(`[InstagramLib] Resolving PUBLIC URL: ${cleanUrl}`);

    // 3. RATE LIMIT
    await waitForRateLimit();

    try {
        // 4. FETCH HTML (No Cookies/Auth)
        // User-Agent: FacebookBot or similar sometimes gets better OpenGraph results, 
        // but standard browser UA is safer to look "public".
        // "Instagram 219.0.0.12.117 Android" might trigger API limits.
        // Let's use a generic desktop UA.
        const response = await axios.get(cleanUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 10000 // 10s timeout
        });

        const html = response.data;

        // 5. PARSE METADATA (Regex)
        // Look for <meta property="og:video" content="..." />
        const videoMatch = html.match(/<meta property="og:video" content="([^"]+)"/);
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
        const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);

        if (!videoMatch || !videoMatch[1]) {
            // Check if it's actually an image post or private
            if (html.includes("Login • Instagram")) {
                throw new Error("Content is private or requires login. We only support public posts.");
            }
            throw new Error("No video found. This might be an image post or private reel.");
        }

        const videoUrl = videoMatch[1].replace(/&amp;/g, '&'); // Decode HTML entities
        const thumbnailUrl = imageMatch ? imageMatch[1].replace(/&amp;/g, '&') : "";
        const titleRaw = titleMatch ? titleMatch[1] : "Instagram Reel";

        // Clean title: "Name on Instagram: 'Caption'" -> "Caption"
        // Usually OpenGraph title is "Name on Instagram: \"Caption\""
        const cleanTitle = titleRaw.replace(/^.+ on Instagram: "(.+)"$/, "$1").substring(0, 100);

        const id = extractPostId(cleanUrl);

        const metadata: VideoMetadata = {
            title: cleanTitle || `Insta_Reel_${id}`,
            url: videoUrl,
            thumbnail: thumbnailUrl,
            width: 0, // Not available in OG
            height: 0, // Not available in OG
            ext: "mp4",
            id: id
        };

        // 6. SAVE TO CACHE
        MEDIA_CACHE.set(cleanUrl, metadata);
        console.log(`[InstagramLib] Cache SAVED for: ${cleanUrl}`);

        return metadata;

    } catch (error: any) {
        console.error(`[InstagramLib] Resolution Failed: ${error.message}`);
        // Do NOT retry. Fail gracefully.
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 429 || error.response?.status === 401) {
                throw new Error("Instagram is temporarily blocking public requests. Please try again later.");
            }
            if (error.response?.status === 404) {
                throw new Error("Post not found (404). Check the URL.");
            }
        }
        throw new Error("This content is temporarily unavailable. Please try again later.");
    }
}

/**
 * Downloads the video to a local path using axios stream.
 * USES CACHE via getInstagramVideo.
 */
export async function downloadVideoToLocal(postUrl: string, outputDir: string, safeFilenameBase: string): Promise<{ path: string, mimeType: string, filename: string }> {
    try {
        // 1. Get Direct URL (Uses Cache + Rate Limit internally)
        const meta = await getInstagramVideo(postUrl);
        const downloadUrl = meta.url;

        // 2. Download Stream
        const outputPath = path.join(outputDir, `${safeFilenameBase}.mp4`);
        const writer = fs.createWriteStream(outputPath);

        // Download the ACTUAL video file from CDN
        // CDN requests usually don't need strict rate limiting, but we should be polite.
        // We do NOT use the global rate limiter here because this is hitting the CDN (fbcdn.net), not the main www.instagram.com app logic.
        // However, if CDN 403s, the URL might have expired.

        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream',
            // Default generic headers often work for CDN
        });

        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve({
                path: outputPath,
                mimeType: "video/mp4",
                filename: `${safeFilenameBase}.mp4`
            }));
            writer.on('error', reject);
        });

    } catch (error: any) {
        console.error("Error downloading to local:", error);
        // If 403, cache might be stale (signed URL expired).
        // For now, we don't have invalidation logic, but the user is unlikely to hit expired URL in this session.
        if (error.response?.status === 403) {
            throw new Error("Download link expired. Please try again.");
        }
        throw new Error(`Failed to download video: ${error.message}`);
    }
}

function extractPostId(url: string): string {
    const parts = url.split("/");
    const segments = parts.filter(p => p.length > 0);
    const reelIndex = segments.indexOf('reel');
    if (reelIndex !== -1 && reelIndex < segments.length - 1) return segments[reelIndex + 1];

    const pIndex = segments.indexOf('p');
    if (pIndex !== -1 && pIndex < segments.length - 1) return segments[pIndex + 1];

    return segments[segments.length - 1] || "unknown_id";
}
