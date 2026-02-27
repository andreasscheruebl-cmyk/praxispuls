import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { getActivePractice } from "@/actions/practice";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { alerts, responses } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { AlertItem } from "@/components/dashboard/alert-item";

export const metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const practice = await getActivePractice();
  if (!practice) redirect("/onboarding");

  const allAlerts = await db
    .select({
      id: alerts.id,
      isRead: alerts.isRead,
      note: alerts.note,
      createdAt: alerts.createdAt,
      npsScore: responses.npsScore,
      freeText: responses.freeText,
      answers: responses.answers,
    })
    .from(alerts)
    .innerJoin(responses, eq(alerts.responseId, responses.id))
    .where(eq(alerts.practiceId, practice.id))
    .orderBy(desc(alerts.createdAt))
    .limit(50);

  const unread = allAlerts.filter((a) => !a.isRead);
  const read = allAlerts.filter((a) => a.isRead);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Alerts</h1>
        <p className="text-muted-foreground">
          Kritisches Patientenfeedback (Empfehlungswert 0–6)
        </p>
      </div>

      {allAlerts.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <CheckCircle className="h-12 w-12 text-green-400" />
            <h3 className="mt-4 text-lg font-semibold">Keine Alerts</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              Sehr gut! Es liegt kein kritisches Feedback vor.
            </p>
          </CardContent>
        </Card>
      )}

      {unread.length > 0 && (
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Ungelesen ({unread.length})
          </h2>
          <div className="space-y-3">
            {unread.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Gelesen ({read.length})
          </h2>
          <div className="space-y-3">
            {read.map((alert) => (
              <AlertItem key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
