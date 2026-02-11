---
id: PP-022
type: task
title: "SEO + Monitoring (Meta Tags, Sentry, Plausible)"
status: backlog
priority: high
sprint: launch-prep
parent: ""
branch: ticket/PP-022-seo-monitoring
created: 2026-02-11
updated: 2026-02-11
estimate: 4h
actual: ""
tags: [seo, monitoring, sentry, plausible, meta-tags, og-tags, launch]
---

# PP-022: SEO + Monitoring (Meta Tags, Sentry, Plausible)

## Beschreibung
Für den Launch müssen SEO-Basics und Monitoring eingerichtet werden:
- **SEO**: Meta Tags, Open Graph Tags, strukturierte Daten, Sitemap, robots.txt
- **Error Monitoring**: Sentry für Client + Server Errors
- **Analytics**: Plausible (DSGVO-konform, kein Cookie-Banner nötig)

## SEO

### Schritte
- [ ] Meta Tags auf allen öffentlichen Seiten (title, description)
- [ ] Open Graph Tags (og:title, og:description, og:image)
- [ ] Twitter Card Tags
- [ ] Canonical URLs
- [ ] Sitemap.xml prüfen (existiert bereits via route.ts)
- [ ] robots.txt prüfen (existiert bereits via route.ts)
- [ ] Strukturierte Daten (JSON-LD) für Landing Page (SoftwareApplication)
- [ ] `<h1>` auf jeder Seite vorhanden

### Akzeptanzkriterien SEO
- [ ] Alle öffentlichen Seiten haben Meta Title + Description
- [ ] OG-Tags auf Landing, Impressum, Datenschutz, AGB
- [ ] Sitemap enthält alle öffentlichen URLs
- [ ] robots.txt blockiert /dashboard/

## Monitoring

### Schritte
- [ ] Sentry-Account erstellen (Free Tier)
- [ ] `@sentry/nextjs` installieren + konfigurieren
- [ ] Sentry: Client-Errors capturen
- [ ] Sentry: Server-Errors capturen (API Routes + Server Actions)
- [ ] Sentry: Source Maps hochladen (Vercel Integration)
- [ ] Plausible-Account erstellen
- [ ] Plausible-Script einbinden (Next.js Script component)
- [ ] Plausible: Custom Events für Survey-Completion, Google-Review-Click

### Akzeptanzkriterien Monitoring
- [ ] Sentry fängt Client + Server Errors
- [ ] Plausible zeigt Pageviews
- [ ] Kein Cookie-Banner nötig (Plausible ist cookieless)
- [ ] Performance-Impact < 50ms auf Survey-Seite

## Hinweise
- Plausible statt Google Analytics wegen DSGVO (kein Cookie, kein Consent nötig)
- Sentry Free Tier reicht für MVP (5K errors/month)
- BetterStack (Uptime) ist optional, kann später kommen

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus CLAUDE.md Priorität #4 |
