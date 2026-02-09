import { loadEnvConfig } from "@next/env";
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

loadEnvConfig(process.cwd());

const sql = postgres(process.env.DATABASE_URL!);

async function run() {
  const migrations = [
    "0001_adorable_omega_red.sql",
    "0001_rls_policies.sql",
    "0002_bored_green_goblin.sql",
  ];

  for (const file of migrations) {
    const path = join(process.cwd(), "drizzle", file);
    const content = readFileSync(path, "utf-8");

    // Split on --> statement-breakpoint and run each statement
    const statements = content
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    console.log(`\n--- Running ${file} (${statements.length} statements) ---`);

    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt);
        console.log(`  OK: ${stmt.substring(0, 60)}...`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        // Skip "already exists" errors
        if (msg.includes("already exists")) {
          console.log(`  SKIP (already exists): ${stmt.substring(0, 60)}...`);
        } else {
          console.error(`  ERROR: ${msg}`);
          console.error(`  Statement: ${stmt.substring(0, 120)}`);
        }
      }
    }
  }

  await sql.end();
  console.log("\nDone!");
}

run().catch(console.error);
