---
id: PP-015
type: task
title: "Test-Foundation: Vitest v4 + Unit Tests + Pre-commit + CI"
status: backlog
priority: high
sprint: launch-prep
parent: PP-013
branch: ticket/PP-015-test-foundation
created: 2026-02-11
updated: 2026-02-11
estimate: 5h
actual: ""
tags: [testing, vitest, unit-tests, ci, dx]
---

# PP-015: Test-Foundation — Vitest v4 + Unit Tests + CI

## Beschreibung
Vitest v4 als Test-Runner installieren, Unit-Tests für alle Business-Logic-Funktionen schreiben, Pre-commit Hooks einrichten, GitHub Actions CI-Workflow mit 4 parallelen Jobs aufsetzen.

Basierend auf PP-013 Research, Phase 1.

## Akzeptanzkriterien
- [ ] Vitest v4.0+ installiert + konfiguriert (`vitest.config.ts`)
- [ ] Coverage-Provider V8 konfiguriert (80% global, 95% auf kritische Dateien)
- [ ] Unit-Tests: `validations.ts` — alle 6 Zod-Schemas (valide + invalide Inputs, Edge-Cases)
- [ ] Unit-Tests: `review-router.ts` — alle NPS-Kombinationen (Promoter/Passive/Detractor × Google/Custom)
- [ ] Unit-Tests: `utils.ts` — alle 5+ Funktionen (getNpsCategory, slugify, formatDateDE, etc.)
- [ ] Unit-Tests: `themes.ts` — getThemeConfig für standard + vertrauen
- [ ] Unit-Tests: `qr.ts` — URL-Format, DataURL generiert
- [ ] `simple-git-hooks` + `lint-staged` installiert + konfiguriert
- [ ] Pre-commit: ESLint + Prettier auf staged files + `tsc --noEmit`
- [ ] Pre-push: `vitest run` (full suite)
- [ ] GitHub Actions Workflow: 4 parallele Jobs (Lint+Types, Unit Tests, E2E, Security)
- [ ] Coverage ≥ 80% auf `src/lib/`
- [ ] `npx next build` bleibt sauber

## Technische Details

### Vitest Setup
```bash
npm install -D vitest @vitest/coverage-v8
```

`vitest.config.ts`:
- `environment: 'node'`
- `include: ['src/**/*.test.ts']`
- `coverage.provider: 'v8'`
- `coverage.thresholds: { lines: 80, branches: 80, functions: 80 }`

### Pre-commit Hooks
```bash
npm install -D simple-git-hooks lint-staged
```

In `package.json`:
```json
{
  "simple-git-hooks": {
    "pre-commit": "npx lint-staged",
    "pre-push": "npx vitest run"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### GitHub Actions (`.github/workflows/ci.yml`)
4 parallele Jobs: Lint+Types (~30-45s), Unit Tests + Coverage (~30-60s), E2E (~1.5-2.5min), Security (~30s)

### Test-Datei-Struktur
```
src/lib/__tests__/
├── validations.test.ts
├── review-router.test.ts
├── utils.test.ts
├── themes.test.ts
└── qr.test.ts
```

## Abhängigkeiten
- PP-013 (Research, done)
- Kann parallel zu PP-014 laufen

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus PP-013 Research abgeleitet |
