import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listFiles } from "@/lib/drive";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    if (!folderId) {
        return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
    }

    try {
        const files = await listFiles(session.accessToken, folderId);
        return NextResponse.json({ files });
    } catch (error: any) {
        console.error("Error fetching files:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("fileId");

    if (!fileId) {
        return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    try {
        // Reuse existing deleteDriveFile (or redundant, but simple enough to implement fetch here or import)
        // I'll import deleteDriveFile from lib/drive
        const { deleteDriveFile } = await import("@/lib/drive");
        const success = await deleteDriveFile(session.accessToken, fileId);

        if (success === true) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
