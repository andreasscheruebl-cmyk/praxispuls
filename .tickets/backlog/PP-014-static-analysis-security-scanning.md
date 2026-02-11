---
id: PP-014
type: task
title: "Static Analysis + Security Scanning Setup"
status: backlog
priority: high
sprint: launch-prep
parent: PP-013
branch: ticket/PP-014-static-analysis
created: 2026-02-11
updated: 2026-02-11
estimate: 2h
actual: ""
tags: [testing, security, eslint, dx]
---

# PP-014: Static Analysis + Security Scanning Setup

## Beschreibung
ESLint-Plugins für Code-Qualität und Security installieren, Dead-Code-Detection einrichten, Secrets-Scanning konfigurieren. Bildet die unterste Ebene der Testing Trophy (Static Analysis).

Basierend auf PP-013 Research, Phase 1.

## Akzeptanzkriterien
- [ ] `eslint-plugin-sonarjs` installiert + konfiguriert (Cognitive Complexity ≤ 15)
- [ ] `eslint-plugin-security` installiert + konfiguriert (14 Security-Regeln aktiv)
- [ ] ESLint Complexity-Regeln aktiv (`complexity: 10`, `max-depth: 4`, `max-lines-per-function: 50`, `max-params: 4`)
- [ ] `knip` installiert + läuft fehlerfrei (Dead Code, Unused Exports/Dependencies)
- [ ] `gitleaks` als Pre-commit Hook konfiguriert (Secrets in Commits verhindern)
- [ ] `truffleHog` in CI-Workflow (GitHub Actions) integriert
- [ ] Socket.dev GitHub App installiert (Supply Chain Security)
- [ ] `npm audit` in CI-Workflow integriert
- [ ] `next lint` läuft fehlerfrei mit allen neuen Plugins
- [ ] `npx next build` bleibt sauber

## Technische Details

### ESLint-Plugins
```bash
npm install -D eslint-plugin-sonarjs eslint-plugin-security
```

Konfiguration in `eslint.config.mjs`:
- sonarjs: `cognitive-complexity: 15`, duplication rules
- security: alle 14 Regeln als `warn` (zunächst), nach Audit auf `error`

### Dead Code
```bash
npm install -D knip
```
Script: `"knip": "knip"` in package.json

### Secrets Scanning
- Pre-commit: `gitleaks protect --staged` via simple-git-hooks
- CI: `truffleHog filesystem --since-commit HEAD~1 .`

### Supply Chain
- Socket.dev: GitHub App installieren (1-Klick)
- `npm audit --audit-level=high` als CI-Step

## Abhängigkeiten
- PP-013 (Research, done)
- PP-015 benötigt dieses Ticket NICHT — kann parallel laufen

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus PP-013 Research abgeleitet |
