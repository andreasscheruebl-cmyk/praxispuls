import { getPlatformStats, getExtendedPlatformStats } from "@/lib/db/queries/admin";
import { PlanDistributionChart } from "@/components/admin/plan-distribution-chart";
import { RegistrationsChart } from "@/components/admin/registrations-chart";
import {
  Building2,
  MessageSquare,
  Globe,
  TrendingUp,
  BarChart3,
  Shield,
} from "lucide-react";

export default async function AdminStatsPage() {
  const [stats, extended] = await Promise.all([
    getPlatformStats(),
    getExtendedPlatformStats(),
  ]);

  const planData = [
    { name: "Free", count: stats.freePlan, color: "#94a3b8" },
    { name: "Starter", count: stats.starterPlan, color: "#3b82f6" },
    { name: "Professional", count: stats.professionalPlan, color: "#8b5cf6" },
  ];

  const registrationData = extended.registrations.map((r) => {
    const d = new Date(r.date);
    return {
      date: r.date,
      count: r.count,
      label: `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.`,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiken</h1>
        <p className="text-muted-foreground">
          Plattform-weite Metriken und Plan-Verteilung.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Praxen gesamt</p>
          </div>
          <p className="text-3xl font-bold">{stats.totalPractices}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Antworten (30 Tage)</p>
          </div>
          <p className="text-3xl font-bold">{extended.responses30d}</p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Google verbunden</p>
          </div>
          <p className="text-3xl font-bold">{extended.googleRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {extended.withGoogle} von {extended.totalPractices} Praxen
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aktive Overrides</p>
          </div>
          <p className="text-3xl font-bold">{stats.withOverride}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Plan-Verteilung</h2>
          </div>
          <PlanDistributionChart data={planData} />
        </div>

        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Registrierungen (30 Tage)</h2>
          </div>
          <RegistrationsChart data={registrationData} />
        </div>
      </div>

      {/* Plan breakdown */}
      <div className="rounded-lg border bg-white p-6">
        <h2 className="font-semibold mb-4">Plan-Details</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {planData.map((plan) => (
            <div key={plan.name} className="flex items-center justify-between rounded-md border px-4 py-3">
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: plan.color }}
                />
                <span className="text-sm font-medium">{plan.name}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {plan.count} ({stats.totalPractices > 0
                  ? Math.round((plan.count / stats.totalPractices) * 100)
                  : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
