import Link from "next/link";
import { notFound } from "next/navigation";
import { getPracticeForAdmin } from "@/lib/db/queries/admin";
import { getEffectivePlan } from "@/lib/plans";
import { formatDateDE } from "@/lib/utils";
import { setOverrideAction, removeOverrideAction } from "@/actions/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PLAN_BADGE_STYLES, PLAN_LABELS } from "@/lib/constants/plans";
import type { PlanId } from "@/types";

export default async function AdminPracticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const practice = await getPracticeForAdmin(id);

  if (!practice) return notFound();

  const effectivePlan = getEffectivePlan(practice);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/practices">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zurück
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{practice.name}</h1>
        <p className="text-muted-foreground">{practice.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Practice Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Praxis-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slug</span>
              <code className="text-xs">{practice.slug}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">PLZ</span>
              <span>{practice.postalCode ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Theme</span>
              <span>{practice.theme ?? "standard"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Erstellt</span>
              <span>
                {practice.createdAt ? formatDateDE(practice.createdAt) : "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aktualisiert</span>
              <span>
                {practice.updatedAt ? formatDateDE(practice.updatedAt) : "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan & Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Effektiver Plan</span>
              <Badge
                variant="outline"
                className={PLAN_BADGE_STYLES[effectivePlan]}
              >
                {PLAN_LABELS[effectivePlan]}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Basis-Plan (Stripe)</span>
              <span>{practice.plan ?? "free"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stripe Customer</span>
              <span className="text-xs font-mono">
                {practice.stripeCustomerId ?? "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stripe Subscription</span>
              <span className="text-xs font-mono">
                {practice.stripeSubscriptionId ?? "—"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Google Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Google Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge
                variant="outline"
                className={
                  practice.googlePlaceId
                    ? "bg-green-100 text-green-700 border-green-200"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                }
              >
                {practice.googlePlaceId ? "Verbunden" : "Nicht verbunden"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Place ID</span>
              <span className="text-xs font-mono">
                {practice.googlePlaceId ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Review URL</span>
              {practice.googleReviewUrl ? (
                <a
                  href={practice.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  Öffnen
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Redirect aktiv</span>
              <span>{practice.googleRedirectEnabled ? "Ja" : "Nein"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">NPS-Schwellwert</span>
              <span>{practice.npsThreshold ?? 9}</span>
            </div>
          </CardContent>
        </Card>

        {/* Plan Override */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Plan Override</CardTitle>
            <CardDescription>
              Admin-Override überschreibt den Stripe-Plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {practice.planOverride ? (
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 p-3 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Override-Plan</span>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                      {PLAN_LABELS[practice.planOverride as PlanId] ?? practice.planOverride}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grund</span>
                    <span>{practice.overrideReason ?? "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Läuft ab</span>
                    <span>
                      {practice.overrideExpiresAt
                        ? formatDateDE(practice.overrideExpiresAt)
                        : "Unbegrenzt"}
                    </span>
                  </div>
                </div>
                <form action={removeOverrideAction}>
                  <input type="hidden" name="practiceId" value={practice.id} />
                  <Button variant="destructive" size="sm" type="submit">
                    Override entfernen
                  </Button>
                </form>
              </div>
            ) : (
              <form action={setOverrideAction} className="space-y-4">
                <input type="hidden" name="practiceId" value={practice.id} />

                <div className="space-y-2">
                  <label htmlFor="plan" className="text-sm font-medium">
                    Plan
                  </label>
                  <select
                    id="plan"
                    name="plan"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="starter"
                  >
                    <option value="free">Free</option>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm font-medium">
                    Grund
                  </label>
                  <select
                    id="reason"
                    name="reason"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="beta_tester"
                  >
                    <option value="beta_tester">Beta-Tester</option>
                    <option value="demo">Demo</option>
                    <option value="friend">Freund / Familie</option>
                    <option value="support">Support</option>
                    <option value="other">Sonstiges</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="expiresAt" className="text-sm font-medium">
                    Ablaufdatum (optional)
                  </label>
                  <input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>

                <Button type="submit" size="sm">
                  Override setzen
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
