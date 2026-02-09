# PraxisPuls – Projekt-Status

**Stand:** 2026-02-09
**Build:** `npm run build` kompiliert fehlerfrei
**Dev Server:** `npm run dev` lauffähig
**Git:** Initialisiert, Branch `main`, 6 Commits
**Node:** Next.js 15.5.12, TypeScript strict

---

## Feature-Status

### Fertig (100%)
| Feature | Dateien |
|---------|---------|
| Auth (Login, Register, Logout, Middleware) | `(auth)/login`, `(auth)/register`, `api/auth/*`, `middleware.ts` |
| Onboarding (3-Step Wizard) | `(dashboard)/onboarding/page.tsx` |
| Survey-Flow (Public, Mobile-first) | `s/[slug]/page.tsx`, `components/survey/survey-form.tsx` |
| Session-Deduplizierung (SHA-256) | `survey-form.tsx` (Client), `api/public/responses` (Server) |
| Danke-Seite (Promoter/Passive/Detractor) | `s/[slug]/danke/page.tsx` |
| Review-Router (NPS → Google/Internal) | `lib/review-router.ts` |
| Dashboard Übersicht (KPIs + Kategorien) | `(dashboard)/dashboard/page.tsx` |
| NPS-Trend-Chart (Recharts) | `components/dashboard/nps-chart.tsx` |
| Response-Liste | `(dashboard)/dashboard/responses/page.tsx` |
| Alerts-Seite (lesen, markieren, Notizen) | `(dashboard)/dashboard/alerts/page.tsx`, `components/dashboard/alert-item.tsx` |
| QR-Code Generator (PNG + PDF) | `(dashboard)/dashboard/qr-codes/page.tsx`, `lib/qr.ts`, `lib/qr-pdf.ts` |
| Einstellungen | `(dashboard)/dashboard/settings/page.tsx` |
| Billing-Seite (3 Pläne, Checkout, Portal) | `(dashboard)/dashboard/billing/page.tsx` |
| Stripe Webhook (alle Events) | `api/webhooks/stripe/route.ts` |
| Stripe Checkout + Portal | `api/billing/checkout/route.ts`, `api/billing/portal/route.ts` |
| Plan-Limits (Free=30, Starter=200, Pro=∞) | `api/public/responses/route.ts` |
| Alert-E-Mails (Detractor via Resend) | `lib/email.ts`, `api/public/responses/route.ts` |
| Welcome-E-Mail (nach Bestätigung) | `api/auth/callback/route.ts` |
| Upgrade-Reminder (bei 80%/100% Limit) | `api/public/responses/route.ts` |
| Google Places API + Autocomplete | `lib/google.ts`, `api/google/places/route.ts`, `components/dashboard/google-places-search.tsx` |
| Landing Page | `(marketing)/page.tsx` |
| Legal Pages (Impressum, Datenschutz, AGB) | `(marketing)/impressum`, `datenschutz`, `agb` |
| SEO (Meta, OG, Sitemap, Robots) | `layout.tsx`, `sitemap.ts`, `robots.ts` |
| DB Schema (Drizzle ORM, 4 Tabellen) | `lib/db/schema.ts` |
| Drizzle Migration generiert | `drizzle/0000_damp_morlocks.sql` |
| Zod Validierungen | `lib/validations.ts` |

### Offen
| Feature | Priorität | Notizen |
|---------|-----------|---------|
| ~~Supabase DB verbinden + Migration pushen~~ | ✅ | Erledigt – 4 Tabellen live |
| Legal Pages: eigene Daten einsetzen | P1 | Platzhalter [Name], [Adresse] ersetzen |
| ~~QR-Code PDF-Druckvorlagen~~ | ✅ | A4 Poster + A6 Aufsteller implementiert |
| ~~Google Places Autocomplete in Settings-UI~~ | ✅ | Autocomplete-Suche in Einstellungen integriert |
| Logo-Upload (Onboarding + Settings) | P2 | Supabase Storage nötig |
| Monitoring (Sentry, Plausible) | P2 | Vor Go-Live |
| E2E Tests (Playwright) | P2 | Vor Go-Live |

---

## Nächste Schritte
1. ~~**Supabase DB**: Projekt aktivieren, `npm run db:push` ausführen~~ ✅
2. ~~**Manuelles Testing**: Register → Onboarding → Survey → Dashboard Flow~~ ✅ (alle Routes getestet)
3. **Legal Pages**: Eigene Daten einsetzen
4. **Monitoring**: Sentry + Plausible einrichten
5. **Beta-Test**: 3-5 Praxen onboarden
