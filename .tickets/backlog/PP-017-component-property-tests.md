---
id: PP-017
type: task
title: "Component Tests + Property-Based + Projekt-spezifische Tests"
status: backlog
priority: medium
sprint: launch-prep
parent: PP-013
branch: ticket/PP-017-component-tests
created: 2026-02-11
updated: 2026-02-11
estimate: 8h
actual: ""
tags: [testing, component, property-based, vitest-browser]
---

# PP-017: Component Tests + Property-Based + Projekt-spezifische Tests

## Beschreibung
Vitest Browser Mode für isolierte UI-Component-Tests einrichten, Property-Based Testing mit fast-check für Zod-Schemas und Router-Logic, QR-Code-Verifizierung und Email-Template-Tests.

Basierend auf PP-013 Research, Phase 2.

## Akzeptanzkriterien

### Component Tests (Vitest Browser Mode)
- [ ] `@vitest/browser-playwright` + `vitest-browser-react` installiert + konfiguriert
- [ ] Component Test: `survey-form.tsx` — NPS-Slider Interaktion, Rating-Circles, Submit-Flow
- [ ] Component Test: `nps-chart.tsx` — Recharts rendert korrekt mit Testdaten
- [ ] Component Test: `mobile-bottom-tabs.tsx` — Tab-Wechsel, Active-State
- [ ] Component Test: `google-places-search.tsx` — Autocomplete, Auswahl
- [ ] Component Test: `logo-upload.tsx` — Datei-Upload, Preview

### Property-Based Tests (fast-check)
- [ ] `fast-check` installiert
- [ ] Property-Test: `surveyResponseSchema` — tausende valide/invalide Inputs
- [ ] Property-Test: `routeByNps()` — alle NPS × Threshold × GooglePlaceId × Enabled Kombinationen
- [ ] Property-Test: `loginSchema`, `practiceUpdateSchema` — Edge-Cases

### Projekt-spezifische Tests
- [ ] QR Code URL-Korrektheit: QR generieren → mit jsqr decodieren → URL prüfen
- [ ] Email Template Tests: HTML enthält erwartete Werte, Links korrekt, Platzhalter ersetzt
- [ ] `license-report` in CI integriert (keine AGPL/GPL-3.0 in Dependencies)

### Allgemein
- [ ] Alle Tests grün in CI
- [ ] `npx next build` bleibt sauber

## Technische Details

### Vitest Browser Mode
```bash
npm install -D @vitest/browser-playwright vitest-browser-react
```

In `vitest.config.ts`:
```typescript
{
  browser: {
    enabled: true,
    provider: 'playwright',
    instances: [{ browser: 'chromium' }]
  }
}
```

### fast-check
```bash
npm install -D fast-check
```

```typescript
import fc from 'fast-check';
fc.assert(fc.property(fc.integer({ min: 0, max: 10 }), (nps) => {
  const result = routeByNps(nps, 'ChIJ...', 9, true);
  return result.category !== undefined;
}));
```

### QR Code Verifizierung
```bash
npm install -D jsqr
```

## Abhängigkeiten
- PP-015 (Vitest Setup) — muss zuerst laufen
- PP-016 (Integration/E2E) — unabhängig, kann parallel

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus PP-013 Research abgeleitet |
