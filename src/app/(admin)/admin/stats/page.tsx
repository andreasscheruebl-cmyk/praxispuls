import { getPlatformStats } from "@/lib/db/queries/admin";
import { BarChart3 } from "lucide-react";

export default async function AdminStatsPage() {
  const stats = await getPlatformStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiken</h1>
        <p className="text-muted-foreground">
          Plattform-weite Metriken und Plan-Verteilung.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-muted-foreground">Praxen gesamt</p>
          <p className="text-3xl font-bold">{stats.totalPractices}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-muted-foreground">Free</p>
          <p className="text-3xl font-bold">{stats.freePlan}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-muted-foreground">Starter</p>
          <p className="text-3xl font-bold">{stats.starterPlan}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <p className="text-sm text-muted-foreground">Professional</p>
          <p className="text-3xl font-bold">{stats.professionalPlan}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">Overrides</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {stats.withOverride} Praxen haben aktuell einen aktiven Plan-Override.
        </p>
      </div>
    </div>
  );
}
