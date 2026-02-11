---
id: PP-018
type: task
title: "Test-Polish: A11y, Visual Regression, Performance, Monitoring"
status: backlog
priority: medium
sprint: launch-prep
parent: PP-013
branch: ticket/PP-018-test-polish
created: 2026-02-11
updated: 2026-02-11
estimate: 10h
actual: ""
tags: [testing, a11y, visual-regression, performance, monitoring]
---

# PP-018: Test-Polish — A11y, Visual Regression, Performance, Monitoring

## Beschreibung
Nicht-funktionale Tests und Quality-Tooling: Accessibility-Tests, Visual Regression, Performance-Budgets, Code-Quality-Dashboard, Bundle-Analyse, DAST-Scan, Uptime-Monitoring.

Basierend auf PP-013 Research, Phase 3.

## Akzeptanzkriterien

### Code Quality
- [ ] `eslint-plugin-unicorn` installiert + konfiguriert
- [ ] SonarCloud Free Tier eingerichtet (PR-Dekoration)
- [ ] `hashicorp/nextjs-bundle-analysis` in CI (Bundle-Size-Budgets)
- [ ] Codecov Integration (Coverage-Tracking in PRs)

### Accessibility
- [ ] `@axe-core/playwright` installiert
- [ ] A11y-Tests auf: Survey-Page, Dashboard, Login, Landing Page (WCAG 2.2 AA)
- [ ] Touch-Target Validierung (≥ 44×44px) auf Survey-Page

### Visual Regression
- [ ] Playwright `toHaveScreenshot()` für Survey (beide Themes, mobile + desktop)
- [ ] Visual Regression für Landing Page
- [ ] PDF-Output Visual Regression (PDF → PNG → Screenshot-Vergleich)

### Performance
- [ ] Lighthouse CI in GitHub Actions (Performance-Budget: LCP < 2s auf Survey)
- [ ] Survey-Ladezeit < 2s validiert (Playwright `domcontentloaded` Timing)

### Security (DAST)
- [ ] OWASP ZAP Baseline Scan dokumentiert (quartalsweise manuell)
- [ ] Nuclei Community Templates auf Staging getestet

### Monitoring
- [ ] Uptime-Monitoring eingerichtet (BetterStack oder Checkly Free Tier)
- [ ] Smoke-Tests nach Vercel Deploy (health + SSR check)
- [ ] MSW v2 für externe API-Mocks (Stripe, Supabase) in Unit/Integration Tests

### Allgemein
- [ ] Alle Tests grün in CI
- [ ] `npx next build` bleibt sauber

## Technische Details

### A11y
```bash
npm install -D @axe-core/playwright
```

```typescript
import AxeBuilder from '@axe-core/playwright';
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toEqual([]);
```

### Visual Regression
```typescript
await expect(page).toHaveScreenshot('survey-standard-mobile.png', {
  maxDiffPixelRatio: 0.01,
});
```

### Lighthouse CI
```yaml
- uses: treosh/lighthouse-ci-action@v12
  with:
    budgetPath: ./budget.json
    urls: |
      http://localhost:3000/s/test-praxis
```

### OWASP ZAP
Manuell quartalsweise:
```bash
docker run -t zaproxy/zap-stable zap-baseline.py -t https://staging.praxispuls.de
```

## Abhängigkeiten
- PP-015 (Vitest Setup) — muss zuerst laufen
- PP-016 (E2E Setup) — Playwright-Infrastruktur muss stehen

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus PP-013 Research abgeleitet |
