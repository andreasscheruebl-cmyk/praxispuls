import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { getActivePractice } from "@/actions/practice";
import { getRecentResponses } from "@/lib/db/queries/dashboard";
import { redirect } from "next/navigation";

export const metadata = { title: "Antworten" };

function NpsBadge({ category }: { category: string }) {
  const styles: Record<string, string> = {
    promoter: "bg-green-100 text-green-700",
    passive: "bg-yellow-100 text-yellow-700",
    detractor: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    promoter: "Promoter",
    passive: "Passiv",
    detractor: "Kritisch",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${styles[category] || "bg-gray-100"}`}>
      {labels[category] || category}
    </span>
  );
}

const STAR_LABELS: Record<string, string> = {
  wait_time: "Wartezeit",
  friendliness: "Freundlichkeit",
  treatment: "Behandlung",
  facility: "Ausstattung",
};

function AnswerStars({ answers }: { answers: unknown }) {
  if (!answers || typeof answers !== "object") return null;
  const a = answers as Record<string, unknown>;
  const entries = Object.entries(STAR_LABELS)
    .filter(([key]) => typeof a[key] === "number" && (a[key] as number) >= 1 && (a[key] as number) <= 5)
    .map(([key, label]) => ({ label, value: a[key] as number }));
  if (entries.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
      {entries.map((e) => (
        <span key={e.label}>{e.label}: {"★".repeat(e.value)}{"☆".repeat(5 - e.value)}</span>
      ))}
    </div>
  );
}

export default async function ResponsesPage() {
  const practice = await getActivePractice();
  if (!practice) redirect("/onboarding");

  const responses = await getRecentResponses(practice.id, 50);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Antworten</h1>
        <p className="text-muted-foreground">{responses.length} Antworten</p>
      </div>

      {responses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Noch keine Antworten</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Sobald Patienten Ihre Umfrage ausfüllen, erscheinen die Antworten hier.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {responses.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">Empfehlung: {r.npsScore}/10</span>
                      <NpsBadge category={r.npsCategory} />
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt!).toLocaleDateString("de-DE", {
                          day: "2-digit", month: "2-digit", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <AnswerStars answers={r.answers} />
                    {r.freeText && (
                      <p className="mt-2 rounded bg-gray-50 p-3 text-sm italic">&ldquo;{r.freeText}&rdquo;</p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {r.googleReviewClicked && <span className="text-green-600">✓ Google-Klick</span>}
                    {r.googleReviewShown && !r.googleReviewClicked && <span>Google angeboten</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
