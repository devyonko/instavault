
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function DebugPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runDiagnosis = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/debug");
            if (!res.ok) throw new Error(await res.text());
            const json = await res.json();
            setData(json);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
            <h1 className="text-2xl font-bold mb-4 text-red-500">🚨 INSTAVAULT DIAGNOSTICS 🚨</h1>

            <div className="mb-8 p-4 border border-gray-800 rounded bg-gray-900">
                <h2 className="text-xl mb-2">Identity Check</h2>
                <p>Status: {session ? "✅ Logged In" : "❌ Logged Out"}</p>
                <p>User: {session?.user?.email}</p>
                <p>Scope: {session?.accessToken ? "✅ Token Present" : "❌ Token Missing"}</p>
            </div>

            <button
                onClick={runDiagnosis}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold mb-8"
            >
                {loading ? "SCANNING DRIVE..." : "RUN DEEP SCAN"}
            </button>

            {error && (
                <div className="p-4 bg-red-900/50 border border-red-500 text-red-200 mb-8 rounded">
                    ERROR: {error}
                </div>
            )}

            {data && (
                <div className="space-y-8">
                    <div className="p-4 border border-blue-800 bg-blue-900/20 rounded">
                        <h2 className="text-xl font-bold mb-4 text-blue-400">Scan Results</h2>
                        <p className="mb-4">Found {data.candidates.length} candidates for "InstaSave" / "Insta Save"</p>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-800 text-gray-400">
                                    <tr>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">ID</th>
                                        <th className="p-2">Created</th>
                                        <th className="p-2">Content</th>
                                        <th className="p-2">Trashed?</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {data.candidates.map((folder: any) => (
                                        <tr key={folder.id} className={folder.health.includes("HEALTHY") ? "bg-green-900/20" : "bg-red-900/10"}>
                                            <td className="p-2 font-bold">
                                                {folder.health.includes("HEALTHY") ?
                                                    <span className="text-green-400">● VALID</span> :
                                                    <span className="text-gray-500">○ EMPTY</span>
                                                }
                                            </td>
                                            <td className="p-2 text-yellow-500">{folder.name}</td>
                                            <td className="p-2 font-mono text-xs text-gray-500">{folder.id}</td>
                                            <td className="p-2 text-gray-400">{new Date(folder.createdTime).toLocaleString()}</td>
                                            <td className="p-2">
                                                Files: {folder.stats.files} <br />
                                                Folders: {folder.stats.subfolders}
                                            </td>
                                            <td className="p-2">
                                                {folder.trashed ? <span className="text-red-500">YES</span> : "No"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
