---
id: PP-025
type: chore
title: "Playwright HTML Report auf GitHub Pages publizieren"
status: backlog
priority: low
sprint: launch-prep
parent: PP-019
branch: ticket/PP-025-playwright-pages
created: 2026-02-11
updated: 2026-02-11
estimate: 1h
actual: ""
tags: [ci, e2e, playwright, github-pages, dx]
---

# PP-025: Playwright HTML Report auf GitHub Pages publizieren

## Beschreibung
Deferred aus PP-019 (Mittelfristig): Playwright generiert bereits HTML-Reports (als CI-Artifact hochgeladen). Diese sollen automatisch auf GitHub Pages deployed werden, damit E2E-Ergebnisse ohne Artifact-Download einsehbar sind.

## Akzeptanzkriterien
- [ ] GitHub Pages aktiviert für das Repository
- [ ] CI-Workflow deployed Playwright-Report nach jedem Run auf GitHub Pages
- [ ] Report unter `https://andreasscheruebl-cmyk.github.io/praxispuls/` erreichbar
- [ ] Nur der letzte Report wird angezeigt (kein History-Bloat)

## Technische Details
- GitHub Actions: `actions/deploy-pages` oder `peaceiris/actions-gh-pages`
- Playwright Report liegt in `playwright-report/`
- Nur deployen wenn E2E-Job gelaufen ist

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Deferred aus PP-019 (Mittelfristig) |
