---
name: fix-issue
description: Arbeite ein GitHub Issue ab — lese Details, erstelle Branch, implementiere, teste, committe.
argument-hint: "<issue-nummer>"
disable-model-invocation: true
---

Bearbeite GitHub Issue #$ARGUMENTS:

1. Lies das Issue: `gh issue view $ARGUMENTS`
2. Erstelle einen Branch basierend auf dem Issue-Typ:
   - Feature → `feat/$ARGUMENTS-slug`
   - Bug → `fix/$ARGUMENTS-slug`
   - Chore/Refactor → `chore/$ARGUMENTS-slug`
3. Analysiere die betroffenen Dateien und den Codebase-Kontext
4. Implementiere die Lösung gemäß den Acceptance Criteria
5. Prüfe:
   - `npm run typecheck` — keine Fehler
   - `npx next lint` — keine Errors
   - `npm run test` — Tests grün
   - `npm run build` — Build sauber
6. Erstelle einen Commit mit Conventional Commits Format:
   `type(scope): description (#$ARGUMENTS)`
7. Pushe den Branch

Regeln:
- Folge den Konventionen aus CLAUDE.md
- Halte die Änderungen minimal und fokussiert
- Keine neuen Dependencies ohne Begründung
- DSGVO beachten bei Datenverarbeitung
- Issue NICHT schließen — das passiert durch den PR-Merge
