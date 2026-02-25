import type { Practice } from "@/lib/db/schema";
import type { PlanId } from "@/types";

/**
 * Determine the effective plan for a practice.
 * Priority: active override > Stripe plan > "free"
 */
export function getEffectivePlan(
  practice: Pick<
    Practice,
    "plan" | "planOverride" | "overrideExpiresAt"
  >
): PlanId {
  // Check override (must not be expired)
  if (practice.planOverride) {
    const expired =
      practice.overrideExpiresAt &&
      new Date(practice.overrideExpiresAt) < new Date();

    if (!expired) {
      return practice.planOverride as PlanId;
    }
  }

  // Fall back to Stripe plan or free
  return (practice.plan as PlanId) || "free";
}
