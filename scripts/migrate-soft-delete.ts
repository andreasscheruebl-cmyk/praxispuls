import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());
const sql = postgres(process.env.DATABASE_URL!);

async function run() {
  const statements = [
    // Soft delete columns
    `ALTER TABLE "practices" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone`,
    `ALTER TABLE "surveys" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp with time zone`,

    // Audit events table
    `CREATE TABLE IF NOT EXISTS "audit_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "practice_id" uuid REFERENCES "public"."practices"("id") ON DELETE SET NULL,
      "action" text NOT NULL,
      "entity" text,
      "entity_id" text,
      "before" jsonb,
      "after" jsonb,
      "ip_address" text,
      "user_agent" text,
      "created_at" timestamp with time zone DEFAULT now()
    )`,
    `CREATE INDEX IF NOT EXISTS "idx_audit_events_practice" ON "audit_events" USING btree ("practice_id", "created_at")`,
    `CREATE INDEX IF NOT EXISTS "idx_audit_events_action" ON "audit_events" USING btree ("action")`,
  ];

  for (const stmt of statements) {
    try {
      await sql.unsafe(stmt);
      console.log(`OK: ${stmt.substring(0, 70)}...`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`ERROR: ${msg}`);
    }
  }

  await sql.end();
  console.log("\nMigration complete!");
}

run().catch(console.error);
