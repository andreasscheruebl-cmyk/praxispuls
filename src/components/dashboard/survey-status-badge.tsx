"use client";

import { Badge } from "@/components/ui/badge";
import { getComputedState, STATUS_BADGE_CONFIG } from "@/lib/survey-status";
import type { SurveyStatus } from "@/lib/db/schema";

interface SurveyStatusBadgeProps {
  status: SurveyStatus;
  startsAt?: string | null;
  endsAt?: string | null;
}

export function SurveyStatusBadge({
  status,
  startsAt,
  endsAt,
}: SurveyStatusBadgeProps) {
  const computed = getComputedState(status, startsAt ?? null, endsAt ?? null);
  const config = STATUS_BADGE_CONFIG[computed];

  return (
    <Badge variant="outline" className={`border-0 ${config.className}`}>
      {config.label}
    </Badge>
  );
}
