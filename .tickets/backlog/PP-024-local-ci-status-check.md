---
id: PP-024
type: chore
title: "Lokaler CI-Status-Check via gh CLI + npm Script"
status: backlog
priority: low
sprint: launch-prep
parent: PP-019
branch: ticket/PP-024-ci-status-local
created: 2026-02-11
updated: 2026-02-11
estimate: 30m
actual: ""
tags: [dx, ci, gh-cli]
---

# PP-024: Lokaler CI-Status-Check via gh CLI + npm Script

## Beschreibung
Deferred aus PP-019: Möglichkeit, CI-Ergebnisse lokal abzufragen ohne GitHub UI zu öffnen.

- `gh` CLI ist bereits installiert (via Chocolatey)
- npm Script `ci:status` soll `gh run list` + `gh run view` wrappen

## Akzeptanzkriterien
- [ ] `npm run ci:status` zeigt letzten CI-Run-Status (Jobs + Conclusion)
- [ ] `npm run ci:log <run-id>` zeigt Log eines spezifischen Runs (optional)
- [ ] Dokumentation in README oder CONTRIBUTING.md

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Deferred aus PP-019 (Lokaler Check) |
