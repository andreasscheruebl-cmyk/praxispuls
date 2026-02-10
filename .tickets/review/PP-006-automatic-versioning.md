---
id: PP-006
type: research
title: "Konzept: Automatische Versionierung mit Sprint- und Ticket-Integration"
status: review
priority: medium
sprint: survey-engine
parent: ""
branch: ""
created: 2026-02-11
updated: 2026-02-11
estimate: ""
actual: ""
tags: [dx, versioning, ci, tickets]
---

# PP-006: Konzept – Automatische Versionierung mit Sprint- und Ticket-Integration

## Fragestellung
Wie kann eine automatische Versionierung im Projekt eingeführt werden, die mit dem bestehenden Sprint- und Ticket-System zusammenarbeitet?

Konkret zu klären:
- Welches Versionsschema? (SemVer, CalVer, Sprint-basiert?)
- Wie wird die Version automatisch hochgezählt? (Git Tags, CI, Commit-Hooks?)
- Wie hängen Sprints, Tickets und Versionen zusammen?
- Wo wird die aktuelle Version angezeigt? (App-Footer, Dashboard, API?)
- Wie wird ein Changelog generiert? (Aus Commits, Tickets, oder beides?)

## Kontext
- Solo-Dev Projekt — Lösung muss einfach und wartbar sein
- Conventional Commits sind bereits Standard (`feat:`, `fix:`, `chore:` etc.)
- TicketOps mit Sprint-Zyklen (foundation, survey-engine, dashboard, ...)
- Vercel Deployment (kein klassisches CI/CD mit Jenkins/GitHub Actions nötig)
- Ziel: Nachvollziehbarkeit welche Features/Fixes in welcher Version sind, Changelog für Beta-Tester
- **Ist-Zustand:** `package.json` version `0.1.0`, keine Git Tags, 34 Commits, kein CHANGELOG.md

## Recherche-Ergebnisse

### Option A: `standard-version`
- Lokaler CLI, liest Conventional Commits, bumpt package.json, generiert CHANGELOG.md, erstellt Git Tag
- Pro: Einfach, kein CI nötig, zero config
- Contra: **DEPRECATED seit Mai 2022**, keine Releases seit v9.5.0. Nachfolger: `commit-and-tag-version`

### Option B: `release-please` (Google)
- GitHub Action, öffnet automatisch "Release PR" mit Version-Bump + Changelog
- Pro: Elegant, aktiv maintained (Google), v16, gute Vercel-Integration
- Contra: **Braucht GitHub Actions**, Release-PR-Workflow = unnötige Komplexität für Solo-Dev

### Option C: `@changesets/cli` (Atlassian)
- Manuell Changeset-Dateien schreiben, bei Release konsumieren → Version + Changelog
- Pro: Aktiv maintained, Standard für Libraries/Monorepos (Radix, shadcn, Turborepo)
- Contra: **Ignoriert Conventional Commits komplett**, doppelter Aufwand, falsche Paradigma für SaaS-App

### Option D: `semantic-release`
- Voll-automatisiertes CI-Tool, analysiert Commits, erstellt Tag + GitHub Release
- Pro: Gold-Standard für automatisiertes SemVer, aktiv maintained (v24)
- Contra: **Braucht CI + Tokens + 4-6 Plugins**, nimmt Versionskontrolle weg, overengineered für Solo-Dev

### Option E: `commit-and-tag-version` (Nachfolger von standard-version)
- Direkter Fork von standard-version, identisches Verhalten, aktiv maintained (v12.x)
- Lokaler CLI: `npx commit-and-tag-version` → bumpt package.json + CHANGELOG.md + Git Tag
- Pro: **Kein CI nötig**, zero config, nutzt bestehende Conventional Commits, du bestimmst wann released wird
- Contra: Manueller Schritt (aber bewusst gewollt für Solo-Dev)

## Vergleichstabelle

| Kriterium | standard-version | release-please | @changesets/cli | semantic-release | **commit-and-tag-version** |
|---|---|---|---|---|---|
| Status | DEPRECATED | Active (Google) | Active (Atlassian) | Active | **Active** |
| Läuft lokal | Ja | Nein (CI) | Ja | Nein (CI) | **Ja** |
| Braucht GitHub Actions | Nein | Ja | Nein | Ja | **Nein** |
| Nutzt Conventional Commits | Ja | Ja | Nein | Ja | **Ja** |
| Auto-Changelog | Ja | Ja | Ja (aus Changesets) | Ja | **Ja** |
| Config-Aufwand | Minimal | Mittel | Mittel | Hoch | **Minimal** |
| npm-Publish-Fokus | Nein | Optional | Ja | Ja | **Nein** |
| Overhead Solo-Dev | — | Mittel | Mittel (falsche Paradigma) | Hoch | **Sehr gering** |

## Version in der App (Next.js)

Kein extra Tooling nötig. In `next.config.ts`:
```ts
const { version } = JSON.parse(readFileSync("./package.json", "utf8"));
env: {
  NEXT_PUBLIC_APP_VERSION: version,
  NEXT_PUBLIC_GIT_HASH: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
}
```
Ergibt z.B. `v0.3.0 (a1b2c3d)` im Dashboard-Footer. Zero Dependencies.

## Sprint-Integration

- Am **Sprint-Ende**: `npm run release` → neue Version enthält alle Commits des Sprints
- CHANGELOG.md gruppiert automatisch nach `feat`, `fix`, etc.
- Git Tag markiert den Sprint-Abschluss (z.B. `v0.2.0` = survey-engine done)
- Ticket-IDs in Commit-Messages (`[PP-XXX]`) erscheinen im Changelog

## Empfehlung: `commit-and-tag-version`

**Warum:**
1. Nutzt bestehende Conventional Commits — kein doppelter Aufwand
2. Kein CI nötig — ein Befehl lokal, fertig
3. Zero Config — funktioniert sofort out of the box
4. Du bestimmst wann released wird — kein Bot, kein automatischer PR
5. CHANGELOG.md wird automatisch generiert — gruppiert nach feat, fix, etc.
6. Aktiv maintained — offizieller Nachfolger von standard-version

**Setup:**
```json
{
  "scripts": {
    "release": "commit-and-tag-version",
    "release:minor": "commit-and-tag-version --release-as minor",
    "release:major": "commit-and-tag-version --release-as major"
  }
}
```

**Workflow:**
```bash
npm run release          # feat→minor, fix→patch (automatisch)
git push --follow-tags   # Pusht Version-Commit + Tag → Vercel deployed
```

**Optionale `.versionrc.json`:**
```json
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "perf", "section": "Performance" },
    { "type": "refactor", "hidden": true },
    { "type": "chore", "hidden": true },
    { "type": "docs", "hidden": true },
    { "type": "test", "hidden": true }
  ]
}
```

## Quellen
- https://github.com/absolute-version/commit-and-tag-version
- https://github.com/conventional-changelog/standard-version (deprecated)
- https://github.com/googleapis/release-please
- https://github.com/changesets/changesets
- https://github.com/semantic-release/semantic-release

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Research-Ticket für automatische Versionierung |
| 2026-02-11 | Aktiviert | Status backlog → active |
| 2026-02-11 | Recherche | Ist-Zustand geprüft: package.json v0.1.0, keine Tags, 34 Commits, kein CHANGELOG |
| 2026-02-11 | Recherche | 5 Tools verglichen: standard-version (deprecated), release-please (CI-only), changesets (falsche Paradigma), semantic-release (overengineered), commit-and-tag-version (passt) |
| 2026-02-11 | Recherche | Next.js Version-Injection via next.config.ts env-Var evaluiert (zero deps) |
| 2026-02-11 | Empfehlung | `commit-and-tag-version` — minimal overhead, nutzt Conventional Commits, kein CI nötig |
