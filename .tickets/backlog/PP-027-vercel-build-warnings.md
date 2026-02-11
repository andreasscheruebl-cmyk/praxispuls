---
id: PP-027
type: bug
title: "Vercel Build Warnings – Sentry Auth Token + Telemetrie"
status: backlog
priority: high
sprint: launch-prep
parent: PP-022
branch: ticket/PP-027-build-warnings
created: 2026-02-11
updated: 2026-02-11
estimate: 1h
actual: ""
tags: [sentry, build, vercel, telemetry, dx]
---

# PP-027: Vercel Build Warnings – Sentry Auth Token + Telemetrie

## Beschreibung
Vercel-Build zeigt 4 Warnings von `@sentry/nextjs`:

```
[@sentry/nextjs - Node.js] Info: Sending telemetry data on issues and performance to Sentry. To disable telemetry, set `options.telemetry` to `false`.
[@sentry/nextjs - Node.js] Warning: No auth token provided. Will not create release. Please set the `authToken` option.
[@sentry/nextjs - Node.js] Warning: No auth token provided. Will not upload source maps. Please set the `authToken` option.
[@sentry/nextjs - Edge] Info: Sending telemetry data on issues and performance to Sentry. To disable telemetry, set `options.telemetry` to `false`.
```

Auch: `clientTraceMetadata` Experiment aktiv (Next.js 15.5.12).

## Akzeptanzkriterien

### Sentry Warnings (MUST)
- [ ] Sentry Auth Token als Env-Var in Vercel setzen (`SENTRY_AUTH_TOKEN`) ODER Sentry-Build-Plugin deaktivieren wenn kein Token vorhanden
- [ ] Keine "No auth token" Warnings mehr im Build-Log
- [ ] Source Maps werden korrekt hochgeladen (wenn Sentry aktiv)

### Telemetrie (MUST)
- [ ] Sentry-Telemetrie deaktivieren (`telemetry: false` in Sentry-Config)

### Experiment Warning (SHOULD)
- [ ] `clientTraceMetadata` Experiment prüfen – absichtlich aktiviert oder unbeabsichtigt?

### Sauberer Build (MUST)
- [ ] Vercel-Build zeigt keine Warnings mehr (außer ESLint-Warnings)

## Technische Details

### Option A: Sentry Auth Token setzen
1. Sentry-Projekt erstellen (falls noch nicht vorhanden)
2. Auth Token generieren: https://sentry.io/settings/auth-tokens/
3. In Vercel Env-Vars setzen: `SENTRY_AUTH_TOKEN=<token>`
4. Source Maps werden automatisch hochgeladen

### Option B: Sentry-Build-Plugin conditional machen
```typescript
// sentry.client.config.ts / sentry.server.config.ts
Sentry.init({
  telemetry: false,
  // ...
});
```

```typescript
// next.config.ts – withSentryConfig nur wenn Token vorhanden
const config = process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(nextConfig, sentryOptions)
  : nextConfig;
```

## Abhängigkeiten
- PP-022 (backlog) – SEO + Monitoring (Sentry Setup gehört dazu)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Vercel Build Warnings aus Andi-Report |
