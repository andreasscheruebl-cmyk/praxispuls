import type { SurveyStatus } from "@/lib/db/schema";

// ============================================================
// STATUS TRANSITIONS
// ============================================================

const VALID_TRANSITIONS: Record<SurveyStatus, SurveyStatus[]> = {
  draft: ["active"],
  active: ["paused", "archived"],
  paused: ["active", "archived"],
  archived: ["paused"],
};

export function canTransition(from: SurveyStatus, to: SurveyStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAvailableTransitions(status: SurveyStatus): SurveyStatus[] {
  return VALID_TRANSITIONS[status] ?? [];
}

// ============================================================
// COMPUTED STATE (status + time → visual state)
// ============================================================

export type ComputedSurveyState =
  | SurveyStatus
  | "scheduled"
  | "ended";

export function getComputedState(
  status: SurveyStatus,
  startsAt: Date | string | null,
  endsAt: Date | string | null,
  now: Date = new Date()
): ComputedSurveyState {
  if (status !== "active") return status;

  const startsAtDate = startsAt ? new Date(startsAt) : null;
  const endsAtDate = endsAt ? new Date(endsAt) : null;

  if (startsAtDate && startsAtDate > now) return "scheduled";
  if (endsAtDate && endsAtDate < now) return "ended";

  return "active";
}

// ============================================================
// AVAILABLE ACTIONS (per status)
// ============================================================

export type SurveyAction =
  | "activate"
  | "pause"
  | "archive"
  | "unarchive"
  | "edit"
  | "delete"
  | "show-qr"
  | "copy-link"
  | "delete-responses";

export function getAvailableActions(status: SurveyStatus): SurveyAction[] {
  switch (status) {
    case "draft":
      return ["activate", "edit", "delete", "show-qr", "copy-link"];
    case "active":
      return ["pause", "archive", "show-qr", "copy-link", "delete-responses"];
    case "paused":
      return ["activate", "archive", "show-qr", "copy-link", "delete-responses"];
    case "archived":
      return ["unarchive", "delete", "delete-responses"];
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

// ============================================================
// STATUS BADGE CONFIG
// ============================================================

interface BadgeConfig {
  label: string;
  className: string;
}

export const STATUS_BADGE_CONFIG: Record<ComputedSurveyState, BadgeConfig> = {
  draft: { label: "Entwurf", className: "bg-gray-100 text-gray-700" },
  active: { label: "Aktiv", className: "bg-green-100 text-green-700" },
  paused: { label: "Pausiert", className: "bg-yellow-100 text-yellow-700" },
  archived: { label: "Archiviert", className: "bg-slate-100 text-slate-600" },
  scheduled: { label: "Geplant", className: "bg-blue-100 text-blue-700" },
  ended: { label: "Beendet", className: "bg-orange-100 text-orange-700" },
};
