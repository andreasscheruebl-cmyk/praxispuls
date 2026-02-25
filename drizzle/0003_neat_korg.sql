CREATE TABLE "audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid,
	"action" text NOT NULL,
	"entity" text,
	"entity_id" text,
	"before" jsonb,
	"after" jsonb,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "practices" DROP CONSTRAINT "practices_email_unique";--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "owner_user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "google_redirect_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "practices" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "surveys" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_events_practice" ON "audit_events" USING btree ("practice_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_audit_events_action" ON "audit_events" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_practices_owner" ON "practices" USING btree ("owner_user_id");