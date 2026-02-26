import {
  pgTable,
  uuid,
  text,
  boolean,
  smallint,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// PRACTICES (Tenants)
// ============================================================
export const practices = pgTable(
  "practices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: uuid("owner_user_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    email: text("email").notNull(),
    googlePlaceId: text("google_place_id"),
    googleReviewUrl: text("google_review_url"),
    postalCode: text("postal_code"),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color").default("#2563EB"),
    plan: text("plan").default("free"), // free | starter | professional
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    alertEmail: text("alert_email"),
    surveyTemplate: text("survey_template").default("zahnarzt_standard"),
    theme: text("theme").default("standard"), // standard | vertrauen
    planOverride: text("plan_override"), // free | starter | professional (admin-set)
    overrideReason: text("override_reason"),
    overrideExpiresAt: timestamp("override_expires_at", { withTimezone: true }),
    npsThreshold: smallint("nps_threshold").default(9),
    googleRedirectEnabled: boolean("google_redirect_enabled").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft delete
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
  },
  (table) => ({
    ownerIdx: index("idx_practices_owner").on(table.ownerUserId),
  })
);

// ============================================================
// SURVEYS
// ============================================================
export const surveys = pgTable(
  "surveys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id, { onDelete: "cascade" }),
    title: text("title").notNull().default("Patientenbefragung"),
    questions: jsonb("questions").notNull(),
    isActive: boolean("is_active").default(true),
    slug: text("slug").unique().notNull(),
    config: jsonb("config").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }), // Soft delete
  },
  (table) => ({
    slugIdx: index("idx_surveys_slug").on(table.slug),
  })
);

// ============================================================
// RESPONSES (No PII!)
// ============================================================
export const responses = pgTable(
  "responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    surveyId: uuid("survey_id")
      .notNull()
      .references(() => surveys.id, { onDelete: "cascade" }),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id, { onDelete: "cascade" }),
    npsScore: smallint("nps_score").notNull(),
    npsCategory: text("nps_category").notNull(), // promoter | passive | detractor
    ratingWaitTime: smallint("rating_wait_time"),
    ratingFriendliness: smallint("rating_friendliness"),
    ratingTreatment: smallint("rating_treatment"),
    ratingFacility: smallint("rating_facility"),
    freeText: text("free_text"),
    language: text("language").default("de"),
    channel: text("channel").default("qr"), // qr | link | email
    routedTo: text("routed_to"), // google | internal | null
    googleReviewShown: boolean("google_review_shown").default(false),
    googleReviewClicked: boolean("google_review_clicked").default(false),
    deviceType: text("device_type"), // mobile | tablet | desktop
    sessionHash: text("session_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    practiceCreatedIdx: index("idx_responses_practice").on(
      table.practiceId,
      table.createdAt
    ),
    npsIdx: index("idx_responses_nps").on(table.practiceId, table.npsCategory),
    sessionIdx: index("idx_responses_session").on(table.sessionHash),
  })
);

// ============================================================
// ALERTS (Detractor Notifications)
// ============================================================
export const alerts = pgTable(
  "alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id, { onDelete: "cascade" }),
    responseId: uuid("response_id")
      .notNull()
      .references(() => responses.id, { onDelete: "cascade" }),
    type: text("type").default("detractor"),
    isRead: boolean("is_read").default(false),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    unreadIdx: index("idx_alerts_unread").on(table.practiceId, table.isRead),
  })
);

// ============================================================
// LOGIN EVENTS (Audit Log)
// ============================================================
export const loginEvents = pgTable(
  "login_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practiceId: uuid("practice_id")
      .notNull()
      .references(() => practices.id, { onDelete: "cascade" }),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    method: text("method").default("password"), // password | magic_link | oauth
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    practiceIdx: index("idx_login_events_practice").on(
      table.practiceId,
      table.createdAt
    ),
  })
);

// ============================================================
// AUDIT EVENTS (Change tracking)
// ============================================================
export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    practiceId: uuid("practice_id").references(() => practices.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(), // e.g. practice.updated, practice.deleted, survey.toggled, plan.changed
    entity: text("entity"), // e.g. practice, survey, subscription
    entityId: text("entity_id"), // UUID of affected entity
    before: jsonb("before"), // State before change (partial)
    after: jsonb("after"), // State after change (partial)
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    practiceIdx: index("idx_audit_events_practice").on(
      table.practiceId,
      table.createdAt
    ),
    actionIdx: index("idx_audit_events_action").on(table.action),
  })
);

// ============================================================
// RELATIONS
// ============================================================
export const practicesRelations = relations(practices, ({ many }) => ({
  surveys: many(surveys),
  responses: many(responses),
  alerts: many(alerts),
  loginEvents: many(loginEvents),
  auditEvents: many(auditEvents),
}));

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  practice: one(practices, {
    fields: [surveys.practiceId],
    references: [practices.id],
  }),
  responses: many(responses),
}));

export const responsesRelations = relations(responses, ({ one }) => ({
  survey: one(surveys, {
    fields: [responses.surveyId],
    references: [surveys.id],
  }),
  practice: one(practices, {
    fields: [responses.practiceId],
    references: [practices.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  practice: one(practices, {
    fields: [alerts.practiceId],
    references: [practices.id],
  }),
  response: one(responses, {
    fields: [alerts.responseId],
    references: [responses.id],
  }),
}));

export const loginEventsRelations = relations(loginEvents, ({ one }) => ({
  practice: one(practices, {
    fields: [loginEvents.practiceId],
    references: [practices.id],
  }),
}));

export const auditEventsRelations = relations(auditEvents, ({ one }) => ({
  practice: one(practices, {
    fields: [auditEvents.practiceId],
    references: [practices.id],
  }),
}));

// ============================================================
// TYPES (inferred from schema)
// ============================================================
export type Practice = typeof practices.$inferSelect;
export type NewPractice = typeof practices.$inferInsert;
export type Survey = typeof surveys.$inferSelect;
export type NewSurvey = typeof surveys.$inferInsert;
export type Response = typeof responses.$inferSelect;
export type NewResponse = typeof responses.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type LoginEvent = typeof loginEvents.$inferSelect;
export type NewLoginEvent = typeof loginEvents.$inferInsert;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;
