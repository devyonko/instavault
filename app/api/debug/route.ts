
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = session.accessToken as string;
    const GOOGLE_DRIVE_API = "https://www.googleapis.com/drive/v3/files";

    const diagnosis: any = {
        scanTime: new Date().toISOString(),
        candidates: []
    };

    try {
        // 1. Broad Search: Find ALL folders that look like "InstaSave"
        // We removed 'trashed=false' deliberately to see if they are in trash
        const q = "mimeType='application/vnd.google-apps.folder' and (name='InstaSave' or name='Insta Save')";
        const searchParams = new URLSearchParams({
            q,
            fields: "files(id, name, createdTime, modifiedTime, trashed, parents)",
        });

        const res = await fetch(`${GOOGLE_DRIVE_API}?${searchParams.toString()}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!res.ok) {
            throw new Error(`Drive Search Failed: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        const candidates = data.files || [];

        // 2. Deep Inspect Each Candidate
        for (const folder of candidates) {
            // Count Files
            const fileCountRes = await fetch(
                `${GOOGLE_DRIVE_API}?q='${folder.id}'+in+parents+and+trashed=false+and+mimeType!='application/vnd.google-apps.folder'&fields=files(id)`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const fileData = await fileCountRes.json();
            const fileCount = fileData.files ? fileData.files.length : 'Error';

            // Count Subfolders
            const folderCountRes = await fetch(
                `${GOOGLE_DRIVE_API}?q='${folder.id}'+in+parents+and+trashed=false+and+mimeType='application/vnd.google-apps.folder'&fields=files(id)`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const folderData = await folderCountRes.json();
            const folderCount = folderData.files ? folderData.files.length : 'Error';

            diagnosis.candidates.push({
                ...folder,
                stats: {
                    files: fileCount,
                    subfolders: folderCount
                },
                health: (Number(fileCount) > 0 || Number(folderCount) > 0) ? 'HEALTHY (Has Content)' : 'EMPTY'
            });
        }

        return NextResponse.json(diagnosis);

    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
