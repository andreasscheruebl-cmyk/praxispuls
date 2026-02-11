---
id: PP-023
type: refactor
title: "ESLint Warnings aufräumen (~100 Warnings)"
status: backlog
priority: low
sprint: launch-prep
parent: PP-014
branch: ticket/PP-023-eslint-cleanup
created: 2026-02-11
updated: 2026-02-11
estimate: 3h
actual: ""
tags: [lint, refactor, code-quality, dx]
---

# PP-023: ESLint Warnings aufräumen (~100 Warnings)

## Beschreibung
Nach PP-014 (Static Analysis Setup) gibt es ~100 ESLint-Warnings (sonarjs + security + complexity). Keine Errors, Build läuft sauber. Warnings sind informativ und blockieren nichts, aber sollten mittelfristig reduziert werden.

Hauptquellen (aus PP-014 Analyse):
- `sonarjs/cognitive-complexity` in größeren Komponenten (z.B. `survey-form.tsx`)
- `max-lines-per-function` in Server Actions und API Routes
- `security/detect-object-injection` False Positives
- `max-depth` in verschachtelten Conditionals

## Akzeptanzkriterien
- [ ] ESLint Warnings um mindestens 50% reduziert
- [ ] Keine neuen Errors eingeführt
- [ ] Build weiterhin sauber
- [ ] Kein Funktionalitäts-Änderung (reines Refactoring)

## Ansatz
- Warning-Liste generieren: `npx next lint 2>&1 | grep "Warning"`
- Gruppieren nach Rule
- False Positives mit `// eslint-disable-next-line` + Kommentar unterdrücken
- Echte Complexity-Issues durch Extraktion von Hilfsfunktionen lösen
- Nicht: alle Warnings auf 0 drücken (Aufwand/Nutzen)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Deferred aus PP-014 (offene Punkte) |
