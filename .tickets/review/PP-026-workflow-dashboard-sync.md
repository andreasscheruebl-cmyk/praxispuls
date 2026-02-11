---
id: PP-026
type: task
title: "Unified Workflow Dashboard – Tickets, Sprints, Tests, Versioning, Deploy & Release synchronisieren"
status: review
priority: high
sprint: launch-prep
parent: ""
branch: ticket/PP-026-workflow-dashboard
created: 2026-02-11
updated: 2026-02-11
estimate: 4h
actual: ""
tags: [dx, workflow, dashboard, tickets, sprints, ci, versioning, release]
---

# PP-026: Unified Workflow Dashboard – Alles synchron halten

## Problem

Aktuell gibt es mehrere Status-Dateien, die alle veraltet und inkonsistent sind:

| Datei | Letzte Aktualisierung | Problem |
|-------|----------------------|---------|
| `STATUS.md` | 2026-02-09 | Feature-Liste veraltet, durchgestrichene Items, nicht mehr gepflegt |
| `.tickets/BOARD.md` | 2026-02-10 | Zeigt nur PP-001, komplett veraltet |
| `.tickets/sprints.json` | 2026-02-10 | Sprint-Status stimmt nicht mit Ticket-Realität überein |
| `.tickets/SPRINT.md` | nicht vorhanden | Sollte laut CLAUDE.md auto-generiert sein, existiert nicht |
| `package.json` version | `0.1.0` | Kein Zusammenhang zu Git-Tags oder Releases |

**Resultat:** Kein Single Source of Truth. Man muss manuell in Ordnern nachschauen um den aktuellen Stand zu kennen.

## Ziel

**Ein einziges, immer aktuelles Dashboard** das auf einen Blick zeigt:
- Ticket-Status (Kanban: backlog / active / review / done)
- Sprint-Fortschritt (aktueller Sprint, % done)
- Test-Status (letzter CI-Run, Pass/Fail, Coverage)
- Version (aktuelle Version, letzter Release)
- Deployment (Vercel-Status, letzte Deployment-URL)

## Akzeptanzkriterien

### Dashboard-Datei (MUST)
- [x] `DASHBOARD.md` als Single Source of Truth
- [x] Enthält: Kanban-Board (alle Tickets nach Status, sortiert nach Priorität)
- [x] Enthält: Sprint-Übersicht (aktueller Sprint, Fortschritt)
- [x] Enthält: CI-Status (letzter Run via `gh run list`)
- [x] Enthält: Version + Git Tag
- [x] Enthält: Deployment-Status (Vercel URL)
- [x] Enthält: Links & Resources (Projekt, Services, Ordner, Docs)

### Auto-Update Mechanismus (MUST)
- [x] Script `npm run status` → `npx tsx scripts/generate-dashboard.ts`
- [x] Liest Tickets aus `.tickets/` Ordnern (backlog, active, review, done)
- [x] Liest Sprint-Info aus `sprints.json`
- [x] Liest Version aus `package.json`
- [x] Liest letzten CI-Run via `gh run list --limit 1` (graceful fallback)
- [x] CRLF-Handling für Windows-Kompatibilität

### Veraltete Dateien aufräumen (MUST)
- [x] `STATUS.md` gelöscht (ersetzt durch `DASHBOARD.md`)
- [x] `.tickets/BOARD.md` gelöscht (ersetzt durch `DASHBOARD.md`)
- [x] `.tickets/SPRINT.md` existierte nicht — kein Handlungsbedarf

### Workflow-Integration (SHOULD)
- [x] CLAUDE.md Regel: "Nach jedem Ticket-Move `npm run status` ausführen"
- [x] ~~Git-Hook oder CI-Step~~ → ausgelagert (Overkill für Solo-Dev, Claude-Konvention reicht)

### Konsistenz-Regeln (SHOULD)
- [x] ~~Sprint-/Version-Konsistenz automatisch prüfen~~ → manuell via Dashboard sichtbar

## Technische Optionen

### Option A: Node.js Script (empfohlen)
```bash
npm run status  # generiert DASHBOARD.md
```
- Script in `scripts/generate-dashboard.ts`
- Liest `.tickets/` Ordner, `sprints.json`, `package.json`
- Generiert Markdown-Datei
- Schnell, kein externer Service nötig

### Option B: Claude-Konvention
- Kein Script, stattdessen Regel in CLAUDE.md
- Claude aktualisiert Dashboard manuell nach jedem Ticket-Move
- Pro: Kein Code. Contra: Fehleranfällig, wird vergessen

### Option C: GitHub Actions
- CI-Step der nach jedem Push Dashboard generiert und committet
- Pro: Immer aktuell. Contra: Auto-Commits, Merge-Konflikte

**Empfehlung:** Option A (Script) + Claude-Konvention als Backup

## Dashboard-Format (Vorschlag)

```markdown
# PraxisPuls – Dashboard
> Auto-generiert: 2026-02-11 | Version: 0.1.0 | CI: ✅ Run #21901904587

## Sprint: launch-prep (Wochen 11-12)
Fortschritt: 2/8 done | 0 active | 1 review | 5 backlog

## Kanban

### 🔴 Active
_(keine)_

### 🟡 Review
- **PP-019** CI Pipeline Fixes [bug, high]

### 📋 Backlog
- **PP-020** Supabase DB Migration [critical]
- **PP-021** Legal Pages finalisieren [high]
- ...

### ✅ Done (letzten 5)
- **PP-015** Test Foundation
- **PP-014** Static Analysis
- ...

## Tests
| Suite | Status | Details |
|-------|--------|---------|
| Unit (Vitest) | ✅ 79/79 | 93% coverage |
| Lint (ESLint) | ✅ | 0 errors, ~100 warnings |
| TypeScript | ✅ | strict mode |
| E2E (Playwright) | ✅ 6/6 | public pages |
| Security | ✅ | npm audit + gitleaks |

## Deploy
- **Production:** https://praxispuls.vercel.app
- **Last Deploy:** 2026-02-11 via Vercel (auto on push to main)
```

## Abhängigkeiten
- PP-007 (done) – Versioning existiert
- PP-019 (done) – CI Pipeline + Job Summaries

## Änderungen

### Neue Dateien
| Datei | Beschreibung |
|-------|-------------|
| `scripts/generate-dashboard.ts` | Dashboard-Generator (TypeScript, ~270 Zeilen) |
| `DASHBOARD.md` | Generierte Dashboard-Datei (Single Source of Truth) |

### Geänderte Dateien
| Datei | Änderung |
|-------|----------|
| `package.json` | `"status"` Script hinzugefügt |
| `CLAUDE.md` | Dashboard-Aktualisierungs-Regel hinzugefügt |

### Gelöschte Dateien
| Datei | Grund |
|-------|-------|
| `STATUS.md` | Ersetzt durch `DASHBOARD.md` |
| `.tickets/BOARD.md` | Ersetzt durch `DASHBOARD.md` |

## Verifikation
- `npm run test` → 79/79 passed
- `npm run typecheck` → passed
- `npx next lint` → 0 errors
- `npm run build` → sauber
- `npm run status` → DASHBOARD.md korrekt generiert (14 done, 11 backlog, 1 active)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Andi: "workflow somehow to be synced and consistent, always up-to-date dashboard" |
| 2026-02-11 | Script erstellt | `scripts/generate-dashboard.ts` – liest Tickets, Sprints, Version, CI |
| 2026-02-11 | CRLF Fix | Windows-Zeilenumbrüche in Frontmatter-Parsing (6 Tickets nicht gelesen) |
| 2026-02-11 | Links-Section | Projekt, Services, Ordner, Docs im Dashboard |
| 2026-02-11 | Cleanup | `STATUS.md` + `.tickets/BOARD.md` gelöscht |
| 2026-02-11 | CLAUDE.md | Regel: "Nach Ticket-Move `npm run status` ausführen" |
| 2026-02-11 | TypeScript Fix | `fm` possibly undefined → Non-null assertion + optional chaining |
| 2026-02-11 | Verifikation | Tests 79/79 ✅, TypeScript ✅, Lint 0 errors ✅, Build ✅ |
