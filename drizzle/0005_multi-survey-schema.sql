-- Multi-Survey + Multi-Branchen Schema Migration
-- Issue #60 — Clean Break (no production users)

-- ============================================================
-- 1. CREATE ENUM
-- ============================================================
CREATE TYPE "public"."survey_status" AS ENUM('draft', 'active', 'paused', 'archived');

-- ============================================================
-- 2. CREATE survey_templates TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS "survey_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "industry_category" text NOT NULL,
  "industry_sub_category" text,
  "respondent_type" text NOT NULL DEFAULT 'patient',
  "category" text NOT NULL DEFAULT 'customer',
  "questions" jsonb NOT NULL,
  "is_system" boolean DEFAULT true,
  "sort_order" smallint DEFAULT 0,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- ============================================================
-- 3. PRACTICES — add industry columns, drop survey_template
-- ============================================================
ALTER TABLE "practices" ADD COLUMN "industry_category" text DEFAULT 'gesundheit';
ALTER TABLE "practices" ADD COLUMN "industry_sub_category" text DEFAULT 'zahnarztpraxis';
ALTER TABLE "practices" DROP COLUMN IF EXISTS "survey_template";

-- ============================================================
-- 4. SURVEYS — add new columns, replace isActive with status
-- ============================================================
ALTER TABLE "surveys" ADD COLUMN "status" "public"."survey_status" DEFAULT 'draft';
ALTER TABLE "surveys" ADD COLUMN "respondent_type" text DEFAULT 'patient';
ALTER TABLE "surveys" ADD COLUMN "template_id" uuid REFERENCES "survey_templates"("id") ON DELETE SET NULL;
ALTER TABLE "surveys" ADD COLUMN "description" text;
ALTER TABLE "surveys" ADD COLUMN "starts_at" timestamp with time zone;
ALTER TABLE "surveys" ADD COLUMN "ends_at" timestamp with time zone;
ALTER TABLE "surveys" ADD COLUMN "source_survey_id" uuid;
ALTER TABLE "surveys" ADD COLUMN "anonymity_threshold" smallint DEFAULT 5;
ALTER TABLE "surveys" ADD COLUMN "auto_delete_after_months" smallint;

-- Migrate existing surveys: active surveys → 'active', inactive → 'paused'
UPDATE "surveys" SET "status" = CASE WHEN "is_active" = true THEN 'active'::"public"."survey_status" ELSE 'paused'::"public"."survey_status" END;

-- Drop old boolean column
ALTER TABLE "surveys" DROP COLUMN IF EXISTS "is_active";

-- ============================================================
-- 5. RESPONSES — add answers JSONB, backfill, drop old columns
-- ============================================================
ALTER TABLE "responses" ADD COLUMN "answers" jsonb DEFAULT '{}';

-- Backfill: copy old rating columns into answers JSONB
UPDATE "responses" SET "answers" = jsonb_build_object(
  'wait_time', "rating_wait_time",
  'friendliness', "rating_friendliness",
  'treatment', "rating_treatment",
  'facility', "rating_facility"
) WHERE "rating_wait_time" IS NOT NULL
   OR "rating_friendliness" IS NOT NULL
   OR "rating_treatment" IS NOT NULL
   OR "rating_facility" IS NOT NULL;

-- Drop old rating columns (Clean Break — no production users)
ALTER TABLE "responses" DROP COLUMN IF EXISTS "rating_wait_time";
ALTER TABLE "responses" DROP COLUMN IF EXISTS "rating_friendliness";
ALTER TABLE "responses" DROP COLUMN IF EXISTS "rating_treatment";
ALTER TABLE "responses" DROP COLUMN IF EXISTS "rating_facility";

-- ============================================================
-- 6. UPDATE RLS POLICY — surveys anon select
-- ============================================================
-- The old policy checks is_active = true, which no longer exists.
-- Replace with status = 'active' check.
DROP POLICY IF EXISTS "surveys_select_active_anon" ON "surveys";
CREATE POLICY "surveys_select_active_anon"
  ON "surveys"
  FOR SELECT
  TO anon
  USING ("status" = 'active');
