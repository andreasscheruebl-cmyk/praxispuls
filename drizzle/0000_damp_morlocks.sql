CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid NOT NULL,
	"response_id" uuid NOT NULL,
	"type" text DEFAULT 'detractor',
	"is_read" boolean DEFAULT false,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "practices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"email" text NOT NULL,
	"google_place_id" text,
	"google_review_url" text,
	"postal_code" text,
	"logo_url" text,
	"primary_color" text DEFAULT '#2563EB',
	"plan" text DEFAULT 'free',
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"alert_email" text,
	"survey_template" text DEFAULT 'zahnarzt_standard',
	"nps_threshold" smallint DEFAULT 9,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "practices_slug_unique" UNIQUE("slug"),
	CONSTRAINT "practices_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"survey_id" uuid NOT NULL,
	"practice_id" uuid NOT NULL,
	"nps_score" smallint NOT NULL,
	"nps_category" text NOT NULL,
	"rating_wait_time" smallint,
	"rating_friendliness" smallint,
	"rating_treatment" smallint,
	"rating_facility" smallint,
	"free_text" text,
	"language" text DEFAULT 'de',
	"channel" text DEFAULT 'qr',
	"routed_to" text,
	"google_review_shown" boolean DEFAULT false,
	"google_review_clicked" boolean DEFAULT false,
	"device_type" text,
	"session_hash" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "surveys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"practice_id" uuid NOT NULL,
	"title" text DEFAULT 'Patientenbefragung' NOT NULL,
	"questions" jsonb NOT NULL,
	"is_active" boolean DEFAULT true,
	"slug" text NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "surveys_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_response_id_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_survey_id_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."surveys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "responses" ADD CONSTRAINT "responses_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_practice_id_practices_id_fk" FOREIGN KEY ("practice_id") REFERENCES "public"."practices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_alerts_unread" ON "alerts" USING btree ("practice_id","is_read");--> statement-breakpoint
CREATE INDEX "idx_responses_practice" ON "responses" USING btree ("practice_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_responses_nps" ON "responses" USING btree ("practice_id","nps_category");--> statement-breakpoint
CREATE INDEX "idx_responses_session" ON "responses" USING btree ("session_hash");--> statement-breakpoint
CREATE INDEX "idx_surveys_slug" ON "surveys" USING btree ("slug");