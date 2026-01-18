// Fix for ESM/CJS interop issues with instagram-url-direct
// Library exports { instagramGetUrl: [Function] }, not default.
const { instagramGetUrl } = require("instagram-url-direct");

import fs from "fs";
import path from "path";
import axios from "axios";

export interface VideoMetadata {
    title: string;
    url: string; // Direct download URL
    thumbnail: string;
    width: number;
    height: number;
    ext: string;
    id: string;
}

export async function getInstagramVideo(postUrl: string): Promise<VideoMetadata> {
    try {
        console.log(`[Lib] Getting info for: ${postUrl}`);

        const response = await instagramGetUrl(postUrl);

        if (!response.url_list || response.url_list.length === 0) {
            throw new Error("No video URL found");
        }

        // Always take the first valid video URL
        const videoUrl = response.url_list[0];

        return {
            title: "Instagram Reel", // The library might not return a clean title, using generic or parsing logic if needed
            url: videoUrl,
            thumbnail: "", // Library doesn't always provide thumbnail
            width: 0,
            height: 0,
            ext: "mp4",
            id: extractPostId(postUrl)
        };
    } catch (error: any) {
        console.error("Error getting video info:", error);
        throw new Error(`Failed to extract video info: ${error.message}`);
    }
}

/**
 * Downloads the video to a local path using axios stream.
 * Returns the absolute path of the downloaded file.
 */
export async function downloadVideoToLocal(postUrl: string, outputDir: string, safeFilenameBase: string): Promise<{ path: string, mimeType: string, filename: string }> {
    try {
        // 1. Get Direct URL
        const meta = await getInstagramVideo(postUrl);
        const downloadUrl = meta.url;

        // 2. Download Stream
        const outputPath = path.join(outputDir, `${safeFilenameBase}.mp4`);
        const writer = fs.createWriteStream(outputPath);

        const response = await axios({
            url: downloadUrl,
            method: 'GET',
            responseType: 'stream'
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
        throw new Error(`Failed to download to local: ${error.message}`);
    }
}

function extractPostId(url: string): string {
    const parts = url.split("/");
    // Usually /reel/ID/ or /p/ID/
    // "https://www.instagram.com/reel/C8..." -> ["", "reel", "C8...", ""]
    // filter empty
    const segments = parts.filter(p => p.length > 0);
    // last might be query params
    // simple heuristic: find segment after 'reel' or 'p'
    const reelIndex = segments.indexOf('reel');
    if (reelIndex !== -1 && reelIndex < segments.length - 1) return segments[reelIndex + 1];

    const pIndex = segments.indexOf('p');
    if (pIndex !== -1 && pIndex < segments.length - 1) return segments[pIndex + 1];

    return Object.keys(segments).pop() || "unknown_id";
}
