import Link from "next/link";
import { Suspense } from "react";
import { getPracticesFiltered } from "@/lib/db/queries/admin";
import { getEffectivePlan } from "@/lib/plans";
import { formatDateDE } from "@/lib/utils";
import { PracticesFilters } from "@/components/admin/practices-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import type { PlanId } from "@/types";

const PLAN_BADGE_STYLES: Record<PlanId, string> = {
  free: "bg-gray-100 text-gray-700 border-gray-200",
  starter: "bg-blue-100 text-blue-700 border-blue-200",
  professional: "bg-purple-100 text-purple-700 border-purple-200",
};

const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Professional",
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPracticesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const plan = typeof params.plan === "string" ? (params.plan as PlanId) : undefined;
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1;

  const googleParam = typeof params.google === "string" ? params.google : undefined;
  const hasGoogle = googleParam === "yes" ? true : googleParam === "no" ? false : undefined;

  const overrideParam = typeof params.override === "string" ? params.override : undefined;
  const hasOverride = overrideParam === "yes" ? true : overrideParam === "no" ? false : undefined;

  const result = await getPracticesFiltered({
    search,
    plan,
    hasGoogle,
    hasOverride,
    page,
    pageSize: 20,
  });

  const totalPages = Math.ceil(result.total / result.pageSize);

  function buildPageUrl(targetPage: number) {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    if (plan) sp.set("plan", plan);
    if (googleParam) sp.set("google", googleParam);
    if (overrideParam) sp.set("override", overrideParam);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return `/admin/practices${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Praxen</h1>
        <p className="text-muted-foreground">
          {result.total} registrierte Prax{result.total === 1 ? "is" : "en"} verwalten.
        </p>
      </div>

      <Suspense fallback={null}>
        <PracticesFilters />
      </Suspense>

      <div className="rounded-lg border bg-white">
        {result.practices.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-6 py-12 text-muted-foreground">
            <Building2 className="h-5 w-5" />
            Keine Praxen gefunden.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Praxis</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="hidden md:table-cell">Override</TableHead>
                <TableHead className="hidden sm:table-cell">Google</TableHead>
                <TableHead className="hidden lg:table-cell">Slug</TableHead>
                <TableHead className="hidden md:table-cell">Erstellt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.practices.map((practice) => {
                const effectivePlan = getEffectivePlan(practice);
                return (
                  <TableRow key={practice.id}>
                    <TableCell>
                      <Link
                        href={`/admin/practices/${practice.id}`}
                        className="block hover:underline"
                      >
                        <p className="font-medium">{practice.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {practice.email}
                        </p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={PLAN_BADGE_STYLES[effectivePlan]}
                      >
                        {PLAN_LABELS[effectivePlan]}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {practice.planOverride ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          {practice.overrideReason ?? "override"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${
                          practice.googlePlaceId
                            ? "bg-green-500"
                            : "bg-gray-300"
                        }`}
                        title={
                          practice.googlePlaceId
                            ? "Google verbunden"
                            : "Nicht verbunden"
                        }
                      />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <code className="text-xs text-muted-foreground">
                        {practice.slug}
                      </code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {practice.createdAt
                        ? formatDateDE(practice.createdAt)
                        : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Seite {result.page} von {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildPageUrl(page - 1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Zurück
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Zurück
                </Button>
              )}
              {page < totalPages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildPageUrl(page + 1)}>
                    Weiter
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Weiter
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
