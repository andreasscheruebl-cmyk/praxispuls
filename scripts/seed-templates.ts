/**
 * Seed system templates into survey_templates table.
 * Idempotent: uses ON CONFLICT (slug) DO NOTHING.
 *
 * Usage: npx tsx scripts/seed-templates.ts
 */
import { loadEnvConfig } from "@next/env";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { SYSTEM_TEMPLATES } from "../src/lib/template-data";
import * as schema from "../src/lib/db/schema";

loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: "require",
  prepare: false,
  max: 1,
});

const db = drizzle(sql, { schema });

async function seed() {
  console.log(`Seeding ${SYSTEM_TEMPLATES.length} system templates...`);

  let inserted = 0;
  let skipped = 0;

  for (const template of SYSTEM_TEMPLATES) {
    try {
      const result = await db
        .insert(schema.surveyTemplates)
        .values(template)
        .onConflictDoNothing({ target: schema.surveyTemplates.slug })
        .returning({ id: schema.surveyTemplates.id });

      if (result.length > 0) {
        inserted++;
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`Failed to insert template "${template.slug}":`, error);
    }
  }

  console.log(`Done: ${inserted} inserted, ${skipped} skipped (already exist).`);
  await sql.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
