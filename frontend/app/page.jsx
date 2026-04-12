import Link from "next/link";

const features = [
  {
    title: "Dynamic Vehicle Identity",
    copy: "Every vehicle gets a dedicated QR profile with owner contact actions and optional medical notes."
  },
  {
    title: "Emergency Response Layer",
    copy: "SOS alerts, emergency contact visibility, and browser geolocation give first responders immediate context."
  },
  {
    title: "Operations Dashboard",
    copy: "Track scans, review alerts, export CSV reports, and manage fleet activity from one glassmorphism admin panel."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/10 p-8 shadow-glass sm:p-12">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <span className="inline-flex rounded-full border border-glow/30 bg-glow/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-glow">
                SaaS Ready
              </span>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                Smart Vehicle Identity & Emergency Response System
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-slate-300">
                A full-stack vehicle safety platform built with Next.js, Supabase Auth, PostgreSQL, and Storage for
                mobile-first QR identity and real-time emergency workflows.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/auth" className="primary-button">
                  Launch dashboard
                </Link>
                <Link href="/dashboard/admin" className="secondary-button">
                  Admin preview
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-sm uppercase tracking-[0.35em] text-neon">Feature</p>
                  <h2 className="mt-4 text-2xl font-semibold text-white">{feature.title}</h2>
                  <p className="mt-3 text-slate-400">{feature.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
