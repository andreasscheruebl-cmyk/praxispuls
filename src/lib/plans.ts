import type { Practice } from "@/lib/db/schema";
import type { PlanId } from "@/types";

/**
 * Determine the effective plan for a practice.
 * Priority: active override > Stripe plan > "free"
 */
export function getEffectivePlan(
  practice: Pick<Practice, "plan" | "planOverride" | "overrideExpiresAt">
): PlanId {
  // Check for active (non-expired) override
  if (practice.planOverride) {
    const now = new Date();
    const expired =
      practice.overrideExpiresAt && new Date(practice.overrideExpiresAt) < now;

    if (!expired) {
      return practice.planOverride as PlanId;
    }
  }

  // Fall back to Stripe plan or free
  return (practice.plan as PlanId) || "free";
}
