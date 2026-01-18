import React, { useState } from 'react';
import { AnimatedFolder } from './animated-folder';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FolderItemProps {
    folder: { id: string; name: string; fileCount?: number };
    index: number;
    gradient: string;
    onDelete: (id: string, e: React.MouseEvent) => void;
}

export function FolderItem({ folder, index, gradient, onDelete }: FolderItemProps) {
    const router = useRouter();

    const handleFolderClick = () => {
        router.push(`/folders/${folder.id}`);
    };

    return (
        <div
            className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 relative group/wrapper cursor-pointer"
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={handleFolderClick}
        >
            {/* Delete Button (Visible on Hover) */}
            <button
                onClick={(e) => onDelete(folder.id, e)}
                className="absolute top-2 right-2 z-50 p-2 text-white/50 hover:text-red-500 hover:bg-white/10 rounded-full opacity-0 group-hover/wrapper:opacity-100 transition-all duration-200"
                title="Delete Folder"
            >
                <Trash2 size={16} />
            </button>

            <AnimatedFolder
                title={folder.name}
                fileCount={folder.fileCount || 0}
                gradient={gradient}
                className="w-full"
            />
        </div>
    );
}
