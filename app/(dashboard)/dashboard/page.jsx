import { requireUser } from "@/lib/auth";
import { getUserDashboard } from "@/lib/data";
import { LiveDashboardProvider } from "@/components/dashboard/live-dashboard";
import { DashboardHub } from "@/components/dashboard/dashboard-hub";

export default async function DashboardPage() {
  const { user } = await requireUser();
  const dashboard = await getUserDashboard(user.id);

  // Destructure for absolute serialization safety
  const { stats, activity, scans, dailyScans, vehicles } = dashboard;

  return (
    <LiveDashboardProvider
      userId={user.id}
      initialStats={stats}
      initialActivity={activity}
    >
      <DashboardHub 
        initialVehicles={vehicles}
        initialDailyScans={dailyScans}
        initialScans={scans}
      />
    </LiveDashboardProvider>
  );
}
