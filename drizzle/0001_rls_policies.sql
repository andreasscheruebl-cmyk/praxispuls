-- ============================================================
-- Migration: 0001_rls_policies.sql
-- Enable Row Level Security on all tables and create policies.
--
-- Architecture:
--   - Drizzle ORM connects as `postgres` (service role) and bypasses RLS.
--   - RLS is defense-in-depth against direct Supabase REST API access
--     using the public anon key or an authenticated user's JWT.
--   - Users are linked to practices via practices.email = auth.jwt() ->> 'email'.
-- ============================================================

-- ============================================================
-- 1. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. PRACTICES POLICIES
--    - anon: no access at all
--    - authenticated: full CRUD on own practice row only
-- ============================================================

-- Allow authenticated users to read their own practice
CREATE POLICY "practices_select_own"
  ON practices
  FOR SELECT
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'));

-- Allow authenticated users to update their own practice (settings, branding, etc.)
CREATE POLICY "practices_update_own"
  ON practices
  FOR UPDATE
  TO authenticated
  USING (email = (SELECT auth.jwt() ->> 'email'))
  WITH CHECK (email = (SELECT auth.jwt() ->> 'email'));

-- Allow authenticated users to insert their own practice during onboarding.
-- The inserted email must match the JWT email so users cannot create
-- practices for other accounts.
CREATE POLICY "practices_insert_own"
  ON practices
  FOR INSERT
  TO authenticated
  WITH CHECK (email = (SELECT auth.jwt() ->> 'email'));

-- ============================================================
-- 3. SURVEYS POLICIES
--    - authenticated: SELECT/INSERT/UPDATE own surveys (via practice ownership)
--    - anon: SELECT active surveys only (public survey pages load via Supabase REST)
-- ============================================================

-- Authenticated users can read surveys belonging to their practice
CREATE POLICY "surveys_select_own"
  ON surveys
  FOR SELECT
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM practices WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- Authenticated users can create surveys for their practice
CREATE POLICY "surveys_insert_own"
  ON surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    practice_id IN (
      SELECT id FROM practices WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- Authenticated users can update their own surveys (toggle active, edit questions)
CREATE POLICY "surveys_update_own"
  ON surveys
  FOR UPDATE
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM practices WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    practice_id IN (
      SELECT id FROM practices WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- Anonymous users (patients) can read active surveys on the public survey page.
-- Only active surveys are exposed; inactive/draft surveys stay hidden.
CREATE POLICY "surveys_select_active_anon"
  ON surveys
  FOR SELECT
  TO anon
  USING (is_active = true);

-- ============================================================
-- 4. RESPONSES POLICIES
--    - authenticated: SELECT own practice's responses (dashboard analytics)
--    - anon + authenticated: INSERT (patients submitting survey responses)
--    - No UPDATE or DELETE for non-service roles (data integrity)
-- ============================================================

-- Authenticated users (practice owners) can read responses for their practice
CREATE POLICY "responses_select_own"
  ON responses
  FOR SELECT
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM practices WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- Anonymous users (patients) can submit survey responses.
-- No authentication required since patients are not app users.
CREATE POLICY "responses_insert_anon"
  ON responses
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users can also submit responses (edge case: practice owner testing)
CREATE POLICY "responses_insert_authenticated"
  ON responses
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No UPDATE or DELETE policies: once submitted, responses are immutable.
-- Only the service role (Drizzle ORM via postgres user) can modify them.

-- ============================================================
-- 5. ALERTS POLICIES
--    - authenticated: SELECT + UPDATE own practice's alerts (mark as read, add notes)
--    - No INSERT for non-service roles (alerts are created server-side by the API)
--    - No DELETE for non-service roles
-- ============================================================

-- Authenticated users can read alerts for their practice
CREATE POLICY "alerts_select_own"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM practices WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- Authenticated users can update their own alerts (mark as read, add notes)
CREATE POLICY "alerts_update_own"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (
    practice_id IN (
      SELECT id FROM practices WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  )
  WITH CHECK (
    practice_id IN (
      SELECT id FROM practices WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- No INSERT or DELETE policies: alerts are created and managed
-- exclusively by the API server running as the service role.
