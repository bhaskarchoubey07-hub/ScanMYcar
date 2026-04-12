import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-10">
      <div className="glass-panel w-full rounded-[2rem] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.35em] text-neon">Not Found</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">The requested vehicle page or dashboard view is unavailable.</h1>
        <p className="mt-4 text-slate-400">Check the link or return to the home page.</p>
        <div className="mt-6">
          <Link href="/" className="primary-button">
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
