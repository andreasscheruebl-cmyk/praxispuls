import type { PlanId } from "@/types";

export const PLAN_BADGE_STYLES: Record<PlanId, string> = {
  free: "bg-gray-100 text-gray-700 border-gray-200",
  starter: "bg-blue-100 text-blue-700 border-blue-200",
  professional: "bg-purple-100 text-purple-700 border-purple-200",
};

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Professional",
};
