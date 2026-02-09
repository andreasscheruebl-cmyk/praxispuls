import { loadEnvConfig } from "@next/env";
import postgres from "postgres";

loadEnvConfig(process.cwd());
const sql = postgres(process.env.DATABASE_URL!);

async function check() {
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log("Tabellen im public Schema:");
  for (const r of tables) {
    console.log(`  - ${r.table_name}`);
  }

  // Check login_events specifically
  const cols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'login_events'
    ORDER BY ordinal_position
  `;
  console.log("\nlogin_events Spalten:");
  for (const c of cols) {
    console.log(`  - ${c.column_name} (${c.data_type})`);
  }

  // Count rows in each table
  const counts = await sql`
    SELECT
      (SELECT count(*) FROM practices) as practices,
      (SELECT count(*) FROM surveys) as surveys,
      (SELECT count(*) FROM responses) as responses,
      (SELECT count(*) FROM alerts) as alerts,
      (SELECT count(*) FROM login_events) as login_events
  `;
  console.log("\nZeilen pro Tabelle:");
  for (const [k, v] of Object.entries(counts[0] ?? {})) {
    console.log(`  - ${k}: ${v}`);
  }

  await sql.end();
}

check().catch(console.error);
