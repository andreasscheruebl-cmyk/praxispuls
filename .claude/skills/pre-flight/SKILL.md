---
name: pre-flight
description: Exhaustiver Self-Check vor PR/Review — prüft Security, Validation, Error Handling, Audit, Types, UI, Tests und Code Hygiene. Verwende /pre-flight nach Feature-Implementierung und vor /create-pr.
disable-model-invocation: true
---

# Pre-Flight Self-Check

Exhaustive Checkliste gegen alle geänderten Dateien im aktuellen Branch.
Ziel: ALLE Issues finden in EINEM Pass — kein Review-Ping-Pong.

## Setup

1. Identifiziere geänderte Dateien: `git diff main --name-only`
2. Lies ALLE geänderten Dateien vollständig (nicht nur Diffs)
3. Arbeite die 8 Kategorien systematisch ab
4. Dokumentiere jeden Fund mit `file:line` Referenz
5. Behebe alle Findings bevor du fortfährst

---

## A. Security (10 Checks)

- [ ] **A1 — Auth Gate:** Jede API-Route nutzt `requireAuthForApi()`, jede Server Action prüft Auth
- [ ] **A2 — IDOR:** Jede DB-Query filtert nach `practiceId` in WHERE — kein Zugriff nur über `id`
- [ ] **A3 — Ownership:** UPDATE/DELETE prüft `eq(table.practiceId, practiceId)` UND `eq(table.id, id)`
- [ ] **A4 — Zod safeParse:** Server Actions nutzen `safeParse` (nicht `parse`) für User-Input — strukturierte Errors statt Throws
- [ ] **A5 — UUID Validation:** Alle IDs aus URL-Params/Body werden mit `z.string().uuid()` validiert
- [ ] **A6 — Extra-Key Rejection:** Request-Bodies dürfen keine unbekannten Keys akzeptieren (`.strict()` oder explizite Checks)
- [ ] **A7 — XSS in Emails:** Alle User-Inputs in E-Mail-Templates nutzen `escapeHtml()`
- [ ] **A8 — Keine `as`-Casts auf Runtime-Daten:** `as SomeType` nur für compile-time Narrowing, NIE auf `await db.query()` Ergebnisse oder API-Responses
- [ ] **A9 — TOCTOU / Race Conditions:** Prüfe ob Read → Validate → Write atomar ist (z.B. INSERT mit ON CONFLICT, oder Transaktion)
- [ ] **A10 — Soft-Delete:** Alle Queries die Records lesen filtern `isNull(deletedAt)` wenn die Tabelle `deletedAt` hat

## B. Validation (6 Checks)

- [ ] **B1 — `.trim()` auf Strings:** Alle Text-Inputs haben `.trim()` in Zod Schema ODER vor Verarbeitung
- [ ] **B2 — `.min()/.max()` Boundaries:** Strings haben `.min(1)` (kein Leerstring), `.max(N)` passend zum DB-Limit
- [ ] **B3 — Regex Anchored:** Wenn Regex-Validation: `^...$` Pattern (keine partielle Matches)
- [ ] **B4 — Cross-Field Validation:** Wenn Felder voneinander abhängen → `.refine()` oder `.superRefine()`
- [ ] **B5 — Enum Sync:** Zod-Enums matchen exakt die DB-Schema-Enums / TypeScript-Unions
- [ ] **B6 — POST↔PUT Konsistenz:** Gleiche Validierungsregeln für Create und Update desselben Entities

## C. Error Handling (7 Checks)

- [ ] **C1 — try-catch:** Alle DB-Operationen und externe Calls in try-catch
- [ ] **C2 — `console.error`:** Jeder catch-Block loggt `console.error` mit Kontext (was wurde versucht, welche IDs)
- [ ] **C3 — HTTP Status Codes:** 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal — korrekt verwendet
- [ ] **C4 — Error Format:** Alle Error-Responses haben `{ error: string, code: string }` — Codes: UNAUTHORIZED, BAD_REQUEST, NOT_FOUND, FORBIDDEN, INTERNAL_ERROR, VALIDATION_ERROR
- [ ] **C5 — await Audit:** Jedes `await` hat Error-Handling — kein unbehandeltes Promise-Rejection
- [ ] **C6 — Return nach Error:** Nach Error-Response immer `return` — kein Fall-Through zur Erfolgslogik
- [ ] **C7 — Keine swallowed Errors:** Kein leerer catch-Block, kein `catch (e) { /* ignore */ }`

## D. Audit Logging (3 Checks)

- [ ] **D1 — Vollständigkeit:** Jede Create/Update/Delete-Mutation hat einen `auditEvents`-Insert (wenn Audit-Tabelle existiert)
- [ ] **D2 — before/after:** Update-Audits enthalten `before` und `after` Werte
- [ ] **D3 — Request Metadata:** Audit enthält `userId` und relevante Entity-IDs

## E. Type Safety (5 Checks)

- [ ] **E1 — Keine `as`-Casts:** Keine `as Type` Assertions auf Runtime-Daten — Type Guards oder Zod verwenden
- [ ] **E2 — Keine `!` Non-Null:** Kein `value!` — stattdessen Null-Check mit Early Return
- [ ] **E3 — Types in `@/types`:** Shared Types in `src/types/index.ts`, nicht lokal definiert
- [ ] **E4 — Single Source of Truth:** Constants nicht dupliziert — importieren statt copy-paste
- [ ] **E5 — Exhaustive Switches:** `switch` über Union-Types hat `default: { const _exhaustive: never = value; }` oder alle Cases

## F. UI Consistency (6 Checks)

- [ ] **F1 — Error Display:** Jeder Form-Step/Modal zeigt Errors an (nicht nur `console.log`)
- [ ] **F2 — Double-Submit Prevention:** Submit-Buttons haben `disabled={isPending}` oder equivalent
- [ ] **F3 — Loading States:** Async-Operationen zeigen Loading-Indicator
- [ ] **F4 — Optimistic vs Revalidate:** Nach Mutations: entweder optimistic update ODER `revalidatePath()`/`router.refresh()`
- [ ] **F5 — Modal Close bei Submit:** Modals schließen nach erfolgreichem Submit UND bei Error offen bleiben
- [ ] **F6 — Toast/Feedback:** Erfolg UND Fehler werden dem User kommuniziert (toast, Alert, Inline-Error)

## G. Tests (7 Checks)

- [ ] **G1 — Boundary Tests:** Min/Max-Werte getestet (leere Strings, 0, Negativwerte, Max+1)
- [ ] **G2 — Empty Strings:** Trimmed-Empty-Strings getestet (`"   "` → invalid)
- [ ] **G3 — Extra Keys:** Unbekannte Keys werden rejected (nicht stillschweigend ignoriert)
- [ ] **G4 — Cross-Validation:** Abhängige Felder werden kombiniert getestet
- [ ] **G5 — Enum Sync:** Tests prüfen dass Zod-Enums mit DB-Enums synchron sind (oder Test bricht bei Drift)
- [ ] **G6 — Error Paths:** Nicht nur Happy Path — auch Fehler-Szenarien getestet
- [ ] **G7 — Neue Tests für neuen Code:** Jede neue Validation/Funktion hat mindestens einen Test

## H. Code Hygiene (5 Checks)

- [ ] **H1 — Unused Imports:** Keine unbenutzten Imports (ESLint fängt das, aber trotzdem prüfen)
- [ ] **H2 — Keine Dead Code:** Auskommentierter Code oder unreachbare Branches entfernt
- [ ] **H3 — DRY:** Keine copy-paste Duplikate — gemeinsame Logik extrahiert
- [ ] **H4 — Import Organization:** Reihenfolge: externe packages → `@/` aliases → relative imports
- [ ] **H5 — Console.log entfernt:** Keine Debug-Logs im Production-Code (nur `console.error` in catch-Blocks erlaubt)

---

## Ablauf

1. **Scan:** Lies alle geänderten Dateien
2. **Check:** Arbeite A → H systematisch ab
3. **Finde:** Dokumentiere jeden Fund als `[KATEGORIE-NR] file:line — Beschreibung`
4. **Fixe:** Behebe alle Findings
5. **Re-Scan:** Lies die geänderten Dateien erneut und prüfe die betroffenen Kategorien
6. **CI-Checks:** `npm run typecheck && npx next lint && npm run test && npm run build`
7. **Report:** Fasse zusammen: X Findings gefunden, X behoben, alle Checks grün

## Ergebnis-Format

```
## Pre-Flight Report

### Findings (behoben)
- [A2] src/actions/foo.ts:42 — IDOR: fehlender practiceId Filter → behoben
- [B2] src/lib/validations.ts:18 — .min(1) fehlte auf name → behoben
- [F2] src/components/FooModal.tsx:55 — Double-Submit nicht verhindert → behoben

### CI Checks
- TypeCheck: ✅
- Lint: ✅
- Tests: ✅ (340/340)
- Build: ✅

### Ergebnis: READY FOR REVIEW
```

Falls Findings NICHT behebbar sind (z.B. architektonische Fragen), dokumentiere sie als **Offen** und frage den Entwickler.
