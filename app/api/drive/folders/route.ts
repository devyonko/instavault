import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getInstaSaveId, listSubfolders, createDriveFolder, deleteDriveFile, getVideoCountInFolder } from "@/lib/drive";
import { NextResponse } from "next/server";
import * as fs from 'fs';
import * as path from 'path';

export const dynamic = 'force-dynamic';

function logToFile(message: string) {
    // Logging to file is disabled for Vercel/Production
    // console.log(message); // Uncomment for Vercel runtime logs
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) return new NextResponse("Unauthorized", { status: 401 });

    try {
        const parentId = await getInstaSaveId(session.accessToken as string);
        const folders = await listSubfolders(session.accessToken as string, parentId);

        // ENRICHMENT: Fetch video count for each folder
        // This answers the user requirement: "Correctly COUNT and ASSOCIATE videos inside each folder"
        const foldersWithCounts = await Promise.all(
            folders.map(async (folder: any) => {
                const count = await getVideoCountInFolder(session.accessToken as string, folder.id);
                return {
                    ...folder,
                    fileCount: count
                };
            })
        );

        return NextResponse.json({ parentId, folders: foldersWithCounts });
    } catch (e: any) {
        console.error("API Error:", e);
        return new NextResponse(e.message, { status: 500 });
    }
}

export async function POST(req: Request) {
    console.log("[API] POST /api/drive/folders - Starting");
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        console.error("[API] Unauthorized: Missing session or token");
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { name } = await req.json();
        console.log(`[API] Creating folder: '${name}'`);

        const parentId = await getInstaSaveId(session.accessToken as string);
        const newFolder = await createDriveFolder(session.accessToken as string, name, parentId);

        console.log("[API] Folder created successfully:", newFolder);
        return NextResponse.json(newFolder);
    } catch (error: any) {
        console.error("[API] POST Error:", error);
        return new NextResponse(error.message, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return new NextResponse("Missing ID", { status: 400 });

    try {
        await deleteDriveFile(session.accessToken as string, id);
        return new NextResponse(null, { status: 204 });
    } catch (error: any) {
        return new NextResponse(error.message, { status: 500 });
    }
}
