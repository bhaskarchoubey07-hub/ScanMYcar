import Link from "next/link";
import { CarFront, FileSpreadsheet, LayoutDashboard, ShieldAlert } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { requireUser } from "@/lib/auth";

function navItems(role) {
  return [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/vehicles", label: "Vehicles", icon: CarFront },
    { href: "/dashboard/vehicles/new", label: "Add Vehicle", icon: ShieldAlert },
    { href: "/api/vehicles/export", label: "CSV Export", icon: FileSpreadsheet },
    ...(role === "admin" ? [{ href: "/dashboard/admin", label: "Admin", icon: ShieldAlert }] : [])
  ];
}

export default async function DashboardLayout({ children }) {
  const { profile } = await requireUser();

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 lg:grid-cols-[280px_1fr]">
        <aside className="glass-panel rounded-[2rem] p-6">
          <Link href="/" className="text-sm uppercase tracking-[0.35em] text-neon">
            Smart Vehicle Identity
          </Link>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="mt-2 text-xl font-semibold text-white">{profile?.full_name}</p>
            <p className="text-sm text-slate-500">{profile?.role}</p>
          </div>

          <nav className="mt-8 grid gap-3">
            {navItems(profile?.role).map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="secondary-button justify-start">
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="mt-8">
            <LogoutButton />
          </div>
        </aside>

        <main className="glass-panel rounded-[2rem] p-6 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
