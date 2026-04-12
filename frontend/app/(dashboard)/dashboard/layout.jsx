import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }) {
  const { user, profile } = await requireUser();

  return (
    <div className="flex min-h-screen bg-slate-950 text-white selection:bg-neon selection:text-slate-900">
      <Sidebar user={user} profile={profile} />
      <div className="flex flex-1 flex-col">
        <Navbar user={user} profile={profile} />
        <main className="flex-1 p-6 sm:p-10 lg:p-12 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="glass-panel overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] shadow-2xl">
              <div className="p-8 sm:p-10 lg:p-12">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
