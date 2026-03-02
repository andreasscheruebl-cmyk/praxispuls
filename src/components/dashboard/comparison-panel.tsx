"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBars } from "./category-bars";
import { BarChart2 } from "lucide-react";
import type { ComparisonStats } from "@/lib/db/queries/compare";

type ComparisonPanelProps = {
  label: string;
  sublabel?: string;
  data: ComparisonStats | null;
  isLoading: boolean;
};

function getNpsColor(nps: number): string {
  if (nps > 50) return "text-green-600";
  if (nps >= 0) return "text-yellow-600";
  return "text-red-600";
}

function Skeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-16 w-24 animate-pulse rounded bg-muted" />
        <div className="flex gap-4">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-24 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <BarChart2 className="mb-3 h-10 w-10 opacity-40" />
        <p className="text-sm">Keine Daten</p>
      </CardContent>
    </Card>
  );
}

export function ComparisonPanel({
  label,
  sublabel,
  data,
  isLoading,
}: ComparisonPanelProps) {
  if (isLoading) return <Skeleton />;
  if (!data || data.totalResponses === 0) return <EmptyState />;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          {label}
          {sublabel && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {sublabel}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* NPS Score */}
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Empfehlungsindex
          </p>
          <p
            className={`text-4xl font-bold tabular-nums ${
              data.npsScore !== null ? getNpsColor(data.npsScore) : "text-muted-foreground"
            }`}
          >
            {data.npsScore !== null ? data.npsScore : "–"}
          </p>
        </div>

        {/* Response count + P/P/D breakdown */}
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            {data.totalResponses} Antworten
          </p>
          <div className="flex gap-4 text-xs">
            <span className="text-green-600">
              {data.promoters} Zufriedene
            </span>
            <span className="text-yellow-600">
              {data.passives} Passive
            </span>
            <span className="text-red-600">
              {data.detractors} Kritiker
            </span>
          </div>
        </div>

        {/* Category bars */}
        {data.categoryScores.length > 0 && (
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
              Kategorien
            </p>
            <CategoryBars categories={data.categoryScores} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
