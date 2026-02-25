# CLAUDE.md – Anweisungen für Claude Code

## Projekt: PraxisPuls
SaaS für Zahnarztpraxen: Patientenumfrage + Google-Review-Routing + QM-Dashboard.

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
npm run test             # Unit Tests (Vitest)
npm run test:e2e         # E2E Tests (Playwright)
npm run knip             # Dead Code Detection
npm run status           # Dashboard generieren
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
  - `npx next lint` (ESLint, keine Errors) ✅
  - E2E Tests wenn betroffen (`npx playwright test`) ✅

### Labels

| Label | Bedeutung |
|-------|-----------|
| `feature` | Neues Feature |
| `bug` | Fehlerbehebung |
| `chore` | Maintenance, Cleanup |
| `docs` | Dokumentation |
| `refactor` | Code-Refactoring |
| `P0-critical` | Muss sofort gefixt werden |
| `P1-high` | Hohe Priorität |
| `P2-medium` | Mittlere Priorität |
| `P3-low` | Niedrige Priorität |

### Milestones + Projects

- **Milestones** für Release-Planung: `v0.1.0-beta`, `v0.2.0`, etc.
- **GitHub Projects** Board: **Backlog** → **In Progress** → **Review** → **Done**

### gh CLI Befehle

| Befehl | Aktion |
|--------|--------|
| `gh issue create` | Issue erstellen |
| `gh issue list` | Offene Issues |
| `gh issue view 42` | Issue #42 anzeigen |
| `gh pr create` | PR erstellen |
| `gh pr list` | Offene PRs |
| `gh pr merge` | PR mergen |
| `gh pr view` | PR anzeigen |

---

## Tech Stack
- Next.js 15 (App Router, RSC, Server Actions, Turbopack)
- TypeScript strict mode
- Tailwind CSS + shadcn/ui
- Supabase (Auth + DB + Storage) – Frankfurt Region
- Drizzle ORM (DB Queries) + Drizzle Kit (Migrations)
- Stripe (Payments)
- Resend (E-Mail)
- Recharts (Charts)
- zod (Validation)
- qrcode (QR generation)

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
- **Unit Tests**: Vitest (`src/lib/__tests__/`) – `npm run test`
- **E2E Tests**: Playwright (`e2e/`) – `npm run test:e2e`
- **Coverage**: `npm run test:coverage` (v8)
- **Dead Code**: `npm run knip`

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
- ❌ Multi-Standort
- ❌ QM-PDF-Reports
- ❌ Tablet Kiosk-Modus
- ❌ Jameda/Doctolib
- ❌ Mehrsprachigkeit (nur Deutsch)
- ❌ Mobile App

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
Siehe `src/lib/db/schema.ts` – 4 Tabellen:
- practices (Tenants)
- surveys (Umfragen)
- responses (Antworten, kein PII!)
- alerts (Detractor-Notifications)

## Projektstruktur

```
praxispuls/
├── CLAUDE.md
├── .github/
│   └── workflows/ci.yml            ← GitHub Actions CI
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── (marketing)/
│   │   ├── s/[slug]/               ← Public Survey (SSR)
│   │   ├── api/
│   │   │   ├── account/
│   │   │   ├── billing/
│   │   │   ├── google/
│   │   │   ├── health/
│   │   │   ├── practice/
│   │   │   ├── public/
│   │   │   └── webhooks/
│   │   └── global-error.tsx
│   ├── components/
│   │   ├── ui/                     ← shadcn/ui
│   │   ├── dashboard/
│   │   ├── shared/
│   │   ├── survey/
│   │   ├── marketing/
│   │   └── theme-provider.tsx
│   ├── lib/
│   │   ├── __tests__/              ← Unit Tests (Vitest)
│   │   ├── db/schema.ts            ← Drizzle Schema
│   │   ├── db/queries/             ← DB Query Functions
│   │   ├── supabase/
│   │   ├── stripe.ts
│   │   ├── email.ts
│   │   ├── themes.ts               ← Theme-System
│   │   ├── review-router.ts
│   │   ├── validations.ts          ← Zod Schemas
│   │   └── ...
│   ├── middleware.ts                ← Supabase Auth Middleware
│   └── types/index.ts              ← TypeScript Types + PLAN_LIMITS
├── e2e/                            ← E2E Tests (Playwright)
├── drizzle/                        ← Migrations
├── scripts/                        ← TicketOps Scripts
└── package.json
```

## Dev-Server (Claude Preview)
- Config: `.claude/launch.json` – `node` als runtimeExecutable (nicht `npm`/`npx` – Windows spawn kann keine .cmd)
- Next.js: `node node_modules/next/dist/bin/next dev --turbopack` (Port 3000)
- Drizzle Studio: `node node_modules/drizzle-kit/bin.cjs studio` (Port 4983)

## Claude Code Automations
- **Hooks** (`.claude/settings.json`): Auto-Lint nach Edit/Write (.ts/.tsx), Block .env Edits
- **Skills**: `ticket-workflow` (Claude-only, TicketOps-Enforcement), `/review-checklist` (User-only, Pre-Review Checks)
- **Agents**: `security-reviewer` (Stripe, RLS, DSGVO, OWASP)
- Hooks empfangen JSON via stdin – `node -e` als Parser (`jq` nicht verfügbar)

## Environment Variables
Siehe `.env.example` für alle benötigten Variablen.
