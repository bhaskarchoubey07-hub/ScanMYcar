import { requireUser } from "@/lib/auth";
import { getUserDashboard } from "@/lib/data";
import { LiveDashboardProvider } from "@/components/dashboard/live-dashboard";
import { DashboardHub } from "@/components/dashboard/dashboard-hub";

export default async function DashboardPage() {
  const { user } = await requireUser();
  const dashboard = await getUserDashboard(user.id);

  return (
    <LiveDashboardProvider
      userId={user.id}
      initialStats={dashboard.stats}
      initialActivity={dashboard.activity}
    >
      <DashboardHub 
        initialVehicles={dashboard.vehicles}
        initialDailyScans={dashboard.dailyScans}
        initialScans={dashboard.scans}
      />
    </LiveDashboardProvider>
  );
}
