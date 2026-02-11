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

---

## 🚨 TICKET-PFLICHT (NICHT VERHANDELBAR)

Dieses Projekt nutzt TicketOps. Tickets liegen in `.tickets/` als Markdown-Dateien.
**Ohne Ticket wird KEIN Code angefasst. Keine Ausnahme.**

### Vor JEDER Code-Änderung

1. Prüfe `.tickets/active/` – gibt es ein passendes Ticket?
2. **JA** → Arbeite im zugehörigen Branch (`ticket/{ID}-{slug}`)
3. **NEIN** → Erstelle zuerst ein Ticket ODER frage mich:
   - „Dafür existiert kein Ticket. Soll ich PP-XXX erstellen?"
   - Schlage Typ, Titel und 3-5 Akzeptanzkriterien vor
   - Warte auf meine Bestätigung BEVOR du Code schreibst

### Was OHNE Ticket erlaubt ist

- Dateien lesen und analysieren
- `.tickets/` Dateien erstellen und bearbeiten
- Tests ausführen (explorativ)
- Recherche und Analyse

### Was OHNE Ticket VERBOTEN ist

- Code-Dateien erstellen, ändern oder löschen
- Dependencies hinzufügen (`npm install`)
- Datenbank-Migrationen erstellen
- Environment Variables ändern
- Git Commits

### Commit-Format

```
type(scope): beschreibung [TICKET-ID]
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`, `ci`, `style`

### Ticket in Review geben

Ein Ticket geht in REVIEW wenn:
- Alle Code-Änderungen implementiert
- Build sauber (`next build` ✅)
- **Alle Tests grün:**
  - `npm run test` (Unit Tests) ✅
  - `npm run typecheck` (TypeScript) ✅
  - `npx next lint` (ESLint, keine Errors) ✅
  - E2E Tests wenn betroffen (`npx playwright test`) ✅
- **Test-Ergebnisse im Ticket-Log dokumentiert** (Anzahl Tests, Pass/Fail, Coverage wenn relevant)
- Ticket-Dokumentation vollständig (Analyse, Änderungen, Verifikation, betroffene Dateien)
- Ticket-Log aktualisiert
- Ticket-Datei nach `.tickets/review/` verschoben, `status: review`

**⚠️ Kein Review ohne grüne Tests!** Wenn Tests fehlschlagen, bleibt das Ticket auf `active` bis die Tests gefixt sind.

### Ticket abschließen

**⚠️ Claude darf Tickets NIEMALS auf `done` setzen oder nach `.tickets/done/` verschieben!**
Maximal erlaubt: nach `.tickets/review/` verschieben. Nur Andi entscheidet wann ein Ticket done ist.

Ein Ticket ist erst DONE wenn:
- Andi hat Review/Test bestätigt
- Alle Akzeptanzkriterien abgehakt
- Tests geschrieben UND grün
- **Andi** verschiebt Ticket nach `.tickets/done/`, `status: done`

### Bei Prompt ohne Ticket-Kontext
Wenn der User einen Prompt gibt ohne Ticket-Bezug:
1. Frage: "Soll ich dafür ein Ticket erstellen?"
2. Schlage Typ, Titel und Akzeptanzkriterien vor
3. Warte auf Bestätigung BEVOR du Code schreibst

### Ticket-Status

Gültige Status-Werte (entsprechen den Ordnern in `.tickets/`):

| Status | Ordner | Bedeutung |
|--------|--------|-----------|
| `backlog` | `.tickets/backlog/` | Geplant, noch nicht begonnen |
| `active` | `.tickets/active/` | In Arbeit |
| `review` | `.tickets/review/` | Implementierung fertig, wartet auf Review/Test durch Andi |
| `done` | `.tickets/done/` | Abgeschlossen und bestätigt |

**Workflow:** `backlog` → `active` → `review` → `done`

Ein Ticket geht in `review` wenn:
- Alle Code-Änderungen gemacht sind
- Build sauber ist
- **Alle Tests grün** (Unit, TypeScript, Lint, E2E wenn betroffen)
- **Test-Ergebnisse im Ticket-Log** (Anzahl, Pass/Fail, Coverage)
- Ticket-Dokumentation vollständig (Analyse, Änderungen, Verifikation)
- Bereit für manuellen Test / Review durch Andi

Erst nach Andis Bestätigung → `done`.

### Automatisches Logging

Jede Ticket-Bearbeitung wird **vollständig** im Ticket dokumentiert — im Log-Bereich UND in den passenden Beschreibungs-Sektionen.

#### Was ins Ticket-Log gehört (Tabelle am Ende)
- **Jeder Arbeitsschritt** als eigene Zeile mit Datum
- Dateien erstellt/geändert (mit Pfad)
- **Test-Ergebnisse (PFLICHT vor Review):**
  - `npm run test` → z.B. "79/79 passed, 93% coverage"
  - `npm run typecheck` → "passed" oder Fehler
  - `npx next lint` → "0 errors, X warnings"
  - `npx playwright test` → "6/6 passed" (wenn E2E betroffen)
  - CI-Run-Ergebnis wenn gepusht → Run-ID + Job-Status
- Entscheidungen getroffen (was und warum)
- Probleme/Blocker

#### Was in die Ticket-Beschreibung gehört
- **Analyse:** Was wurde untersucht? Welche Dateien gelesen? Was war der Ist-Zustand?
- **Lösungsansatz:** Welcher Ansatz wurde gewählt und warum?
- **Änderungen:** Konkrete Beschreibung aller Code-Änderungen (welche Datei, was geändert)
- **Verifikation:** Build-Ergebnis, Test-Ergebnis, manuelle Prüfschritte
- **Betroffene Dateien:** Vollständige Liste aller geänderten/erstellten/gelöschten Dateien

#### Ziel
Jedes Ticket soll **nach Abschluss als vollständige Dokumentation** dienen — jemand der das Ticket liest, muss nachvollziehen können was gemacht wurde, warum, und wie es verifiziert wurde.

### Dashboard aktualisieren

**Nach jedem Ticket-Statuswechsel** (backlog→active, active→review, etc.) MUSS das Dashboard aktualisiert werden:
```bash
npm run status
```
Das generiert `DASHBOARD.md` automatisch aus `.tickets/`, `sprints.json`, `package.json`.

- `DASHBOARD.md` ist die **Single Source of Truth** für den Projektstatus
- Nicht manuell editieren — wird überschrieben
- `STATUS.md` und `.tickets/BOARD.md` existieren nicht mehr (ersetzt durch Dashboard)

---

## Ticket-Befehle

| Befehl | Aktion |
|--------|--------|
| `ticket:new feature "Titel"` | Ticket in `.tickets/backlog/` erstellen |
| `ticket:new bug "Titel"` | Bug-Ticket erstellen (Priority: high) |
| `ticket:list` | Aktive Tickets auflisten |
| `ticket:list all` | Alle Tickets |
| `ticket:board` | Kanban-Übersicht |
| `ticket:pick PP-XXX` | Ticket aktivieren, Branch nennen |
| `ticket:review PP-XXX` | Ticket in Review geben (→ `.tickets/review/`) |
| `ticket:done PP-XXX` | Ticket abschließen (nach Andis Bestätigung) |
| `ticket:log PP-XXX "text"` | Log-Eintrag hinzufügen |
| `ticket:stats` | Statistik |
| `sprint:status` | Aktuellen Sprint-Fortschritt anzeigen |
| `sprint:plan <name>` | Sprint planen, Tickets vorschlagen |
| `sprint:start <name>` | Sprint aktivieren |
| `sprint:end` | Sprint abschließen, offene Tickets besprechen |
| `sprint:tickets` | Alle Tickets im aktuellen Sprint |

### Ticket erstellen

Nutze Templates aus `.tickets/templates/`. Nächste Nummer aus `.tickets/COUNTER.txt`, Counter inkrementieren.

```yaml
---
id: PP-XXX
type: feature|bug|task|research|requirement|test|refactor|docs|chore|release
title: "Titel"
status: backlog|active|review|done
priority: critical|high|medium|low
sprint: foundation|survey-engine|dashboard|qr-onboarding|payments-polish|launch-prep
branch: ticket/PP-XXX-slug
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

### Workflow

```
Ich sage: "Implementiere Feature X"
Du machst:
  1. .tickets/active/ prüfen → kein Ticket
  2. Vorschlag: "Soll ich PP-XXX erstellen? Akzeptanzkriterien: ..."
  3. Ich bestätige
  4. Ticket erstellen in backlog/ → nach active/ verschieben
  5. Branch → Analyse → Code → Tests → Ticket-Doku aktualisieren
  6. Build prüfen → Ticket nach review/ verschieben (status: review)
  7. Andi testet/bestätigt → Ticket nach done/ (status: done)
```

---

## Sprint-Management

### Sprint-Kontext

**IMMER** zu Beginn einer Session `.tickets/sprints.json` lesen, um den aktuellen Sprint zu kennen.

```
Aktueller Sprint:     .tickets/sprints.json → "current_sprint"
Sprint-Details:       .tickets/sprints.json → sprints.<name>
Sprint-Übersicht:     .tickets/SPRINT.md (auto-generiert)
```

### Sprint-Regeln

1. **Neue Tickets** bekommen automatisch den aktuellen Sprint zugewiesen
2. **Scope-Schutz**: Wenn eine Aufgabe nicht zum aktuellen Sprint passt:
   - "⚠️ Das gehört nicht zu Sprint X. Soll ich es für Sprint Y planen oder ins Backlog legen?"
3. **Sprint-Wechsel**: Nur Andi kann Sprints starten/beenden
4. **Sprint-Fokus**: Priorisiere immer Tickets des aktuellen Sprints

### Sprint-Planung

```
User: "Plane Sprint foundation"

Claude Code:
  1. Liest sprints.json → foundation.deliverables
  2. Schlägt Tickets vor (eins pro Deliverable)
  3. User bestätigt
  4. Erstellt Tickets in .tickets/backlog/ mit sprint: foundation
```

### Sprint-Ende

```
User: "Sprint foundation abschließen"

Claude Code:
  1. Prüft alle Tickets mit sprint: foundation
  2. Zählt: X done, Y noch offen
  3. Listet offene Tickets auf
  4. User entscheidet: verschieben oder abbrechen
  5. sprints.json aktualisieren
```

### Sprint-Übersicht

| Sprint | Wochen | Fokus |
|--------|--------|-------|
| foundation | 1-2 | Setup, DB, Auth, Layout |
| survey-engine | 3-4 | Umfrage, Review-Routing, Templates |
| dashboard | 5-6 | NPS-Charts, Responses, Alerts |
| qr-onboarding | 7-8 | QR-Generator, Wizard, Branding |
| payments-polish | 9-10 | Stripe, Limits, Performance |
| launch-prep | 11-12 | Landing Page, DSGVO, Beta-Test |

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
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- **Branching:** Code-Änderungen IMMER auf Ticket-Branch (`ticket/PP-XXX-slug`), NIE direkt auf `main`
- **Merge:** Nach Review direkt auf `main` mergen (kein PR nötig)
- **Ablauf:** `git checkout -b ticket/PP-XXX-slug` → arbeiten → committen → review → `git checkout main && git merge ticket/PP-XXX-slug`

---

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
1. Supabase DB aufsetzen (Migration) – `npm run db:push` gegen Supabase
2. Alle Features E2E testen
3. Legal Pages finalisieren (Impressum, Datenschutz, AGB)
4. SEO + Monitoring (Meta Tags, Sentry, Plausible)

## Projektstruktur
Siehe README.md für die vollständige Struktur.

## DB Schema
Siehe `src/lib/db/schema.ts` – 4 Tabellen:
- practices (Tenants)
- surveys (Umfragen)
- responses (Antworten, kein PII!)
- alerts (Detractor-Notifications)

## Projektstruktur

```
praxispuls/
├── CLAUDE.md                       ← DU BIST HIER
├── .tickets/
│   ├── COUNTER.txt
│   ├── BOARD.md
│   ├── SPRINT.md                   ← Auto-generiert: aktueller Sprint
│   ├── sprints.json                ← Sprint-Definitionen + aktueller Sprint
│   ├── templates/
│   ├── backlog/
│   ├── active/
│   ├── review/
│   ├── done/
│   └── archive/
├── src/
│   ├── app/                        ← Next.js App Router
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── (marketing)/
│   │   ├── s/[slug]/               ← Public Survey (SSR)
│   │   └── api/
│   ├── components/
│   │   ├── ui/                     ← shadcn/ui
│   │   ├── dashboard/
│   │   ├── survey/
│   │   └── marketing/
│   ├── lib/
│   │   ├── db/schema.ts            ← Drizzle Schema
│   │   ├── supabase/
│   │   ├── stripe.ts
│   │   ├── email.ts
│   │   ├── review-router.ts
│   │   └── validations.ts          ← Zod Schemas
│   └── proxy.ts                    ← Auth + Rate Limiting
├── drizzle/                        ← Migrations
├── scripts/                        ← TicketOps Scripts
└── package.json
```

## Environment Variables
Siehe `.env.example` für alle benötigten Variablen.
