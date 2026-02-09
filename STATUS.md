# PraxisPuls – Projekt-Status

**Stand:** 2026-02-09
**Build:** `npm run build` kompiliert fehlerfrei
**Dev Server:** `npm run dev` lauffähig
**Git:** Initialisiert, Branch `main`, 3 Commits
**Node:** Next.js 15.5.12, TypeScript strict

---

## Feature-Status

### Fertig (100%)
| Feature | Dateien |
|---------|---------|
| Auth (Login, Register, Logout, Middleware) | `(auth)/login`, `(auth)/register`, `api/auth/*`, `middleware.ts` |
| Onboarding (3-Step Wizard) | `(dashboard)/onboarding/page.tsx` |
| Survey-Flow (Public, Mobile-first) | `s/[slug]/page.tsx`, `components/survey/survey-form.tsx` |
| Danke-Seite (Promoter/Passive/Detractor) | `s/[slug]/danke/page.tsx` |
| Review-Router (NPS → Google/Internal) | `lib/review-router.ts` |
| Dashboard Übersicht (KPIs + Kategorien) | `(dashboard)/dashboard/page.tsx` |
| NPS-Trend-Chart (Recharts) | `components/dashboard/nps-chart.tsx` |
| Response-Liste | `(dashboard)/dashboard/responses/page.tsx` |
| Alerts-Seite (lesen, markieren, Notizen) | `(dashboard)/dashboard/alerts/page.tsx`, `components/dashboard/alert-item.tsx` |
| QR-Code Generator (PNG) | `(dashboard)/dashboard/qr-codes/page.tsx`, `lib/qr.ts` |
| Einstellungen | `(dashboard)/dashboard/settings/page.tsx` |
| Billing-Seite (3 Pläne, Checkout, Portal) | `(dashboard)/dashboard/billing/page.tsx` |
| Stripe Webhook (alle Events) | `api/webhooks/stripe/route.ts` |
| Stripe Checkout + Portal | `api/billing/checkout/route.ts`, `api/billing/portal/route.ts` |
| Plan-Limits (Free=30, Starter=200, Pro=∞) | `api/public/responses/route.ts` |
| Alert-E-Mails (Detractor via Resend) | `lib/email.ts`, `api/public/responses/route.ts` |
| Welcome-E-Mail (nach Bestätigung) | `api/auth/callback/route.ts` |
| Upgrade-Reminder (bei 80%/100% Limit) | `api/public/responses/route.ts` |
| Google Places API | `lib/google.ts`, `api/google/places/route.ts` |
| Landing Page | `(marketing)/page.tsx` |
| DB Schema (Drizzle ORM, 4 Tabellen) | `lib/db/schema.ts` |
| Zod Validierungen | `lib/validations.ts` |

### Offen
| Feature | Priorität | Notizen |
|---------|-----------|---------|
| Drizzle Migration ausführen | P0 | `npm run db:push` gegen Supabase nötig |
| Legal Pages (Impressum, Datenschutz, AGB) | P1 | Platzhalter-Content, Anwalt nötig |
| QR-Code PDF-Druckvorlagen | P2 | A4 Poster, A6 Aufsteller – "kommt bald" |
| Google Places Autocomplete in Settings-UI | P2 | Backend fertig, Frontend-Integration fehlt |
| Logo-Upload (Onboarding + Settings) | P2 | Supabase Storage nötig |
| SEO (Meta, OG, Sitemap) | P2 | Vor Go-Live |
| Monitoring (Sentry, Plausible) | P2 | Vor Go-Live |
| E2E Tests (Playwright) | P2 | Vor Go-Live |
| Session-Deduplizierung (24h Cookie) | P3 | Survey-Spam verhindern |

---

## API Routes

| Route | Methode | Auth | Status |
|-------|---------|------|--------|
| `/api/auth/callback` | GET | — | Fertig |
| `/api/auth/confirm` | GET | — | Fertig |
| `/api/practice` | GET/POST/PUT | Auth | Fertig |
| `/api/practice/qr-code` | GET | Auth | Fertig |
| `/api/google/places` | GET | Auth | Fertig |
| `/api/billing/checkout` | POST | Auth | Fertig |
| `/api/billing/portal` | POST | Auth | Fertig |
| `/api/webhooks/stripe` | POST | Signature | Fertig |
| `/api/public/responses` | POST | — | Fertig (+ Limits) |
| `/api/public/track-click` | POST | — | Fertig |

## Dashboard Pages

| Route | Status |
|-------|--------|
| `/dashboard` | Fertig (KPIs + NPS-Chart + Kategorien) |
| `/dashboard/responses` | Fertig |
| `/dashboard/alerts` | Fertig |
| `/dashboard/qr-codes` | Fertig |
| `/dashboard/settings` | Fertig |
| `/dashboard/billing` | Fertig (3 Pläne + Checkout + Portal) |

---

## Nächste Schritte
1. **Supabase DB**: `npm run db:push` ausführen, RLS Policies einrichten
2. **Manuelles Testing**: Gesamten Flow durchspielen (Register → Onboarding → Survey → Dashboard)
3. **Legal Pages**: Impressum/Datenschutz mit echten Daten füllen, AGB vom Anwalt
4. **SEO + Monitoring**: Meta Tags, Sitemap, Sentry, Plausible
5. **Beta-Test**: 3-5 Praxen onboarden
