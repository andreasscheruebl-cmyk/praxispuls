# PraxisPuls – Dashboard
> Generiert: 2026-02-11 12:31 | Version: 0.1.0 | Branch: `ticket/PP-026-workflow-dashboard`

## Sprint: survey-engine – Survey Engine
> Wochen 3-4 | Kern-Feature: Patient kann Umfrage via QR-Code ausfüllen, Smart Review Routing funktioniert

| Done | Active | Review | Backlog | Total |
|------|--------|--------|---------|-------|
| 7 | 0 | 0 | 1 | 8 |

## Kanban

### Active
- **PP-020** [task] Supabase DB Migration – Schema deployen (critical) → `ticket/PP-020-db-migration`

### Review
- **PP-026** [task] Unified Workflow Dashboard – Tickets, Sprints, Tests, Versioning, Deploy & Release synchronisieren (high)

### Backlog
- **PP-011** [feature] Mobile UX Polish: Skeleton Screens, Lazy Loading, Bottom-Nav Feinschliff (high)
- **PP-016** [task] Integration + E2E + Security Tests (high)
- **PP-021** [task] Legal Pages finalisieren (Impressum, Datenschutz, AGB) (high)
- **PP-022** [task] SEO + Monitoring (Meta Tags, Sentry, Plausible) (high)
- **PP-017** [task] Component Tests + Property-Based + Projekt-spezifische Tests (medium)
- **PP-018** [task] Test-Polish: A11y, Visual Regression, Performance, Monitoring (medium)
- **PP-012** [feature] Mobile UX v1.1: Smart-Sticky Header, Animated Numbers, Caching (low)
- **PP-023** [refactor] ESLint Warnings aufräumen (~100 Warnings) (low)
- **PP-024** [chore] Lokaler CI-Status-Check via gh CLI + npm Script (low)
- **PP-025** [chore] Playwright HTML Report auf GitHub Pages publizieren (low)

### Done (letzte 10 von 14)
- **PP-019** [bug] CI Pipeline Fixes + Test-Ergebnis-Feedback (high)
- **PP-015** [task] Test-Foundation: Vitest v4 + Unit Tests + Pre-commit + CI (high)
- **PP-014** [task] Static Analysis + Security Scanning Setup (high)
- **PP-013** [research] Research: Umfassendes Test-Management – Unit, Integration, E2E, UI, Customer Tests (high)
- **PP-010** [research] Research: Mobile UX Patterns 2026 – Bottom-Nav, Scroll-Verhalten, Touch-Optimierung (medium)
- **PP-009** [bug] Mobile: Viewport fehlt, Bottom-Tabs zu klein, Safe-Area fehlt (critical)
- **PP-008** [bug] Ticket-Dashboard: Beschreibung und Sektionen nicht sichtbar (high)
- **PP-007** [feature] Automatische Versionierung + Build-Info implementieren (medium)
- **PP-006** [research] Konzept: Automatische Versionierung mit Sprint- und Ticket-Integration (medium)
- **PP-005** [bug] QR-Codes: Hover-Previews zu klein und zeigen nicht das richtige PDF (medium)

## Statistik

| Status | Anzahl |
|--------|--------|
| Backlog | 10 |
| Active | 1 |
| Review | 1 |
| Done | 14 |
| **Gesamt** | **26** |

## Version & Deploy

- **Version:** 0.1.0
- **Git Tag:** none
- **Production:** https://praxispuls.vercel.app
- **Deploy:** Automatisch via Vercel bei Push auf `main`

## Links & Resources

### Projekt
- [GitHub Repo](https://github.com/andreasscheruebl-cmyk/praxispuls)
- [CI/CD (GitHub Actions)](https://github.com/andreasscheruebl-cmyk/praxispuls/actions)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Production](https://praxispuls.vercel.app)

### Services
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Resend Dashboard](https://resend.com)
- [Google Cloud Console (Places API)](https://console.cloud.google.com)

### Lokale Ordner
| Ordner | Inhalt |
|--------|--------|
| `.tickets/` | TicketOps (backlog, active, review, done) |
| `.tickets/sprints.json` | Sprint-Definitionen + aktueller Sprint |
| `src/app/` | Next.js App Router (Pages, API Routes) |
| `src/components/` | UI-Komponenten (shadcn/ui, survey, dashboard) |
| `src/lib/` | Business Logic (DB, Auth, Stripe, Email, Validations) |
| `src/lib/db/schema.ts` | Drizzle DB Schema (4 Tabellen) |
| `e2e/` | Playwright E2E Tests |
| `src/lib/__tests__/` | Vitest Unit Tests |
| `scripts/` | Build/Deploy/Ticket Scripts |
| `.github/workflows/` | CI Pipeline (4 Jobs) |
| `drizzle/` | DB Migrations |
| `CLAUDE.md` | Projekt-Regeln für Claude Code |

### Docs
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://docs.stripe.com)
- [Playwright Docs](https://playwright.dev/docs/intro)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

---
_Auto-generiert von `npm run status` – nicht manuell editieren._
