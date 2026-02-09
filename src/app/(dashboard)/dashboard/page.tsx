import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, MessageSquare, Star, AlertTriangle } from "lucide-react";
import { getPractice } from "@/actions/practice";
import { getDashboardOverview, getNpsTrend, getReviewFunnel } from "@/lib/db/queries/dashboard";
import { NpsChart } from "@/components/dashboard/nps-chart";
import { ReviewFunnel } from "@/components/dashboard/review-funnel";
import { CategoryBars } from "@/components/dashboard/category-bars";
import { type ThemeId, getThemeConfig } from "@/lib/themes";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const practice = await getPractice();
  if (!practice) redirect("/onboarding");

  const themeId = (practice.theme as ThemeId) || "standard";
  const themeConfig = getThemeConfig(themeId);

  const [overview, npsTrend, reviewFunnel] = await Promise.all([
    getDashboardOverview(practice.id),
    getNpsTrend(practice.id),
    getReviewFunnel(practice.id),
  ]);
  const hasData = overview.totalResponses > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Übersicht</h1>
        <p className="text-muted-foreground">{practice.name}</p>
      </div>

      {/* 1. Category Scores */}
      {hasData && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Kategorie-Bewertungen (Ø)</CardTitle></CardHeader>
          <CardContent>
            {themeConfig.dashboard.categoryDisplay === "bars" ? (
              <CategoryBars
                categories={[
                  { label: "Wartezeit", value: overview.categoryScores.waitTime },
                  { label: "Freundlichkeit", value: overview.categoryScores.friendliness },
                  { label: "Behandlung", value: overview.categoryScores.treatment },
                  { label: "Ausstattung", value: overview.categoryScores.facility },
                ]}
                color={themeConfig.chart.primaryColor}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-4">
                {([
                  { label: "Wartezeit", value: overview.categoryScores.waitTime },
                  { label: "Freundlichkeit", value: overview.categoryScores.friendliness },
                  { label: "Behandlung", value: overview.categoryScores.treatment },
                  { label: "Ausstattung", value: overview.categoryScores.facility },
                ] as const).map((cat) => (
                  <div key={cat.label} className="text-center">
                    <p className="text-sm text-muted-foreground">{cat.label}</p>
                    <p className="mt-1 text-2xl font-bold">{cat.value !== null ? cat.value.toFixed(1) : "–"}</p>
                    <div className="mt-1 text-yellow-400">
                      {"★".repeat(Math.round(cat.value || 0))}{"☆".repeat(5 - Math.round(cat.value || 0))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 2. Key Numbers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empfehlungswert</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.npsScore ?? "–"}</div>
            <p className="text-xs text-muted-foreground">{hasData ? "Letzte 30 Tage" : "Noch keine Daten"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antworten (7 Tage)</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.responsesThisWeek}</div>
            <p className="text-xs text-muted-foreground">{overview.totalResponses} gesamt (30 Tage)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Google-Klicks</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.googleReviewClicks}</div>
            <p className="text-xs text-muted-foreground">
              {overview.googleConversionRate !== null ? `${overview.googleConversionRate}% Conversion` : "Promoter → Google"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.unreadAlerts}</div>
            <p className="text-xs text-muted-foreground">
              {overview.unreadAlerts > 0 ? (
                <Link href="/dashboard/alerts" className="text-red-600 hover:underline">
                  Kritisches Feedback ansehen
                </Link>
              ) : (
                "Alles gut"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. NPS Trend Chart */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Empfehlungs-Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <NpsChart data={npsTrend} color={themeConfig.chart.primaryColor} />
          </CardContent>
        </Card>
      )}

      {/* 4. Google Review Pipeline */}
      {hasData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Von der Umfrage zur Google-Bewertung (30 Tage)</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewFunnel data={reviewFunnel} />
          </CardContent>
        </Card>
      )}

      {!hasData && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Warten auf erste Antworten</h3>
            <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
              Laden Sie Ihren QR-Code herunter und platzieren Sie ihn im Wartezimmer.
            </p>
            <Link href="/dashboard/qr-codes" className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-white hover:bg-primary/90">
              QR-Code herunterladen
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
