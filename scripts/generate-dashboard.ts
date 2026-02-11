/**
 * Generate DASHBOARD.md – Single Source of Truth
 * Reads tickets, sprints, package.json, and optionally last CI run.
 *
 * Usage: npx tsx scripts/generate-dashboard.ts
 *        npm run status
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");
const TICKETS_DIR = path.join(ROOT, ".tickets");
const OUTPUT = path.join(ROOT, "DASHBOARD.md");

interface Ticket {
  id: string;
  type: string;
  title: string;
  status: string;
  priority: string;
  sprint: string;
  branch: string;
  tags: string[];
}

interface Sprint {
  name: string;
  weeks: string;
  status: string;
  goal: string;
}

// --- Parse ticket frontmatter ---
function parseTicket(filePath: string): Ticket | null {
  const content = fs.readFileSync(filePath, "utf-8").replace(/\r\n/g, "\n");
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;

  const fm = fmMatch[1]!;
  const get = (key: string): string => {
    const m = fm.match(new RegExp(`^${key}:\\s*"?(.+?)"?$`, "m"));
    return m?.[1]?.trim() ?? "";
  };

  const tagsMatch = fm.match(/^tags:\s*\[(.+)\]/m);
  const tags = tagsMatch?.[1]
    ? tagsMatch[1].split(",").map((t) => t.trim())
    : [];

  return {
    id: get("id"),
    type: get("type"),
    title: get("title"),
    status: get("status"),
    priority: get("priority"),
    sprint: get("sprint"),
    branch: get("branch"),
    tags,
  };
}

// --- Read all tickets from a folder ---
function readTickets(folder: string): Ticket[] {
  const dir = path.join(TICKETS_DIR, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => parseTicket(path.join(dir, f)))
    .filter((t): t is Ticket => t !== null)
    .sort((a, b) => {
      const numA = parseInt(a.id.replace("PP-", ""));
      const numB = parseInt(b.id.replace("PP-", ""));
      return numA - numB;
    });
}

// --- Priority sort order ---
function prioOrder(p: string): number {
  return { critical: 0, high: 1, medium: 2, low: 3 }[p] ?? 4;
}

// --- Format ticket line ---
function ticketLine(t: Ticket, showBranch = false): string {
  const prioIcon = { critical: "!!!", high: "!!", medium: "!", low: "" }[
    t.priority
  ] ?? "";
  const prio = prioIcon ? ` (${t.priority})` : ` (${t.priority})`;
  const branch = showBranch && t.branch ? ` → \`${t.branch}\`` : "";
  return `- **${t.id}** [${t.type}] ${t.title}${prio}${branch}`;
}

// --- Get last CI run (optional, needs gh CLI) ---
function getLastCiRun(): string | null {
  try {
    const result = execSync(
      'gh run list --limit 1 --json databaseId,status,conclusion,headBranch,event,createdAt --jq ".[0]"',
      { encoding: "utf-8", timeout: 5000, stdio: ["pipe", "pipe", "pipe"] }
    );
    if (!result.trim()) return null;
    const run = JSON.parse(result.trim());
    const icon = run.conclusion === "success" ? "✅" : run.conclusion === "failure" ? "❌" : "⏳";
    return `${icon} Run #${run.databaseId} (${run.conclusion || run.status}) on \`${run.headBranch}\` – ${run.createdAt?.slice(0, 10) || "?"}`;
  } catch {
    return null;
  }
}

// --- Get current git info ---
function getGitInfo(): { branch: string; lastTag: string } {
  let branch = "unknown";
  let lastTag = "none";
  try {
    branch = execSync("git branch --show-current", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch { /* ignore */ }
  try {
    lastTag = execSync("git describe --tags --abbrev=0 2>/dev/null", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch { /* ignore */ }
  return { branch, lastTag };
}

// --- Main ---
function main() {
  const backlog = readTickets("backlog").sort((a, b) => prioOrder(a.priority) - prioOrder(b.priority));
  const active = readTickets("active").sort((a, b) => prioOrder(a.priority) - prioOrder(b.priority));
  const review = readTickets("review");
  const done = readTickets("done");

  // Sprint info
  let currentSprint: Sprint | null = null;
  let sprintName = "?";
  try {
    const sprints = JSON.parse(
      fs.readFileSync(path.join(TICKETS_DIR, "sprints.json"), "utf-8")
    );
    sprintName = sprints.current_sprint || "?";
    currentSprint = sprints.sprints?.[sprintName] || null;
  } catch { /* ignore */ }

  // Package version
  let version = "?";
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")
    );
    version = pkg.version || "?";
  } catch { /* ignore */ }

  // Git info
  const git = getGitInfo();

  // CI info
  const ciRun = getLastCiRun();

  // Sprint ticket counts
  const allTickets = [...backlog, ...active, ...review, ...done];
  const sprintTickets = allTickets.filter((t) => t.sprint === sprintName);
  const sprintDone = sprintTickets.filter((t) => t.status === "done").length;
  const sprintActive = sprintTickets.filter((t) => t.status === "active").length;
  const sprintReview = sprintTickets.filter((t) => t.status === "review").length;
  const sprintBacklog = sprintTickets.filter((t) => t.status === "backlog").length;

  // Build dashboard
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const lines: string[] = [];

  lines.push("# PraxisPuls – Dashboard");
  lines.push(`> Generiert: ${now} | Version: ${version} | Branch: \`${git.branch}\``);
  lines.push("");

  // Sprint
  lines.push(`## Sprint: ${sprintName}${currentSprint ? ` – ${currentSprint.name}` : ""}`);
  if (currentSprint) {
    lines.push(`> Wochen ${currentSprint.weeks} | ${currentSprint.goal}`);
  }
  lines.push("");
  lines.push(`| Done | Active | Review | Backlog | Total |`);
  lines.push(`|------|--------|--------|---------|-------|`);
  lines.push(`| ${sprintDone} | ${sprintActive} | ${sprintReview} | ${sprintBacklog} | ${sprintTickets.length} |`);
  lines.push("");

  // CI
  if (ciRun) {
    lines.push(`## CI`);
    lines.push(ciRun);
    lines.push("");
  }

  // Kanban
  lines.push("## Kanban");
  lines.push("");

  // Active
  lines.push("### Active");
  if (active.length === 0) {
    lines.push("_(keine)_");
  } else {
    active.forEach((t) => lines.push(ticketLine(t, true)));
  }
  lines.push("");

  // Review
  lines.push("### Review");
  if (review.length === 0) {
    lines.push("_(keine)_");
  } else {
    review.forEach((t) => lines.push(ticketLine(t)));
  }
  lines.push("");

  // Backlog
  lines.push("### Backlog");
  if (backlog.length === 0) {
    lines.push("_(keine)_");
  } else {
    backlog.forEach((t) => lines.push(ticketLine(t)));
  }
  lines.push("");

  // Done (last 10)
  const recentDone = done.slice(-10).reverse();
  lines.push(`### Done (letzte ${recentDone.length} von ${done.length})`);
  recentDone.forEach((t) => lines.push(ticketLine(t)));
  lines.push("");

  // Stats
  lines.push("## Statistik");
  lines.push("");
  lines.push(`| Status | Anzahl |`);
  lines.push(`|--------|--------|`);
  lines.push(`| Backlog | ${backlog.length} |`);
  lines.push(`| Active | ${active.length} |`);
  lines.push(`| Review | ${review.length} |`);
  lines.push(`| Done | ${done.length} |`);
  lines.push(`| **Gesamt** | **${allTickets.length}** |`);
  lines.push("");

  // Version & Deploy
  lines.push("## Version & Deploy");
  lines.push("");
  lines.push(`- **Version:** ${version}`);
  lines.push(`- **Git Tag:** ${git.lastTag}`);
  lines.push(`- **Production:** https://praxispuls.vercel.app`);
  lines.push(`- **Deploy:** Automatisch via Vercel bei Push auf \`main\``);
  lines.push("");

  // Links & Resources
  lines.push("## Links & Resources");
  lines.push("");
  lines.push("### Projekt");
  lines.push("- [GitHub Repo](https://github.com/andreasscheruebl-cmyk/praxispuls)");
  lines.push("- [CI/CD (GitHub Actions)](https://github.com/andreasscheruebl-cmyk/praxispuls/actions)");
  lines.push("- [Vercel Dashboard](https://vercel.com/dashboard)");
  lines.push("- [Production](https://praxispuls.vercel.app)");
  lines.push("");
  lines.push("### Services");
  lines.push("- [Supabase Dashboard](https://supabase.com/dashboard)");
  lines.push("- [Stripe Dashboard](https://dashboard.stripe.com)");
  lines.push("- [Resend Dashboard](https://resend.com)");
  lines.push("- [Google Cloud Console (Places API)](https://console.cloud.google.com)");
  lines.push("");
  lines.push("### Lokale Ordner");
  lines.push("| Ordner | Inhalt |");
  lines.push("|--------|--------|");
  lines.push("| `.tickets/` | TicketOps (backlog, active, review, done) |");
  lines.push("| `.tickets/sprints.json` | Sprint-Definitionen + aktueller Sprint |");
  lines.push("| `src/app/` | Next.js App Router (Pages, API Routes) |");
  lines.push("| `src/components/` | UI-Komponenten (shadcn/ui, survey, dashboard) |");
  lines.push("| `src/lib/` | Business Logic (DB, Auth, Stripe, Email, Validations) |");
  lines.push("| `src/lib/db/schema.ts` | Drizzle DB Schema (4 Tabellen) |");
  lines.push("| `e2e/` | Playwright E2E Tests |");
  lines.push("| `src/lib/__tests__/` | Vitest Unit Tests |");
  lines.push("| `scripts/` | Build/Deploy/Ticket Scripts |");
  lines.push("| `.github/workflows/` | CI Pipeline (4 Jobs) |");
  lines.push("| `drizzle/` | DB Migrations |");
  lines.push("| `CLAUDE.md` | Projekt-Regeln für Claude Code |");
  lines.push("");
  lines.push("### Docs");
  lines.push("- [Next.js 15 Docs](https://nextjs.org/docs)");
  lines.push("- [Drizzle ORM Docs](https://orm.drizzle.team)");
  lines.push("- [Supabase Docs](https://supabase.com/docs)");
  lines.push("- [Stripe Docs](https://docs.stripe.com)");
  lines.push("- [Playwright Docs](https://playwright.dev/docs/intro)");
  lines.push("- [shadcn/ui](https://ui.shadcn.com)");
  lines.push("- [Tailwind CSS](https://tailwindcss.com/docs)");
  lines.push("");

  lines.push("---");
  lines.push("_Auto-generiert von `npm run status` – nicht manuell editieren._");
  lines.push("");

  fs.writeFileSync(OUTPUT, lines.join("\n"), "utf-8");
  console.log(`Dashboard generiert: ${OUTPUT}`);
}

main();
