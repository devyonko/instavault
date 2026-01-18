import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getInstaSaveId, uploadFileToDrive } from "@/lib/drive";
import { getInstagramVideo, downloadVideoToLocal } from "@/lib/instagram";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import os from "os";

// Vercel Serverless Config
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for download/upload

export async function POST(req: Request) {
    console.log("[API] POST /api/download - Starting");

    // 1. Auth Check
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { url, folderId } = await req.json();

        if (!url) {
            return new NextResponse("Missing URL", { status: 400 });
        }

        // 2. Resolve Target Folder (Default to InstaSave root if none provided)
        let targetFolderId = folderId;
        if (!targetFolderId) {
            targetFolderId = await getInstaSaveId(session.accessToken as string);
        }

        console.log(`[API] Processing URL: ${url} -> Folder: ${targetFolderId}`);

        // 3. Get Video Info (Metadata) - keep this for title/id
        const videoInfo = await getInstagramVideo(url);
        console.log(`[API] Video Found: ${videoInfo.title}`);

        // 4. Download Video to Local Temp File
        // SERVERLESS FIX: Use os.tmpdir() instead of process.cwd()
        // Vercel/AWS Lambda only allow writing to /tmp
        const downloadsDir = path.join(os.tmpdir(), "instavoid_downloads");
        // Ensure dir exists
        if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

        const safeTitle = videoInfo.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
        const safeFilenameBase = `${safeTitle}_${videoInfo.id}`;

        console.log("[API] Starting local download...");
        const localDownload = await downloadVideoToLocal(url, downloadsDir, safeFilenameBase);
        console.log(`[API] Local download success: ${localDownload.path}`);

        // 5. Read File Buffer
        const buffer = fs.readFileSync(localDownload.path);
        console.log(`[API] File size: ${buffer.length} bytes`);

        if (buffer.length < 1000) {
            throw new Error("Downloaded file is too small/empty. It might be corrupted.");
        }

        // 6. Upload to Google Drive
        const uploadRes = await uploadFileToDrive(
            session.accessToken as string,
            targetFolderId,
            localDownload.filename,
            localDownload.mimeType,
            buffer
        );

        // 7. Cleanup
        try {
            fs.unlinkSync(localDownload.path);
        } catch (e) {
            console.error("Failed to cleanup temp file", e);
        }

        console.log("[API] Upload Complete:", uploadRes);

        return NextResponse.json({
            success: true,
            fileId: uploadRes.id,
            meta: videoInfo
        });

    } catch (error: any) {
        console.error("[API] Download Error:", error);
        return NextResponse.json(
            { message: error.message || "Download failed" },
            { status: 500 }
        );
    }
}
