import Link from "next/link";
import { getAllPractices } from "@/lib/db/queries/admin";
import { getEffectivePlan } from "@/lib/plans";
import { Building2 } from "lucide-react";

export default async function AdminPracticesPage() {
  const practices = await getAllPractices();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Praxen</h1>
        <p className="text-muted-foreground">
          Alle registrierten Praxen verwalten.
        </p>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-6 py-3 text-sm font-medium text-muted-foreground">
          <div>Name</div>
          <div>Plan</div>
          <div>Override</div>
          <div>Erstellt</div>
        </div>

        {practices.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-6 py-12 text-muted-foreground">
            <Building2 className="h-5 w-5" />
            Keine Praxen vorhanden.
          </div>
        ) : (
          practices.map((practice) => {
            const effectivePlan = getEffectivePlan(practice);
            return (
              <Link
                key={practice.id}
                href={`/admin/practices/${practice.id}`}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 border-b px-6 py-4 text-sm hover:bg-gray-50 last:border-b-0"
              >
                <div>
                  <p className="font-medium">{practice.name}</p>
                  <p className="text-xs text-muted-foreground">{practice.email}</p>
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium">
                    {effectivePlan}
                  </span>
                </div>
                <div>
                  {practice.planOverride ? (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                      {practice.overrideReason || "override"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {practice.createdAt
                    ? new Date(practice.createdAt).toLocaleDateString("de-DE")
                    : "—"}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
