# CLAUDE.md – Anweisungen für Claude Code

## Projekt: PraxisPuls
Multi-Branchen SaaS: Umfragen (Patienten, Kunden, Mitarbeiter) + Google-Review-Routing ("Zufriedenheits-Weiche") + QM-Dashboard.
Ursprünglich für Zahnarztpraxen, jetzt 10 Branchen-Kategorien mit 28 Sub-Branchen.

## Entwickler
Andi – Solo-Dev, Bayern. Arbeitet Abende/Wochenenden. Pragmatische Lösungen bevorzugt.

## Umgebung
- **OS:** Windows 11 Pro
- **Shell:** Bash-Befehle werden über Git Bash / MSYS2 ausgeführt – **keine** Windows-nativen Pfade mit Backslashes in Shell-Kommandos verwenden
- **Pfade:** In Bash immer POSIX-Pfade (`/c/Users/...`) oder relative Pfade nutzen, NIE `C:\...`
- **Scripts:** `node`, `npm`, `npx`, `git` funktionieren direkt – für Datei-Operationen die dedizierten Tools (Read, Write, Edit, Glob, Grep) verwenden statt Shell-Kommandos

## Kommunikation
- **Mit Andi:** Deutsch
- **Code + Kommentare:** Englisch
- **UI-Texte:** Deutsch, Siezen ("Sie")

## Quick Start
```bash
npm install              # Dependencies
cp .env.example .env.local  # Env vars ausfüllen
npm run dev              # Dev-Server (Turbopack, Port 3000)
npm run build            # Production Build
npm run typecheck        # TypeScript Check
npm run lint             # ESLint
npm run lint:fix         # ESLint Auto-Fix
npm run test             # Unit Tests (Vitest)
npm run test:watch       # Unit Tests Watch Mode
npm run test:coverage    # Unit Tests mit Coverage (v8)
npm run test:e2e         # E2E Tests (Playwright)
npm run test:e2e:ui      # E2E Tests UI Mode
npm run knip             # Dead Code Detection
npm run db:generate      # Drizzle Migration generieren
npm run db:migrate       # Drizzle Migration anwenden
npm run db:push          # Schema zu Supabase pushen
npm run db:studio        # Drizzle Studio (Port 4983)
```

---

## GitHub Workflow (PFLICHT)

Dieses Projekt nutzt **GitHub Issues + Projects + PRs** für Projektmanagement.
**Ohne Issue wird KEIN Code angefasst. Keine Ausnahme.**

### Vor JEDER Code-Änderung

1. Prüfe offene Issues (`gh issue list`) – gibt es ein passendes Issue?
2. **JA** → Branch erstellen: `git checkout -b feat/42-slug`
3. **NEIN** → Issue erstellen ODER frage mich:
   - „Dafür existiert kein Issue. Soll ich eins erstellen?"
   - Schlage Titel, Labels und Akzeptanzkriterien vor
   - Warte auf meine Bestätigung BEVOR du Code schreibst

### Was OHNE Issue erlaubt ist

- Dateien lesen und analysieren
- Tests ausführen (explorativ)
- Recherche und Analyse

### Was OHNE Issue VERBOTEN ist

- Code-Dateien erstellen, ändern oder löschen
- Dependencies hinzufügen (`npm install`)
- Datenbank-Migrationen erstellen
- Environment Variables ändern
- Git Commits

### Branch-Naming

`type/issue-nummer-slug` – z.B.:
- `feat/42-dark-mode` – neues Feature
- `fix/43-login-bug` – Bug Fix
- `chore/44-deps-update` – Maintenance

### Commit-Format

```
type(scope): beschreibung (#issue)
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `style`
Beispiel: `feat(survey): add NPS slider (#42)`

### PR-Workflow

1. Issue erstellen oder bestehendes wählen
2. Branch: `git checkout -b feat/42-slug`
3. Arbeiten + committen
4. PR erstellen: `gh pr create` (Body enthält `Closes #42`)
5. Review (Claude Code oder manuell)
6. Merge: `gh pr merge`
7. Issue wird automatisch geschlossen

**⚠️ Claude darf Issues NIEMALS manuell schließen!** Issues werden durch PR-Merge auto-geschlossen.

### PR in Review geben

Ein PR ist bereit für Review wenn:
- Alle Code-Änderungen implementiert
- Build sauber (`npm run build` ✅)
- **Alle Tests grün:**
  - `npm run test` (Unit Tests) ✅
  - `npm run typecheck` (TypeScript) ✅
  - `npm run lint` (ESLint, keine Errors) ✅
  - E2E Tests wenn betroffen (`npx playwright test`) ✅

### Labels
`feature`, `bug`, `chore`, `docs`, `refactor` + Prioritäten `P0-critical` bis `P3-low` + `claude-task`, `blocked`

### Milestones

| Milestone | Ziel | Deadline |
|-----------|------|----------|
| v0.1-MVP | Core Features lauffähig | März 2026 |
| v0.2-Beta | Beta-Test mit Pilotpraxen | Mai 2026 |
| v1.0-Launch | Öffentlicher Launch | Juli 2026 |

---

## Tech Stack
- Next.js 15 (App Router, RSC, Server Actions, Turbopack)
- TypeScript strict mode
- Tailwind CSS + shadcn/ui (Radix UI Primitives)
- Supabase (Auth + DB + Storage) – Frankfurt Region
- Drizzle ORM (DB Queries) + Drizzle Kit (Migrations)
- Stripe (Payments)
- Resend (E-Mail)
- Recharts (Charts)
- Sentry (Error Tracking + Performance)
- zod (Validation)
- qrcode + jspdf (QR generation + PDF)
- sonner (Toast Notifications)
- lucide-react (Icons)

## Arbeitsweise
- **Kein unaufgefordertes Refactoring.** Nur das tun, was explizit verlangt wurde – keine "Verbesserungen" nebenbei.
- **Erst lesen, dann handeln.** Relevante Dateien lesen und Ansatz verstehen, bevor Code geändert wird.
- **Vor PR/Branch: Remote prüfen.** `gh pr list` und `git fetch` vor neuem Branch, um Duplikate zu vermeiden.

## Coding Rules

### TypeScript
- `"strict": true` – kein `any`, verwende `unknown` + Type Guards
- Zod für alle Runtime-Validierungen
- Keine Barrel Exports

### Datenbank
- Alle Queries über Drizzle ORM (kein Raw SQL)
- Supabase Client NUR für Auth und Storage
- UUIDs als Primary Keys
- `created_at` + `updated_at` auf allen Tabellen
- Schema: `src/lib/db/schema.ts`

### Frontend
- Server Components wo möglich
- `"use client"` nur wenn interaktiv nötig
- shadcn/ui als Basis-Komponenten
- Mobile-first (Survey wird zu 95% auf Smartphones ausgefüllt)
- WCAG 2.1 AA (große Touch-Targets, Kontrast)

### API
- Server Actions für Dashboard-Mutations
- API Routes für Public Endpoints + Webhooks
- Zod für Request-Validierung
- Error-Format: `{ error: string, code: string }`

### Git
- Conventional Commits: `feat(scope): description (#issue)`
- **Branching:** IMMER auf Issue-Branch (`feat/42-slug`), NIE direkt auf `main`
- **PRs:** Branch → PR erstellen (`gh pr create`) → Review → Merge (`gh pr merge`)
- **Ablauf:** `git checkout -b feat/42-slug` → arbeiten → committen → `gh pr create` → merge
- **Pre-commit Hooks** (simple-git-hooks):
  - `gitleaks protect --staged` – blockt Secrets
  - `lint-staged` → ESLint --fix auf .ts/.tsx
- **Pre-push Hook**: `vitest run` – Unit Tests müssen grün sein

### Testing
- **Unit Tests**: Vitest (`src/lib/__tests__/`) – `npm run test` – 22 Test-Dateien
- **E2E Tests**: Playwright (`e2e/`) – `npm run test:e2e` – 6 Spec-Dateien
- **Coverage**: `npm run test:coverage` (v8, 80% Threshold)
- **Dead Code**: `npm run knip`
- **Coverage-Excludes**: db, supabase, email, stripe, google, auth, audit, qr-pdf, version, plausible (externe Services)
- **E2E Projekte**: chromium + mobile (iPhone 14)

### Security
- **Auth Gates**: `requireAuthForApi()`, `requireAuthForAction()`, `requireAdminForApi()` aus `lib/auth.ts`
- **IDOR Prevention**: Alle DB-Queries filtern nach `practiceId` + Ownership-Check
- **SSRF Prevention**: `isSafeUrl()` aus `lib/url-validation.ts` für alle serverseitigen URL-Fetches
- **Input Validation**: Zod Schemas auf allen API/Action-Boundaries
- **Soft Deletes**: `deletedAt` Column, Queries filtern mit `isNull(deletedAt)`
- **Audit Logging**: Alle Mutations → `audit_events` Tabelle (before/after)
- **Secret Scanning**: Gitleaks (pre-commit + CI), TruffleHog (CI)
- **ESLint Plugins**: `eslint-plugin-security` + `eslint-plugin-sonarjs`

---

## Core Business Logic

### Zufriedenheits-Weiche (Review Router)
Kernfeature in `src/lib/review-router.ts`:
- **NPS 9–10 (Promoter)** → Google-Review-Prompt
- **NPS 7–8 (Passiv)** → Danke-Seite
- **NPS 0–6 (Detractor)** → Empathie-Seite + Alert an Praxis
- **Employee Surveys** → `noRouting()` (kein Google-Redirect)

### Branchen-System
`src/lib/industries.ts` — 10 Kategorien, 28 Sub-Branchen:
- Gesundheit (7), Handwerk (3), Beauty (2), Gastronomie (2), Fitness (2)
- Einzelhandel (2), Bildung (4), Vereine (2), Beratung (2), Individuell (2)
- Smart 2-Layer: Sub-Kategorie-Auswahl nur wenn ≥ 3 Sub-Kategorien

### Terminologie-System
`src/lib/terminology.ts` — 12 Respondent-Types mit DE-Deklinationen:
patient, tierhalter, kunde, gast, mitglied, fahrschueler, schueler, eltern, mandant, mitarbeiter, individuell, teilnehmer

### Pricing (3 Pläne)
- **Free**: 30 Responses/Monat, 1 Standort, Basis-Template
- **Starter**: 200 Responses/Monat, 3 Standorte, Alerts, Branding, Zeitfilter
- **Professional**: Unlimited, 10 Standorte, alle Features
- Admin-Override: `planOverride` + `overrideReason` + `overrideExpiresAt`

### Survey Lifecycle
`draft` → `active` → `paused` → `archived` (via `src/lib/survey-status.ts`)
- Soft-Delete auf surveys + practices
- Template-Customization: Fragen deaktivieren, Labels überschreiben, bis zu 3 Custom-Fragen

## CI Pipeline (GitHub Actions)

4 Jobs auf `push main` + `pull_request main`:
1. **lint-types** — ESLint + TypeScript + knip (Dead Code, continue-on-error)
2. **unit-tests** — Vitest mit Coverage + Artifact Upload
3. **e2e** — Build + Playwright (nur public-pages in CI, Auth-Tests brauchen DB)
4. **security** — npm audit + Gitleaks + TruffleHog

Node 22 + npm cache. Placeholder Env-Vars für Build in CI.

---

## Monitoring
- **Sentry**: Error Tracking + Performance (Source Maps Upload im Build)
  - Client Config: `src/instrumentation-client.ts` (nicht `sentry.client.config.ts` – Turbopack!)
- **Plausible**: Analytics (self-hosted oder Cloud)
- **Health Endpoint**: `/api/health`

## DSGVO
- Keine PII in responses-Tabelle
- Kein Cookie außer Auth
- Server in EU/DE (Supabase Frankfurt)
- Anonyme Umfragen
- Session-Hash nur für Deduplizierung (kein PII)

---

## MVP Scope – Was NICHT gebaut wird
- ❌ PVS-Integration
- ❌ SMS/WhatsApp
- ❌ KI-Sentiment-Analyse
- ❌ QM-PDF-Reports
- ❌ Tablet Kiosk-Modus
- ❌ Jameda/Doctolib
- ❌ Mehrsprachigkeit (nur Deutsch)
- ❌ Mobile App

**Im MVP seit Multi-Survey-Redesign (#59):**
- ✅ Multi-Branchen (10 Kategorien, 28 Sub-Branchen)
- ✅ Multi-Standort
- ✅ Mitarbeiterbefragung (Employee Templates + eNPS)
- ✅ 7 Frage-Typen (NPS, Stars, Likert, Freetext, SingleChoice, YesNo, eNPS)
- ✅ Vergleichs-Dashboard mit 3 Modi (Zeitraum, Standort, Umfrage) (#69)
- ✅ Admin-Panel (Praxen-Verwaltung, Template-CRUD, Audit-Log, Login-Events)

Wenn Andi eines davon anfragt: "⚠️ Das ist v2. Soll ich es trotzdem machen?"

## Warnungen – Proaktiv ansprechen bei:
- **Feature Creep:** Nicht im MVP-Scope → v2
- **Wartbarkeit:** Zu komplex für Solo-Dev → einfachere Alternative vorschlagen
- **DSGVO:** Datenschutz-Risiko erkennen und warnen
- **Performance:** Survey muss < 2s laden (mobil)
- **Kosten:** API-Kosten abschätzen bei externen Services

---

## Aktuelle Prioritäten
Siehe GitHub Issues (`gh issue list`) und GitHub Projects für den aktuellen Projektstatus.

## DB Schema
Siehe `src/lib/db/schema.ts` – 7 Tabellen:
- **practices** (Tenants) — Multi-Tenant, Soft-Delete, Plan-Override, Industry, Theme
- **survey_templates** (Branchen-Templates, Admin-CRUD) — JSONB questions, isSystem, respondentType, category (customer/employee)
- **surveys** (Umfragen, Status-Lifecycle: draft→active→paused→archived) — Soft-Delete, sourceSurveyId (Clone), anonymityThreshold
- **responses** (Antworten, **kein PII!**) — JSONB answers, NPS Score/Category, Channel (qr/link/email), Google-Review-Tracking
- **alerts** (Detractor-Notifications) — isRead, Note
- **loginEvents** (Login-Audit-Log) — Method (password/magic_link/oauth)
- **auditEvents** (Change-Tracking) — before/after JSONB, Action, Entity/EntityId

**Enums:** `surveyStatusEnum` = draft | active | paused | archived
**Relations:** Vollständig definiert mit Drizzle `relations()` (practices → surveys, responses, alerts, loginEvents, auditEvents)

## Projektstruktur

```
praxispuls/
├── CLAUDE.md
├── .github/
│   ├── ISSUE_TEMPLATE/             ← Issue Template (universal)
│   ├── pull_request_template.md    ← PR Template
│   └── workflows/ci.yml            ← GitHub Actions CI (4 Jobs)
├── .claude/
│   ├── settings.json               ← Hooks (git-tracked)
│   ├── launch.json                 ← Dev-Server Config
│   ├── agents/
│   │   ├── security-reviewer.md    ← Security Audit Agent
│   │   └── code-reviewer.md        ← Code Review Agent (8 Passes)
│   └── skills/
│       ├── fix-issue/SKILL.md      ← /fix-issue <nr>
│       ├── create-pr/SKILL.md      ← /create-pr
│       ├── review-checklist/SKILL.md ← /review-checklist
│       ├── pre-flight/SKILL.md     ← /pre-flight (49 Checks in 8 Kategorien)
│       └── db-migrate/SKILL.md     ← /db-migrate <generate|push|studio|status>
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/              ← Login Page + Form
│   │   │   └── register/           ← Register Page + Form
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/          ← Overview
│   │   │   ├── dashboard/surveys/  ← Survey Management
│   │   │   ├── dashboard/responses/← Response Analytics
│   │   │   ├── dashboard/alerts/   ← Detractor Alerts
│   │   │   ├── dashboard/compare/  ← Vergleichs-Dashboard (3 Modi)
│   │   │   ├── dashboard/qr-codes/ ← QR Code Generation
│   │   │   ├── dashboard/settings/ ← Practice Settings
│   │   │   ├── dashboard/billing/  ← Stripe Integration
│   │   │   ├── dashboard/profile/  ← User Profile
│   │   │   └── onboarding/         ← Initial Setup
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── stats/          ← Admin Stats Dashboard
│   │   │       ├── practices/      ← Practice Management + [id] Detail
│   │   │       ├── templates/      ← Template CRUD (list, new, [id])
│   │   │       ├── audit/          ← Audit Event Log
│   │   │       └── logins/         ← Login Event Log
│   │   ├── (marketing)/
│   │   │   ├── impressum/datenschutz/agb/  ← Legal Pages
│   │   │   └── page.tsx            ← Landing Page
│   │   ├── s/[slug]/               ← Public Survey (SSR, kein Auth)
│   │   ├── api/
│   │   │   ├── account/            ← Account Info
│   │   │   ├── admin/practices/    ← Admin Practice CRUD + Actions
│   │   │   ├── auth/               ← Login-Event, Confirm, Callback
│   │   │   ├── billing/            ← Checkout, Portal, Invoices
│   │   │   ├── google/             ← Places Search, Photo Proxy
│   │   │   ├── health/             ← Health Check
│   │   │   ├── practice/           ← Practice CRUD, Logo, QR, Website-Logos
│   │   │   ├── public/             ← Responses (POST), Track-Click
│   │   │   ├── surveys/            ← Survey CRUD + [surveyId]/qr-code
│   │   │   └── webhooks/stripe/    ← Stripe Webhook
│   │   ├── global-error.tsx
│   │   └── opengraph-image.tsx     ← Dynamic OG Image
│   ├── components/
│   │   ├── ui/                     ← shadcn/ui (11 Komponenten)
│   │   ├── admin/                  ← Admin Components (12)
│   │   ├── dashboard/              ← Dashboard Components (22)
│   │   ├── survey/                 ← Survey Form + 6 Question Types
│   │   ├── marketing/              ← Hero, Scroll-Link
│   │   ├── shared/                 ← Build Badge
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── __tests__/              ← Unit Tests (22 Test-Dateien)
│   │   ├── db/
│   │   │   ├── schema.ts           ← Drizzle Schema (7 Tabellen)
│   │   │   ├── index.ts            ← Drizzle Client
│   │   │   └── queries/            ← admin, compare, dashboard, surveys, templates
│   │   ├── supabase/               ← client.ts, server.ts, middleware.ts
│   │   ├── constants/plans.ts      ← Plan Badge Styles + Labels
│   │   ├── validations.ts          ← Alle Zod Schemas (Env, Auth, Practice, Survey, Admin, Templates)
│   │   ├── industries.ts           ← 10 Kategorien, 28 Sub-Branchen
│   │   ├── terminology.ts          ← 12 Respondent-Type Terminologien (DE)
│   │   ├── review-router.ts        ← Zufriedenheits-Weiche (Core Feature)
│   │   ├── compare-utils.ts        ← Comparison Analytics (NPS, Category Scores)
│   │   ├── survey-status.ts        ← Status-Lifecycle Transitions
│   │   ├── survey-steps.ts         ← Multi-Step Survey Flow
│   │   ├── survey-validation.ts    ← Survey-spezifische Validation
│   │   ├── template-data.ts        ← Seed Template Data
│   │   ├── auth.ts                 ← getUser, requireAuthForApi, requireAdmin
│   │   ├── audit.ts                ← Audit Event Logging
│   │   ├── plans.ts                ← getEffectivePlan() (inkl. Override)
│   │   ├── stripe.ts               ← Stripe Client + Checkout/Portal
│   │   ├── email.ts                ← Resend E-Mail + escapeHtml
│   │   ├── google.ts               ← Google Places API
│   │   ├── qr.ts                   ← QR Code Generation
│   │   ├── qr-pdf.ts               ← QR Code PDF (jspdf)
│   │   ├── url-validation.ts       ← SSRF Prevention (isSafeUrl)
│   │   ├── plausible.ts            ← Analytics Event Tracking
│   │   ├── practice.ts             ← Practice Utils
│   │   ├── utils.ts                ← Helper Functions
│   │   └── version.ts              ← Build Version Info
│   ├── middleware.ts                ← Supabase Auth Middleware
│   ├── types/index.ts              ← TypeScript Types + PLAN_LIMITS
│   └── instrumentation-client.ts   ← Sentry Client Config (Turbopack-safe)
├── e2e/                            ← E2E Tests (6 Spec-Dateien)
├── drizzle/                        ← Migrations (9 SQL-Dateien)
├── scripts/
│   ├── git-hooks/                  ← commit-msg, pre-commit, pre-push
│   ├── seed-templates.ts           ← Template Seeding
│   ├── check-tables.ts             ← DB Table Verification
│   ├── setup-storage.ts            ← Supabase Storage Init
│   ├── migrate-soft-delete.ts      ← Data Migration
│   ├── run-migrations.ts           ← Migration Runner
│   ├── backup.sh                   ← DB Backup
│   └── setup-hooks.ps1             ← Windows Hook Setup
├── docs/                           ← Documentation (Email Templates)
└── package.json
```

## Dev-Server (Claude Preview)
- Config: `.claude/launch.json` – `node` als runtimeExecutable (nicht `npm`/`npx` – Windows spawn kann keine .cmd)
- Next.js: `node node_modules/next/dist/bin/next dev --turbopack` (Port 3000)
- Drizzle Studio: `node node_modules/drizzle-kit/bin.cjs studio` (Port 4983)

## Claude Code Automations
- **Hooks** (`.claude/settings.json`): Auto-Lint nach Edit/Write (.ts/.tsx), Block .env Edits
- **Skills**:
  - `/fix-issue <nr>` — Issue bearbeiten (Branch + Implement + Test + Commit)
  - `/create-pr` — PR erstellen (mit Pre-Flight Gate)
  - `/review-checklist` — Pre-Review Checks (typecheck, lint, test, build, E2E)
  - `/pre-flight` — Exhaustiver Self-Check (49 Checks in 8 Kategorien: Security, Validation, Error Handling, Audit, Types, UI, Tests, Code Hygiene)
  - `/db-migrate <generate|push|studio|status>` — Drizzle Workflow
- **Agents**:
  - `security-reviewer` — Read-only Security Audit (IDOR, SSRF, XSS, DSGVO, Stripe, Auth, Secrets)
  - `code-reviewer` — Read-only Code Review (8 Passes: Security → Code Hygiene)
- Hooks empfangen JSON via stdin – `node -e` als Parser (`jq` nicht verfügbar)
- **`settings.json`** = Hooks (git-tracked) · **`settings.local.json`** = Permissions (local-only, nicht committen)
- **Security-Hook Gotcha**: `execFileSync` statt `execSync` in Hook-Commands verwenden — Security-Plugin flaggt `execSync` auch in Config-Dateien

## Environment Variables
Siehe `.env.example` für alle benötigten Variablen:
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Database**: `DATABASE_URL` (Supabase Postgres Direct)
- **Stripe**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_STARTER_MONTHLY`, `STRIPE_PRICE_PROFESSIONAL_MONTHLY`
- **Resend**: `RESEND_API_KEY`
- **Google**: `GOOGLE_PLACES_API_KEY`
- **App**: `NEXT_PUBLIC_APP_URL`
- **Admin**: `ADMIN_EMAILS` (comma-separated)
- **Sentry**: `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`
- **Plausible**: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`

**Vercel Env Vars:** IMMER `printf "value"` statt `echo "value"` – `echo` hängt Newline an, das Stripe/Sentry bricht.
**Nach dem Setzen:** Env Vars auf Whitespace/Newlines prüfen.
