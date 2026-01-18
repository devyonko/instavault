import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
        return new NextResponse("Missing fileId", { status: 400 });
    }

    try {
        // Fetch from Google Drive API with alt=media to get file content
        const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        });

        if (!driveRes.ok) {
            return new NextResponse(`Drive Error: ${driveRes.statusText}`, { status: driveRes.status });
        }

        // Forward strict headers for video playback
        const headers = new Headers();
        headers.set("Content-Type", driveRes.headers.get("Content-Type") || "video/mp4");
        if (driveRes.headers.get("Content-Length")) {
            headers.set("Content-Length", driveRes.headers.get("Content-Length")!);
        }

        // Pass the stream directly
        headers.set("Access-Control-Allow-Origin", "*");

        return new NextResponse(driveRes.body, {
            status: 200,
            headers
        });

    } catch (error: any) {
        console.error("Stream Proxy Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
