---
id: PP-013
type: research
title: "Research: Umfassendes Test-Management – Unit, Integration, E2E, UI, Customer Tests"
status: done
priority: high
sprint: survey-engine
parent: ""
branch: ""
created: 2026-02-11
updated: 2026-02-11
estimate: 2h
actual: ""
tags: [testing, quality, research, ci, dx, security]
---

# PP-013: Research – Umfassendes Test-Management für PraxisPuls

## Aktueller Stand PraxisPuls (Ist-Analyse)

### Vorhandenes
- ✅ Playwright v1.58.2 installiert (Chromium + iPhone 14)
- ✅ 14 E2E-Tests in `e2e/` (public-pages, api, auth-redirect)
- ✅ Zod-Schemas (6 Stück, gut testbar)
- ✅ Saubere Trennung: Business-Logic in `src/lib/`, Server Actions in `src/actions/`
- ✅ Conventional Commits (CI-Hook möglich)
- ✅ ESLint konfiguriert

### Fehlend
- ❌ Kein Unit-Test-Runner (kein Vitest, kein Jest)
- ❌ Keine Unit-/Integration-/Component-Tests
- ❌ Kein CI/CD (nur Vercel Auto-Deploy)
- ❌ Keine Pre-commit/Pre-push Hooks
- ❌ Keine Coverage-Messung
- ❌ Keine A11y-Tests
- ❌ Keine Performance-Tests
- ❌ Keine Security-Tests (Secrets, Headers, DAST, RLS)
- ❌ Keine Smoke-Tests nach Deploy
- ❌ Kein Prettier konfiguriert

### Testbare Code-Oberfläche (Inventar)

| Kategorie | Anzahl | Beispiele |
|-----------|--------|-----------|
| Zod-Schemas | 6 | loginSchema, surveyResponseSchema, practiceUpdateSchema |
| Business-Logic-Funktionen | 35+ | review-router, utils, google, qr, qr-pdf, email, stripe |
| Server Actions | 8 | getPractice, updatePractice, getSurveys, markAlertRead |
| API Routes | 18 | /api/webhooks/stripe, /api/public/responses, /api/health |
| Seiten (Pages) | 16 | Dashboard, Survey, Auth, Marketing, Legal |
| Client-Komponenten | 20 | survey-form, nps-chart, mobile-bottom-tabs |
| DB-Tabellen | 6 | practices, surveys, responses, alerts, loginEvents, auditEvents |
| Query-Funktionen | 5 | getDashboardOverview, getNpsTrend, getReviewFunnel |
| PDF-Generatoren | 12 | A4 Poster, A6 Card, Business Card (Light/Dark/Infographic) |
| Types/Exports | 12+ | Practice, DashboardOverview, PlanLimits |

---

## Recherche-Ergebnisse

### 1. Test-Strategie: Vollständige Testing Trophy für PraxisPuls

```
                    ┌─────────────────────────────────┐
                    │     Smoke (Post-Deploy Checks)   │  ← /api/health + kritische Seiten
                    ├─────────────────────────────────┤
                    │        E2E (Playwright)          │  ← Wenige, kritische User-Flows
                    │  Auth, Survey, Dashboard, Stripe  │
                    ├─────────────────────────────────┤
                    │   Component (Vitest Browser Mode) │  ← UI-Komponenten isoliert
                    │  survey-form, nps-chart, cards    │
                    ├─────────────────────────────────┤
                    │    Integration (Vitest + PGlite)  │  ← DB-Queries, API-Routes, Webhooks
                    │  Server Actions, Stripe Webhook   │
                    ├─────────────────────────────────┤
                    │        Unit (Vitest, pure)        │  ← Viele, schnelle, isolierte Tests
                    │  Zod, review-router, utils, QR    │
                    ├─────────────────────────────────┤
                    │     Static (TypeScript + ESLint)  │  ← Automatisch, immer aktiv
                    │  tsc, sonarjs, security, knip     │
                    └─────────────────────────────────┘
     + Quer: Security (Secrets, Headers, RLS, DAST) | A11y | Performance | Visual Regression
```

**Was bedeutet "100% Abdeckung" realistisch?**
- **Static Analysis (TypeScript strict + ESLint + knip):** 100% — läuft auf jedem File
- **Unit Tests:** 90-95% Coverage auf Business-Logic (`src/lib/`)
- **Integration Tests:** 80% Coverage auf API-Routes und Server Actions
- **Component Tests:** Kritische UI-Komponenten (Survey-Form, NPS-Chart, Dashboard-Cards)
- **E2E Tests:** 100% der kritischen User-Flows (8-10 Szenarien)
- **Security:** Secrets Scanning (100%), RLS-Policies (alle Tabellen), Security Headers (alle Seiten)
- **Feature Coverage:** Jedes Ticket-Akzeptanzkriterium = mindestens 1 Test

---

### 2. Unit Tests: Vitest v4.0+ (klarer Gewinner)

**Wichtig: Vitest 4.0 (Jan 2026)** — nicht v3.2! Bringt stabilen Browser Mode für Component Tests und built-in Visual Regression.

#### Vitest vs. Jest 30 — Vergleich

| Kriterium | **Vitest v4.0+** | **Jest 30** |
|-----------|-----------------|-------------|
| ESM Support | Nativ, out-of-the-box | Experimentell, Wrapper nötig |
| TypeScript | Nativ via Vite (kein ts-jest) | Braucht ts-jest oder Node type-stripping |
| Performance | **10-20x schneller** im Watch-Mode | 37% schneller als Jest 29, aber langsamer als Vitest |
| Browser Mode | **Stable (v4.0)** — echte Browser-Tests | Nicht verfügbar |
| Setup-Aufwand | Minimal: 1 Config-Datei | Mehr Config: jest.config + Transformer |
| Next.js Offiziell | Eigene Docs + Template (`with-vitest`) | Docs vorhanden, aber Pages Router betont |
| Weekly Downloads | ~17M (stark wachsend) | ~30M (Legacy-Projekte, stagnierend) |

**Empfehlung: Vitest v4.0+** — Browser Mode ersetzt React Testing Library + JSDOM für Component Tests.

#### Was per Unit-Test abdecken?

**Hohe Priorität (90-95% Coverage):**

| Bereich | Datei | Tests |
|---------|-------|-------|
| Zod-Schemas | `validations.ts` | Valide/invalide Inputs, Edge-Cases (PLZ-Regex, NPS 0-10, Rating 1-5) |
| Review Router | `review-router.ts` | Alle NPS-Kombinationen: Promoter±Google, Passive, Detractor, Custom Threshold |
| Utilities | `utils.ts` | `getNpsCategory()` Boundaries, `slugify()` Umlaute, `formatDateDE()` |
| Survey Templates | `survey-templates.ts` | Template-Struktur, alle IDs vorhanden |
| Themes | `themes.ts` | `getThemeConfig()` für standard + vertrauen |
| QR Code | `qr.ts` | URL-Format korrekt, DataURL decodierbar (via jsqr) |

**Mittlere Priorität (80% Coverage):**

| Bereich | Datei | Tests |
|---------|-------|-------|
| Stripe Webhook | `api/webhooks/stripe/route.ts` | Signature-Verifizierung, Event-Routing, **Idempotency** |
| Email Templates | `email.ts` | HTML enthält erwartete Werte, Links korrekt, Platzhalter korrekt |
| Google Integration | `google.ts` | URL-Building, Place-ID-Format |

**NICHT per Unit-Test (andere Ebene):**

| Bereich | Grund | Stattdessen |
|---------|-------|-------------|
| DB-Queries | Drizzle ORM = Integration | PGlite Integrationstests |
| React-Components | UI-Rendering | Vitest Browser Mode (Component Tests) |
| Supabase Auth | Externer Service | E2E |
| API-Routes als Ganzes | Brauchen Request-Context | Integration/E2E |

#### Mocking-Strategie

| Dependency | Mock-Methode | Grund |
|------------|-------------|-------|
| Supabase Client | `vi.mock('@supabase/supabase-js')` | Unit: vi.mock |
| Drizzle ORM | **PGlite (kein Mock!)** | Chained API schwer mockbar, Drizzle-Team empfiehlt echte DB |
| Resend | `vi.mock('resend')` | Flache SDK-API, einfach |
| Stripe | `vi.mock('stripe')` + `generateTestHeaderString()` | SDK bietet Test-Helpers |
| next/headers | `vi.mock('next/headers')` | Server-side Cookies/Headers |
| next/navigation | `vi.mock('next/navigation')` | redirect(), useRouter() |
| Externe HTTP-Calls | MSW v2 | Realistische Interception |

#### Coverage-Konfiguration

| Ziel | Wert |
|------|------|
| Provider | V8 (identisch mit Istanbul seit Vitest v3.2, aber 10x schneller) |
| Lines / Branches / Functions | **80%** global |
| Neuer Code (CI-Gate) | **85-90%** |
| `src/lib/validations.ts` | **95%** |
| `src/lib/review-router.ts` | **95%** |
| `src/lib/utils.ts` | **95%** |

---

### 3. Component Tests: Vitest 4 Browser Mode (NEU)

**Warum?** Lücke zwischen Unit-Tests und E2E: 20 Client-Komponenten (survey-form, nps-chart, dashboard-cards) werden weder durch reine Funktions-Tests noch durch wenige E2E-Flows vollständig abgedeckt.

**Vitest 4 Browser Mode** (stable seit Jan 2026):
- Echtes Browser-Rendering via Playwright Provider (kein JSDOM!)
- API kompatibel mit React Testing Library (`vitest-browser-react`)
- Echtes CSS, echte Browser-APIs, echtes DOM
- Von Kent C. Dodds (RTL-Autor) als RTL-Nachfolger empfohlen

**Was per Component-Test abdecken:**
- `survey-form.tsx` — NPS-Slider Interaktion, Rating-Circles, Submit
- `nps-chart.tsx` — Recharts rendert korrekt mit Testdaten
- `mobile-bottom-tabs.tsx` — Tab-Wechsel, Active-State
- `google-places-search.tsx` — Autocomplete, Auswahl
- `logo-upload.tsx` — Datei-Upload, Preview

**Setup:** `@vitest/browser-playwright` + `vitest-browser-react` (~2-3h)

---

### 4. Integration Tests: Vitest + PGlite

#### Server Actions Testing
- Server Actions direkt in Vitest importieren und als async-Funktionen aufrufen
- `next/headers`, `next/cache`, `server-only` mocken
- Business-Logic idealerweise in pure Functions auslagern (review-router ist schon gut separiert)

#### API Route Testing
- **Einfache Routes:** Direkter Handler-Import (`import { GET } from './route'`)
- **Komplexe Routes:** `next-test-api-route-handler` (NTARH) für vollen Request-Context
- **Stripe Webhook:** `stripe.webhooks.generateTestHeaderString()` für Signature-Tests
- **Stripe Idempotency:** Gleiches Event 2x senden → nur 1x verarbeitet

#### Datenbank: PGlite (WASM Postgres) — klarer Gewinner

| Option | Speed | Docker? | Fidelity | Solo-Dev Score |
|--------|-------|---------|----------|----------------|
| Separate Supabase-Instanz | Langsam (Netzwerk) | Nein | Hoch | ⭐⭐ |
| Supabase CLI lokal | ~10s Start | Ja | Sehr hoch | ⭐⭐⭐ |
| In-Memory SQLite | Schnell | Nein | **Niedrig** (SQL-Dialekt!) | ⭐ |
| Testcontainers | ~4.8s Start | Ja | Hoch | ⭐⭐⭐ |
| Transaction Rollback | Schnell | — | Hoch | ⭐⭐ |
| **PGlite (WASM Postgres)** | **~1.3s** | **Nein** | **Hoch** | **⭐⭐⭐⭐⭐** |

#### DB Migration Testing (MUST-HAVE)
- In CI: PGlite-Instanz hochfahren, Drizzle-Migrations anwenden, Schema-Konsistenz prüfen
- Verhindert kaputte Migrationen auf Supabase Frankfurt (Produktions-DB)

#### Test-Daten: @faker-js/faker + Custom Builders + fast-check

```typescript
// test/factories.ts — deterministische Testdaten
import { faker } from '@faker-js/faker/locale/de';
export function buildSurveyResponse(overrides?) { ... }

// test/properties.ts — Property-Based Tests für Zod + Router
import fc from 'fast-check';
fc.assert(fc.property(fc.integer({ min: 0, max: 10 }), (nps) => {
  const result = routeByNps(nps, 'ChIJ...', 9, true);
  return result.category !== undefined;
}));
```

---

### 5. E2E / System Tests: Playwright (bereits installiert)

#### Playwright vs. Cypress — Vergleich

| Kriterium | **Playwright v1.58** | **Cypress** |
|-----------|---------------------|-------------|
| NPM Downloads | 20-30M/Woche (seit 2024 vor Cypress) | Rückläufig |
| Cross-Browser | Chromium, Firefox, WebKit (Safari) | Chrome, Edge, Firefox; WebKit nur experimentell |
| Parallelisierung | Built-in (kostenlos) | Cypress Cloud (ab $75/Monat) |
| Visual Regression | Built-in `toHaveScreenshot()` | Nur mit Plugins |
| Speed | Bis zu **4x schneller** | Langsamer |
| CI-Kosten | **Komplett kostenlos** | Cloud ab $75/Monat |
| 2026 Features | AI Agents (planner/generator/healer) | — |

#### E2E-Szenarien priorisiert

**P0 — Revenue-kritisch:**
1. Survey-Flow: QR-Link → NPS → Kategorien → Submit → Routing (Google/Danke/Empathie)
2. Duplicate-Prevention (Session-Hash)
3. Survey-Ladezeit < 2s
4. **Security Headers** auf Survey-Page (CSP, X-Frame-Options)

**P1 — Onboarding + Auth:**
5. Register → Practice Setup → Google Place ID → Erste Umfrage
6. Auth Guard (Dashboard → Login Redirect)
7. Login → Session → Logout

**P2 — Dashboard:**
8. KPIs anzeigen, Responses filtern, Alerts sehen
9. QR-Code generieren + PDF Download

**P3 — Settings + Billing:**
10. Practice Settings ändern, Theme wechseln
11. Stripe Upgrade → Webhook → Plan-Limits

#### Test-Umgebung

| Umgebung | Wann | Empfehlung |
|----------|------|------------|
| `next dev` (lokal) | Entwicklung | Standard-Feedback-Loop |
| `next build` + `next start` | CI | Produktionsnah, fängt SSR-Fehler |
| Vercel Preview | Optional (später) | Für Vercel-spezifische Edge-Cases |

---

### 6. Smoke Tests (Post-Deploy) — NEU

**MUST-HAVE** für kommerzielles SaaS mit Stripe-Zahlungen.

Nach jedem Vercel-Deploy automatisch prüfen:
- `/api/health` → 200 OK
- Survey-Page (`/s/test-praxis`) → rendert (SSR-Check)
- Login-Page → kein 500
- Stripe-Checkout-Endpoint → antwortet

**Tools:** GitHub Actions Workflow (via Vercel Deployment Webhook) oder **Checkly** (Playwright-basiertes Synthetic Monitoring, Free Tier).

---

### 7. Visual Regression Tests

**Playwright `toHaveScreenshot()` — kostenlos, bereits vorhanden.**

**Kritische Seiten:** Survey (beide Themes, mobile + desktop), Landing Page, QR-PDF-Output.
**PDF-Output:** 12 PDF-Generatoren → PDF generieren, zu PNG konvertieren, visuell vergleichen.

---

### 8. Customer / Acceptance Tests

**BDD (Cucumber) ist 2026 für Solo-Devs obsolet.** Cucumber.js aufgegeben, SpecFlow eingestellt.

**Empfehlung: Plain Playwright mit Ticket-IDs in Test-Namen.**

```typescript
test.describe('Survey Submission [PP-XXX]', () => {
  test('promoter (NPS >= 9) is redirected to Google review page', async ({ page }) => { ... });
});
```

---

### 9. Accessibility Tests

**Tool: `@axe-core/playwright`** — Industriestandard, kostenlos.
- WCAG 2.2 AA Compliance auf jeder kritischen Seite
- Touch-Target Validierung (≥44×44px) per Custom Playwright-Check auf Survey-Page

---

### 10. Performance Tests

| Methode | Typ | Wann |
|---------|-----|------|
| **Lighthouse CI** (GitHub Action) | Lab-Daten | Pro PR |
| **Playwright Timing** | Lab-Daten | Pro E2E-Test |
| **Vercel Speed Insights** | Real-User-Daten | Produktion |

**Survey < 2s:** LCP < 2000ms (Lighthouse Budget) + Playwright `domcontentloaded` < 2000ms

---

### 11. Workflow & CI/CD Pipeline

#### Wann laufen welche Tests?

| Trigger | Tests | Dauer |
|---------|-------|-------|
| **Pre-commit** (lint-staged) | ESLint + Prettier (staged files), `tsc --noEmit`, **gitleaks** | < 10s |
| **Pre-push** | Vitest Unit/Integration (full suite) | < 30s |
| **GitHub Actions (PR/Push)** | Lint + Types + npm audit + Vitest (Coverage) + Playwright E2E | < 3 Min |
| **Vercel Deploy** | Smoke Tests (health + SSR check) | ~1 Min |

#### Pre-commit Hooks: simple-git-hooks + lint-staged

| Tool | Empfehlung | Grund |
|------|------------|-------|
| **simple-git-hooks** | ✅ Empfohlen | Zero-Dependencies, Config in package.json |
| Husky | ❌ | Weder so einfach noch so mächtig |
| Lefthook | Später | Upgrade-Option wenn parallele Hooks nötig |

#### GitHub Actions: 4 parallele Jobs

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Job 1: Lint+Types │  │ Job 2: Unit Tests │  │ Job 3: E2E Tests │  │ Job 4: Security  │
│ ~30-45s           │  │ ~30-60s           │  │ ~1.5-2.5min      │  │ ~30s             │
│                   │  │                   │  │                   │  │                  │
│ - next lint       │  │ - vitest run      │  │ - playwright      │  │ - npm audit      │
│ - tsc --noEmit    │  │ - --coverage      │  │ - next build      │  │ - truffleHog     │
│ - knip            │  │ - Upload Codecov  │  │ - Upload Report   │  │ - license-report │
└──────────────────┘  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

### 12. Statische Analyse, Complexity & Security

#### Code Complexity — ESLint-Regeln + Schwellenwerte

| Regel | Schwellenwert | Was sie misst |
|-------|---------------|---------------|
| `complexity` | **10** | Cyclomatic Complexity pro Funktion |
| `max-depth` | **4** | Max Verschachtelungstiefe |
| `max-lines-per-function` | **50** (skipBlankLines, skipComments) | Zeilen pro Funktion |
| `max-params` | **4** | Parameter pro Funktion |
| `max-nested-callbacks` | **3** | Verschachtelte Callbacks |
| `sonarjs/cognitive-complexity` | **15** | Kognitive Komplexität |

#### ESLint-Plugin-Stack

**Empfohlen hinzuzufügen:**

| Plugin | Priorität | Was es bringt |
|--------|-----------|---------------|
| **eslint-plugin-sonarjs** | Essential | Cognitive Complexity, Code Smells, Duplication (200+ Rules) |
| **eslint-plugin-security** | Essential | 14 Security-Regeln (eval, injection, timing, ReDoS) |
| **eslint-plugin-unicorn** | Empfohlen | 100+ moderne JS Best Practices |
| eslint-plugin-import-x | Nice-to-have | Moderner Fork von eslint-plugin-import |

#### Dead Code: knip (Must-have, Zero Config)

#### Code Duplication: eslint-plugin-sonarjs + jscpd (monatlich)

#### Bundle-Analyse: Next.js built-in + hashicorp/nextjs-bundle-analysis (CI-Budgets)

#### SonarCloud (optional): Kostenlos bis 50k LOC, PR-Dekoration

---

### 13. Security — Vollständige Analyse (Gap-Audit)

#### OWASP Top 10:2025 — Relevanz für PraxisPuls

| Risiko | Relevanz | Mitigation |
|--------|----------|------------|
| A01: Broken Access Control | Middleware Auth Bypass (CVE-2025-29927) | Auth server-side, nicht nur Middleware |
| A02: Security Misconfiguration | Fehlende Security Headers, exponierte `.env` | Security Headers, Zod env-Validierung |
| A03: Supply Chain Failures (NEU) | npm Dependency Attacks | npm audit, Socket.dev, truffleHog |
| A05: Injection | Server Actions Deserialization (CVE-2025-55182) | Drizzle ORM (kein Raw SQL), Zod |

#### Security-Tools — Vollständiger Stack

| Kategorie | Tool | Prio | Aufwand | Was es fängt |
|-----------|------|------|---------|-------------|
| **Secrets Scanning (Pre-commit)** | **gitleaks** | MUST | 30 Min | API-Keys in Commits verhindern |
| **Secrets Scanning (CI)** | **truffleHog** | MUST | 30 Min | API-Keys in PRs, verifiziert gegen APIs |
| **SAST (Linting)** | **eslint-plugin-security** | MUST | 5 Min | 14 Node.js Security-Antipatterns |
| **Dependency Vulnerabilities** | **npm audit** | MUST | 5 Min | Bekannte CVEs in Dependencies |
| **Supply Chain** | **Socket.dev** | MUST | 5 Min | Malware, Typosquatting in Dependencies |
| **Security Headers** | **Playwright Assertions** | MUST | 1-2h | CSP, HSTS, X-Frame-Options auf allen Seiten |
| **RLS Policy Testing** | **pgTAP + supabase-test-helpers** | MUST | 4-6h | Multi-Tenant-Isolation: Practice A ≠ Practice B |
| **License Compliance** | **license-report** | SHOULD | 1h | Keine AGPL/GPL-3.0 in Dependencies (kommerzielles SaaS) |
| **DAST (Quartalsweise)** | **OWASP ZAP** + **Nuclei** | SHOULD | 3-4h | XSS, CORS, Open Redirects, Missing Headers |
| **Rate Limiting** | **Vitest/Playwright** | SHOULD | 1-2h | Public Endpoints (/api/public/responses) gegen Abuse |
| **CSRF** | **Playwright** | LOW | 30 Min | Next.js 15 hat built-in CSRF für Server Actions (verifizieren) |

#### Kritisches Risiko: RLS (Row Level Security)

**83% der exponierten Supabase-Datenbanken haben RLS-Fehlkonfigurationen** (2025-Studie).

PraxisPuls ist Multi-Tenant: Jede Praxis darf NUR eigene Daten sehen. RLS-Policies auf allen 6 Tabellen müssen automatisiert getestet werden:
- **pgTAP Tests:** SQL-Level Tests mit `supabase-test-helpers` (create_supabase_user, authenticate_as)
- **Szenarien:** Practice A kann nicht Practice B's Responses/Alerts/Surveys lesen
- **CI:** `supabase test db` in GitHub Actions

---

### 14. Property-Based Testing: fast-check (SHOULD-HAVE)

Für Zod-Schemas und Business-Logic: automatisch tausende valide/invalide Inputs generieren.

- `surveyResponseSchema`: 11 Felder mit Constraints → fast-check findet Edge-Cases
- `routeByNps()`: Alle NPS (0-10) × Threshold (7-10) × GooglePlaceId (ja/nein) × Enabled (ja/nein)
- Direkte Vitest-Integration

**Aufwand:** 2-3h für erste 5-10 Property-Tests.

---

### 15. Projekt-spezifische Tests

| Bereich | Prio | Aufwand | Tool |
|---------|------|---------|------|
| **Stripe Webhook Idempotency** | MUST | 3-4h | Vitest + MSW (gleiche Event-ID 2x → 1x verarbeitet) |
| **QR Code URL-Korrektheit** | SHOULD | 1-2h | Vitest + jsqr (QR decodieren → URL prüfen) |
| **Email Template Testing** | SHOULD | 2-3h | Vitest + mocked Resend (Links, Platzhalter, HTML-Struktur) |
| **PDF Visual Regression** | SHOULD | 4-6h | Vitest + PDF→PNG→Screenshot-Vergleich |
| **Mobile Network Resilience** | SHOULD | 2-3h | Playwright Network-Throttling auf Survey |
| **Sentry Integration** | SHOULD | 1-2h | Vitest (captureException Mock) |
| **Uptime Monitoring** | SHOULD | 30 Min | BetterStack/Checkly (Free Tier) |

---

## Empfohlener Tool-Stack (Zusammenfassung)

### Test-Ebenen

| Ebene | Tool | Kosten |
|-------|------|--------|
| **Static Analysis** | TypeScript strict + ESLint (sonarjs, security, unicorn) + knip | Kostenlos |
| **Unit Tests** | **Vitest v4.0+** | Kostenlos |
| **Component Tests** | **Vitest 4 Browser Mode** (`vitest-browser-react`) | Kostenlos |
| **Integration Tests** | **Vitest + PGlite** (WASM Postgres) | Kostenlos |
| **E2E / System Tests** | **Playwright v1.58** | Kostenlos |
| **Smoke Tests** | **Checkly** oder GitHub Actions post-deploy | Kostenlos (Free Tier) |
| **Acceptance Tests** | Playwright mit Ticket-IDs in Test-Namen | Kostenlos |

### Testing Infrastructure

| Kategorie | Tool | Kosten |
|-----------|------|--------|
| **Coverage** | Vitest V8 + **Codecov** | Kostenlos |
| **Mocking (Module)** | `vi.mock()` | Built-in |
| **Mocking (HTTP)** | **MSW v2** | Kostenlos |
| **Test-Daten** | **@faker-js/faker** + Custom Builders | Kostenlos |
| **Property-Based** | **fast-check** | Kostenlos |
| **Pre-commit Hooks** | **simple-git-hooks** + **lint-staged** | Kostenlos |
| **CI/CD** | **GitHub Actions** (4 parallele Jobs) | Kostenlos |

### Qualität & Metriken

| Kategorie | Tool | Kosten |
|-----------|------|--------|
| **Complexity** | **eslint-plugin-sonarjs** (Cognitive Complexity) | Kostenlos |
| **Dead Code** | **knip** | Kostenlos |
| **Duplication** | **eslint-plugin-sonarjs** + **jscpd** | Kostenlos |
| **Bundle-Analyse** | Next.js built-in + **hashicorp/nextjs-bundle-analysis** | Kostenlos |
| **Code Quality Cloud** | **SonarCloud** (optional, bis 50k LOC) | Kostenlos |

### Security

| Kategorie | Tool | Kosten |
|-----------|------|--------|
| **SAST (Linting)** | **eslint-plugin-security** (14 Rules) | Kostenlos |
| **Secrets Scanning** | **gitleaks** (pre-commit) + **truffleHog** (CI) | Kostenlos |
| **Dependency Vulns** | **npm audit** (CI) | Kostenlos |
| **Supply Chain** | **Socket.dev** (GitHub App) | Kostenlos |
| **Security Headers** | **Playwright Assertions** (CSP, HSTS, X-Frame) | Kostenlos |
| **RLS Policy Testing** | **pgTAP** + **supabase-test-helpers** | Kostenlos |
| **License Compliance** | **license-report** | Kostenlos |
| **DAST (Quartalsweise)** | **OWASP ZAP** + **Nuclei** | Kostenlos |

### Nicht-funktionale Tests

| Kategorie | Tool | Kosten |
|-----------|------|--------|
| **A11y** | **@axe-core/playwright** (WCAG 2.2 AA) | Kostenlos |
| **Visual Regression** | **Playwright toHaveScreenshot()** | Kostenlos |
| **Performance** | **Lighthouse CI** + **Vercel Speed Insights** | Kostenlos |
| **Uptime Monitoring** | **BetterStack** oder **Checkly** | Kostenlos (Free Tier) |

**Gesamtkosten: 0 €/Monat** — alles kostenlos und Open Source.

### Explizit NICHT empfohlen

| Tool/Methode | Grund |
|-------------|-------|
| Jest | Langsamer, mehr Config, Vitest ist Standard 2026 |
| Cypress | Langsamer, teurer (Cloud), weniger Browser-Support |
| Snapshot Testing | Anti-Pattern für Solo-Dev, rubber-stamping Risiko |
| BDD / Cucumber | Cucumber.js aufgegeben, Overhead für Solo-Dev |
| Biome / oxlint | Kein `next lint` Support, Plugin-Ecosystem fehlt |
| CodeQL | Nicht kostenlos für private Repos |
| type-coverage | strict mode + Zod reicht aus |
| Storybook / Chromatic | Overkill, Vitest Browser Mode ersetzt Component Testing |
| Multi-Node-Matrix | Nur eine Umgebung nötig |
| Playwright Sharding | Erst ab ~50 E2E-Tests |
| Mutation Testing (Stryker) | Zu langsam für CI, optional manuell auf kritische Pfade |

---

## Priorisierte Roadmap

### Phase 1: Foundation (vor Launch) — ~16h

| # | Maßnahme | Aufwand | Impact | Prio |
|---|----------|---------|--------|------|
| 1 | Vitest v4 installieren + konfigurieren | 30 Min | Basis für alles | MUST |
| 2 | eslint-plugin-sonarjs + eslint-plugin-security + Complexity Rules | 30 Min | Sofort Code-Qualität + Security | MUST |
| 3 | knip einrichten (Dead Code Detection) | 15 Min | Unused Code finden | MUST |
| 4 | gitleaks (pre-commit) + truffleHog (CI) | 1h | Secrets Scanning | MUST |
| 5 | Unit-Tests: `validations.ts` (6 Schemas) | 1h | Höchste Coverage/Zeiteinheit | MUST |
| 6 | Unit-Tests: `review-router.ts` (Routing-Logic) | 45 Min | Kern-Business-Logic | MUST |
| 7 | Unit-Tests: `utils.ts` (5 Funktionen) | 30 Min | Quick Wins | MUST |
| 8 | simple-git-hooks + lint-staged | 30 Min | Verhindert fehlerhafte Commits | MUST |
| 9 | GitHub Actions CI Workflow (4 Jobs inkl. Security) | 1-2h | Automatisierte QA | MUST |
| 10 | Socket.dev GitHub App | 5 Min | Supply-Chain-Security | MUST |
| 11 | PGlite Setup + DB-Integrationstests + Migration Testing | 2-3h | Queries + Migrations absichern | MUST |
| 12 | Security Headers in E2E (Playwright Assertions) | 1-2h | CSP, HSTS auf allen Seiten | MUST |
| 13 | RLS Policy Tests (pgTAP) | 4-6h | Multi-Tenant-Isolation | MUST |
| 14 | E2E erweitern: Survey-Flow + Auth + Smoke | 1-2h | Kritische User-Flows | MUST |

### Phase 2: Vertiefen (vor/nach Launch) — ~12h

| # | Maßnahme | Aufwand | Impact | Prio |
|---|----------|---------|--------|------|
| 15 | Vitest Browser Mode: Component Tests | 2-3h | UI-Komponenten isoliert testen | SHOULD |
| 16 | fast-check: Property-Based Tests | 2-3h | Zod + Router Edge-Cases | SHOULD |
| 17 | Stripe Webhook Idempotency Tests | 3-4h | Zahlungs-Zuverlässigkeit | MUST |
| 18 | QR Code URL-Korrektheit (jsqr) | 1-2h | Gedruckte QR-Codes korrekt | SHOULD |
| 19 | Email Template Tests | 2-3h | Links + Platzhalter korrekt | SHOULD |
| 20 | license-report in CI | 1h | Keine inkompatiblen Lizenzen | SHOULD |

### Phase 3: Polish (nach Launch) — ~10h

| # | Maßnahme | Aufwand | Impact | Prio |
|---|----------|---------|--------|------|
| 21 | eslint-plugin-unicorn | 15 Min | Moderne JS Best Practices | SHOULD |
| 22 | SonarCloud Free Tier | 30 Min | Code-Quality-Dashboard | SHOULD |
| 23 | hashicorp/nextjs-bundle-analysis | 20 Min | Bundle-Size-Budgets in CI | SHOULD |
| 24 | Codecov Integration | 30 Min | Coverage-Tracking in PRs | SHOULD |
| 25 | @axe-core/playwright A11y-Tests | 30 Min | WCAG 2.2 AA | SHOULD |
| 26 | Lighthouse CI | 1h | Performance-Regression | SHOULD |
| 27 | Visual Regression + PDF (toHaveScreenshot) | 2-3h | Cross-Theme + PDF-Output | SHOULD |
| 28 | OWASP ZAP Baseline Scan (quartalsweise) | 3-4h | DAST | SHOULD |
| 29 | Uptime Monitoring (BetterStack/Checkly) | 30 Min | Post-Deploy Health | SHOULD |
| 30 | MSW für externe API-Mocks | 1h | Stripe/Supabase-Mocks | SHOULD |

---

## Vorgeschlagene Implementierungs-Tickets

### PP-014: Static Analysis + Security Scanning (Phase 1)
- eslint-plugin-sonarjs + eslint-plugin-security + Complexity Rules
- knip (Dead Code, Unused Exports/Dependencies)
- gitleaks (pre-commit) + truffleHog (CI)
- Socket.dev GitHub App + npm audit in CI
- **Aufwand: ~2h, Priority: high**

### PP-015: Test-Foundation — Vitest v4 + Unit Tests + CI (Phase 1)
- Vitest v4 installieren + konfigurieren (inkl. Browser Mode Setup)
- Unit-Tests für validations.ts, review-router.ts, utils.ts, themes.ts, qr.ts
- simple-git-hooks + lint-staged
- GitHub Actions CI Workflow (4 parallele Jobs: Lint+Types, Unit, E2E, Security)
- Coverage-Ziel: 80% auf `src/lib/`
- **Aufwand: ~5h, Priority: high**

### PP-016: Integration + E2E + Security Tests (Phase 1)
- PGlite Setup + DB-Integrationstests + Migration Testing
- RLS Policy Tests (pgTAP + supabase-test-helpers)
- Security Headers Assertions in Playwright
- E2E erweitern: Survey-Flow, Auth-Flow, Smoke Tests
- Stripe Webhook Contract + Idempotency Tests
- @faker-js/faker + Custom Builder-Funktionen
- **Aufwand: ~8h, Priority: high**

### PP-017: Component Tests + Property-Based + Projekt-spezifisch (Phase 2)
- Vitest Browser Mode: Component Tests (survey-form, nps-chart, etc.)
- fast-check Property-Based Tests (Zod + Router)
- QR Code URL-Korrektheit (jsqr)
- Email Template Tests
- license-report in CI
- **Aufwand: ~8h, Priority: medium**

### PP-018: Test-Polish — A11y, Visual, Performance, Monitoring (Phase 3)
- eslint-plugin-unicorn + SonarCloud
- Bundle-Analysis + Codecov
- @axe-core/playwright A11y + Lighthouse CI
- Visual Regression + PDF-Output Testing
- OWASP ZAP Baseline Scan
- Uptime Monitoring (BetterStack/Checkly)
- MSW + Vercel Deployment Checks
- **Aufwand: ~10h, Priority: medium**

---

## Akzeptanzkriterien
- [x] Alle Fragestellungen beantwortet mit konkreter Empfehlung
- [x] Tool-Vergleich (Vitest vs. Jest, Playwright vs. Cypress, etc.) mit Tabelle
- [x] Vollständige Testing Trophy definiert (6 Ebenen + Querschnitt)
- [x] Priorisierte Roadmap: Phase 1, 2, 3 mit MUST/SHOULD Bewertung
- [x] Workflow definiert: Pre-commit → CI → Deploy → Smoke Pipeline
- [x] Aufwandsschätzung für Implementierung
- [x] Security-Gap-Analyse (OWASP, Secrets, RLS, Headers, DAST, CSRF)
- [x] Follow-up Implementierungs-Tickets (PP-014 bis PP-018)

## Quellen
- Vitest v4.0 Announcement (Jan 2026) — Browser Mode, Visual Regression
- Next.js Testing Docs (Vitest + Playwright)
- Playwright v1.58 Docs (Visual, A11y, AI Agents)
- Jest 30 Blog (Juni 2025)
- Drizzle ORM + PGlite Integration (rphlmr/drizzle-vitest-pg)
- fast-check Docs (Property-Based Testing)
- MSW v2 Docs
- GitHub Actions Pricing 2026
- Codecov, Lighthouse CI Docs
- Supabase Testing Overview + supabase-test-helpers
- pgTAP RLS Testing Guide
- Cypress Cloud Pricing
- eslint-plugin-sonarjs, eslint-plugin-security, eslint-plugin-unicorn
- knip (Dead Code Detection)
- OWASP Top 10:2025
- Next.js Security Updates (CVE-2025-29927, CVE-2025-55182)
- Socket.dev, gitleaks, truffleHog (Secrets Scanning)
- SonarCloud Pricing (50k LOC Free)
- jscpd (Copy-Paste Detection)
- hashicorp/nextjs-bundle-analysis
- license-report (License Compliance)
- OWASP ZAP + Nuclei (DAST)
- BetterStack, Checkly (Uptime Monitoring)
- Biome v2.3, oxlint v1.0 (Vergleich)
- Kent C. Dodds: Vitest Browser Mode als RTL-Nachfolger
- Stripe Webhook Idempotency Docs
- GitGuardian Secret Scanning Report 2025

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Umfassende Test-Management Research für PraxisPuls |
| 2026-02-11 | Aktiviert | Status backlog → active |
| 2026-02-11 | Recherche | 4 parallele Agenten: Unit/Integration, E2E/System, CI/CD, Codebase-Inventar |
| 2026-02-11 | Ergebnis | Vitest + Playwright + PGlite + simple-git-hooks + GitHub Actions empfohlen |
| 2026-02-11 | Ergänzt | Static Analysis, Complexity, Security (SAST), Dead Code, Bundle-Analyse |
| 2026-02-11 | Gap-Audit | 5. Agent: Kritische Lücken identifiziert (RLS, Secrets, Components, Smoke, Headers) |
| 2026-02-11 | Finalisiert | Vitest v4.0+, 6-Ebenen Testing Trophy, Security-Stack komplett, 5 Impl-Tickets |
| 2026-02-11 | Done | Tool-Stack final verifiziert (24/24 Bereiche ✅), Research abgeschlossen |
