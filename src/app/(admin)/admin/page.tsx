import { Shield } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Internes Verwaltungs-Dashboard für PraxisPuls.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-lg border bg-white p-8">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Stats kommen bald</h2>
          <p className="text-sm text-muted-foreground">
            Key Metrics, Plan-Verteilung und Google-Verbindungsrate werden hier angezeigt.
          </p>
        </div>
      </div>
    </div>
  );
}
