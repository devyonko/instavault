import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white gap-4">
      <h1 className="text-4xl font-bold">InstaSave</h1>
      <p className="text-xl text-neutral-400">Save your favorite Instagram content.</p>

      <Link
        href="/login"
        className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-medium transition-colors"
      >
        Go to Login
      </Link>
    </main>
  );
}