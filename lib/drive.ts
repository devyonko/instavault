export const GOOGLE_DRIVE_API = "https://www.googleapis.com/drive/v3/files";

/**
 * Helper to handle Drive API errors
 */
async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(error.error?.message || `Drive API error: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Finds or creates the "InstaSave" parent folder.
 * Returns the Folder ID.
 */
export async function getInstaSaveId(accessToken: string): Promise<string> {
    // 1. Search for existing "InstaSave" folder created by THIS app
    // With 'drive.file' scope, we can only see folders we created.
    try {
        const searchParams = new URLSearchParams({
            q: "mimeType='application/vnd.google-apps.folder' and (name='InstaSave' or name='Insta Save') and trashed=false",
            fields: "files(id, name, modifiedTime)",
            orderBy: "modifiedTime desc"
        });

        const searchRes = await fetch(`${GOOGLE_DRIVE_API}?${searchParams.toString()}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (searchRes.ok) {
            const searchData = await searchRes.json();
            console.log(`[Drive] getInstaSaveId search result: ${searchData.files?.length || 0} files found. Query: ${searchParams.toString()}`);

            if (searchData.files && searchData.files.length > 0) {
                // SPLIT BRAIN FIX:
                // Google Drive allows multiple folders with the same name.
                // We iterate to find the one that actually contains content/folders.
                for (const folder of searchData.files) {
                    console.log(`[Drive] Inspecting candidate folder: ${folder.name} (${folder.id})`);

                    // Check for files
                    const fileCount = await getFileCountInFolder(accessToken, folder.id);
                    console.log(`[Drive] Candidate ${folder.id} has ${fileCount} files`);

                    if (fileCount > 0) {
                        console.log(`[Drive] Selected folder ${folder.id} because it has files.`);
                        return folder.id;
                    }

                    // Check for subfolders (Crucial: The root folder mainly contains subfolders!)
                    const subfolders = await listSubfolders(accessToken, folder.id);
                    console.log(`[Drive] Candidate ${folder.id} has ${subfolders.length} subfolders`);

                    if (subfolders.length > 0) {
                        console.log(`[Drive] Selected folder ${folder.id} because it has subfolders.`);
                        return folder.id;
                    }
                }

                // Fallback: Return the most recently modified one if all are empty
                console.log(`[Drive] All candidates empty. Returning most recent: ${searchData.files[0].id}`);
                return searchData.files[0].id;
            } else {
                console.warn("[Drive] No 'InstaSave' folders found via search.");
            }
        }
    } catch (e) {
        console.warn("Failed to search for InstaSave folder, attempting creation.", e);
    }

    // 2. If not found (or we can't see it), create it
    const createRes = await fetch(GOOGLE_DRIVE_API, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: "InstaSave",
            mimeType: "application/vnd.google-apps.folder",
        }),
    });
    const createData = await handleResponse(createRes);
    return createData.id;
}

/**
 * Lists all subfolders inside the InstaSave parent folder.
 */
export async function listSubfolders(accessToken: string, parentId: string) {
    const searchParams = new URLSearchParams({
        q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name, createdTime)",
        orderBy: "createdTime desc",
        pageSize: "1000"
    });

    const res = await fetch(`${GOOGLE_DRIVE_API}?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await handleResponse(res);
    console.log(`[Drive] listSubfolders for parent '${parentId}': Found ${data.files?.length || 0} items`);
    if (data.files && data.files.length === 0) {
        console.warn(`[Drive] listSubfolders returned 0 items. Query was: ${searchParams.toString()}`);
    }
    return data.files || [];
}

/**
 * Creates a new folder inside the InstaSave parent folder.
 */
export async function createDriveFolder(accessToken: string, name: string, parentId: string) {
    const res = await fetch(GOOGLE_DRIVE_API, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parentId],
        }),
    });
    return handleResponse(res);
}

/**
 * Deletes a file or folder by ID.
 */
export async function deleteDriveFile(accessToken: string, fileId: string) {
    const res = await fetch(`${GOOGLE_DRIVE_API}/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 204) return true; // No content = success
    return handleResponse(res);
}

/**
 * Uploads a file to Google Drive.
 * @param accessToken User's access token
 * @param parentId ID of the folder to upload to
 * @param filename Name of the file
 * @param mimeType MIME type of the file
 * @param buffer Buffer containing file data
 */
export async function uploadFileToDrive(
    accessToken: string,
    parentId: string,
    filename: string,
    mimeType: string,
    buffer: Buffer,
    customThumbnailId?: string | null
) {
    const metadata: any = {
        name: filename,
        parents: [parentId],
    };

    if (customThumbnailId) {
        metadata.appProperties = {
            customThumbnailId: customThumbnailId
        };
    }

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
        delimiter +
        "Content-Type: application/json\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: " + mimeType + "\r\n" +
        "Content-Transfer-Encoding: base64\r\n" +
        "\r\n" +
        buffer.toString("base64") +
        close_delim;

    const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/related; boundary=" + boundary,
        },
        body: multipartRequestBody,
    });

    return handleResponse(res);
}

/**
 * Lists all files (images/videos) inside a folder.
 */
export async function listFiles(accessToken: string, folderId: string) {
    const q = `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType contains 'video/')`;
    const searchParams = new URLSearchParams({
        q,
        fields: "files(id, name, thumbnailLink, hasThumbnail, webContentLink, mimeType, webViewLink, createdTime, size, parents, videoMediaMetadata, appProperties)",
        orderBy: "createdTime desc",
        pageSize: "1000"
    });

    const res = await fetch(`${GOOGLE_DRIVE_API}?${searchParams.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await handleResponse(res);
    return data.files || [];
}

/**
 * Fetches all files from all subfolders recursively.
 */
export async function fetchAllFilesRecursively(accessToken: string, parentId: string) {
    try {
        let allFiles: any[] = [];

        // First, get all subfolders
        const subfolders = await listSubfolders(accessToken, parentId);

        // Get files in the parent folder (Root InstaSave)
        const rootFiles = await listFiles(accessToken, parentId);
        if (rootFiles) {
            const rootFilesFormatted = rootFiles.map((file: any) => ({
                ...file,
                folderName: 'InstaSave Root',
                folderId: parentId
            }));
            allFiles = allFiles.concat(rootFilesFormatted);
        }

        // For each subfolder, get all files
        for (const folder of subfolders) {
            const files = await listFiles(accessToken, folder.id);

            if (files) {
                // Add folder name to each file for reference
                const filesWithFolder = files.map((file: any) => ({
                    ...file,
                    folderName: folder.name,
                    folderId: folder.id
                }));

                allFiles = allFiles.concat(filesWithFolder);
            }
        }

        // Sort all files by creation time (newest first)
        allFiles.sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());

        return allFiles;
    } catch (error) {
        console.error('Error fetching all files:', error);
        return [];
    }
}

/**
 * Calculates dynamic stats from files.
 */
export function calculateStats(files: any[]) {
    if (!files || files.length === 0) {
        return {
            reelsSaved: 0,
            postsSaved: 0,
            totalSaved: 0,
            thisWeek: 0,
            thisMonth: 0,
            storageUsed: 0
        };
    }

    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000);

    // Count reels (video files)
    const reelsSaved = files.filter(f =>
        f.mimeType && f.mimeType.startsWith('video/')
    ).length;

    // Count posts (image files)
    const postsSaved = files.filter(f =>
        f.mimeType && f.mimeType.startsWith('image/')
    ).length;

    // Total saved files
    const totalSaved = files.length;

    // Files saved this week (last 7 days)
    const thisWeek = files.filter(f => {
        const createdTime = new Date(f.createdTime).getTime();
        return createdTime > weekAgo;
    }).length;

    // Files saved this month (last 30 days)
    const thisMonth = files.filter(f => {
        const createdTime = new Date(f.createdTime).getTime();
        return createdTime > monthAgo;
    }).length;

    // Calculate total storage used by all files (in GB)
    const totalBytes = files.reduce((total, file) => {
        return total + (parseInt(file.size) || 0);
    }, 0);
    // const storageUsedGB = (totalBytes / (1024 ** 3)).toFixed(2);

    return {
        reelsSaved,
        postsSaved,
        totalSaved,
        thisWeek,
        thisMonth,
        storageUsed: totalBytes // Return bytes for component to format, or consistent with requirement
    };
}

/**
 * Fetches user's total Google Drive storage quota.
 */
export async function fetchStorageQuota(accessToken: string) {
    try {
        let data;
        
        // If client-side, use our proxy to avoid CORS
        if (typeof window !== 'undefined') {
            const res = await fetch('/api/drive/storage');
            if (!res.ok) throw new Error('Failed to fetch storage quota');
            data = await res.json();
        } else {
            // Server-side (during SSR or API routes), call Google directly
            const res = await fetch(`https://www.googleapis.com/drive/v3/about?fields=storageQuota`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            data = await handleResponse(res);
        }

        const quota = data.storageQuota;

        const usageInDrive = parseInt(quota.usageInDrive) || 0;
        const limit = parseInt(quota.limit) || 0;

        return {
            storageUsed: usageInDrive,
            storageTotal: limit,
            percentage: limit > 0 ? ((usageInDrive / limit) * 100).toFixed(1) : 0
        };
    } catch (error) {
        console.error('Error fetching storage quota:', error);
        return {
            storageUsed: 0,
            storageTotal: 15 * 1024 * 1024 * 1024, // Default free tier 15GB in bytes
            percentage: 0
        };
    }
}

/**
 * Generates recent items list (top 4).
 */
export function generateRecentItems(files: any[]) {
    if (!files || files.length === 0) {
        return [];
    }

    // Files are already sorted by createdTime desc
    // Take first 4
    const recentFour = files.slice(0, 4);

    return recentFour.map(file => {
        // Determine category based on mime type or folder
        let category = file.folderName || 'General';
        let emoji = '📄';

        if (file.mimeType.startsWith('video/')) {
            emoji = '🎬';
        } else if (file.mimeType.startsWith('image/')) {
            emoji = '📸';
        }

        // Calculate relative time
        const timeAgo = getRelativeTime(file.createdTime);

        // Clean up file name (remove extension and timestamp if any)
        // Simple regex to remove extension
        let cleanName = file.name.replace(/\.[^/.]+$/, '');

        return {
            id: file.id,
            title: cleanName,
            category: category,
            time: timeAgo,
            thumbnail: file.appProperties?.customThumbnailId
                ? `/api/drive/thumbnail?fileId=${file.appProperties.customThumbnailId}`
                : (file.thumbnailLink
                    ? `/api/drive/thumbnail?url=${encodeURIComponent(file.thumbnailLink)}`
                    : null),
            emoji: emoji,
            webViewLink: file.webViewLink,
            folderId: file.folderId
        };
    });
}

// Helper: Calculate relative time
function getRelativeTime(dateString: string) {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
}

/**
 * Gets the count of files in a specific folder.
 */
export async function getFileCountInFolder(accessToken: string, folderId: string) {
    try {
        const response = await fetch(
            `${GOOGLE_DRIVE_API}?q='${folderId}'+in+parents+and+trashed=false+and+mimeType!='application/vnd.google-apps.folder'&fields=files(id)`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        const data = await handleResponse(response);
        return data.files ? data.files.length : 0;
    } catch (error) {
        console.error('Error counting files:', error);
        return 0;
    }
}

/**
 * Gets the count of VIDEO files in a specific folder.
 */
export async function getVideoCountInFolder(accessToken: string, folderId: string) {
    try {
        const response = await fetch(
            `${GOOGLE_DRIVE_API}?q='${folderId}'+in+parents+and+trashed=false+and+mimeType+contains+'video/'&fields=files(id)`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );

        const data = await handleResponse(response);
        return data.files ? data.files.length : 0;
    } catch (error) {
        console.error('Error counting video files:', error);
        return 0;
    }
}

/**
 * Gets the download/stream URL for a file.
 */
export async function getFileDownloadUrl(fileId: string, accessToken: string) {
    // For videos/images, we can stream directly using the alt=media parameter
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`;
}

/**
 * Gets metadata for a specific folder.
 */
export async function getFolderMetadata(accessToken: string, folderId: string) {
    try {
        const response = await fetch(
            `${GOOGLE_DRIVE_API}/${encodeURIComponent(folderId)}?fields=id,name`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
        return handleResponse(response);
    } catch (error) {
        console.error("Error fetching folder metadata", error);
        return { name: "Folder Contents" };
    }
}

/**
 * Lists files in a folder with extended metadata for the UI.
 */
export async function listFilesWithMetadata(accessToken: string, folderId: string) {
    try {
        const q = `'${folderId}' in parents and trashed = false`;
        const searchParams = new URLSearchParams({
            q,
            fields: "files(id, name, mimeType, size, thumbnailLink, webViewLink, videoMediaMetadata, imageMediaMetadata, createdTime)",
            orderBy: "createdTime desc",
            pageSize: "100"
        });

        const res = await fetch(`${GOOGLE_DRIVE_API}?${searchParams.toString()}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await handleResponse(res);
        return data.files || [];
    } catch (error) {
        console.error("Error listing files with metadata", error);
        return [];
    }
}
