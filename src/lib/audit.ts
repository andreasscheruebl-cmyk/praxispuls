import { db } from "@/lib/db";
import { auditEvents } from "@/lib/db/schema";

type AuditParams = {
  practiceId: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Log an audit event. Fire-and-forget – never throws.
 */
export function logAudit(params: AuditParams): void {
  db.insert(auditEvents)
    .values({
      practiceId: params.practiceId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      before: params.before ?? null,
      after: params.after ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
    })
    .catch((err) => {
      console.error("Audit log failed:", err);
    });
}

/**
 * Extract IP + User-Agent from a Request object.
 */
export function getRequestMeta(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  return {
    ipAddress: forwarded ? forwarded.split(",")[0]?.trim() : null,
    userAgent: request.headers.get("user-agent"),
  };
}
