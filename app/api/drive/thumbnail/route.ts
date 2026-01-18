import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getFileDownloadUrl } from "@/lib/drive";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
        return new NextResponse("File ID required", { status: 400 });
    }

    try {
        // We can fetch the file's thumbnail or content.
        // If we want the thumbnail specifically, we might need a different endpoint,
        // BUT for custom thumbnails (which are just image files), we can just download them.
        // For Drive-generated thumbnails, we can try to fetch the thumbnailLink with the token header.

        // Strategy:
        // 1. Try to fetch the file content directly (assuming fileId IS the thumbnail file, or a video we want a thumb for?)
        // Wait, the frontend passes:
        // Case A (Custom): fileId = customThumbnailId (Warning: this is a FILE ID of an image)
        // Case B (Default): fileId = videoId (We want the GENERATED thumbnail)

        // Only Case A is solved by simple download.
        // For Case B (Video ID), fetching the content gives the VIDEO, not the thumbnail.

        // Let's assume the frontend logic I wrote:
        // It passes `customThumbnailId` if available.
        // If not, it falls back to `thumbnailLink`.
        // The frontend `src` should point to THIS proxy for `customThumbnailId`.
        // For `thumbnailLink`, if it's failing due to 403, we need to proxy that URL too.

        // Let's support two modes:
        // ?fileId=... (Downloads the file content - for custom thumbs)
        // ?url=... (Proxies a Google URL - for default thumbs)

        const targetUrl = searchParams.get('url');

        let fetchUrl;
        let headers: Record<string, string> = {
            'Authorization': `Bearer ${session.accessToken}`
        };

        if (targetUrl) {
            // Proxying a direct Drive link (thumbnailLink)
            fetchUrl = targetUrl;
        } else {
            // Downloading a file by ID (Custom thumbnail image)
            fetchUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
        }

        const response = await fetch(fetchUrl, { headers });

        if (!response.ok) {
            // If fetching the default thumbnail fails, we can't do much.
            return new NextResponse("Failed to fetch image", { status: response.status });
        }

        const contentType = response.headers.get("Content-Type") || "image/jpeg";
        const buffer = await response.arrayBuffer();

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600"
            }
        });

    } catch (error) {
        console.error("Thumbnail Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
