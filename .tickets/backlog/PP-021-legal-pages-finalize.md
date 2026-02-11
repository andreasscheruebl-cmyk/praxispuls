---
id: PP-021
type: task
title: "Legal Pages finalisieren (Impressum, Datenschutz, AGB)"
status: backlog
priority: high
sprint: launch-prep
parent: ""
branch: ticket/PP-021-legal-pages
created: 2026-02-11
updated: 2026-02-11
estimate: 3h
actual: ""
tags: [legal, dsgvo, impressum, datenschutz, agb, launch]
---

# PP-021: Legal Pages finalisieren (Impressum, Datenschutz, AGB)

## Beschreibung
Die Legal Pages existieren als Grundgerüst, müssen aber für den Launch mit korrekten, vollständigen Inhalten befüllt werden:
- **Impressum**: Betreiberangaben gemäß §5 TMG
- **Datenschutzerklärung**: DSGVO-konform, speziell für SaaS mit Patientenumfragen
- **AGB**: Enthält bereits AVV (§8), muss vollständig geprüft werden

## Schritte
- [ ] Impressum: Betreiberangaben eintragen (Name, Adresse, Kontakt, USt-IdNr.)
- [ ] Datenschutzerklärung: Prüfen auf Vollständigkeit (Supabase, Stripe, Resend, Vercel, Plausible, Google Places API)
- [ ] Datenschutz: Cookie-Hinweis (nur Auth-Cookie, kein Tracking)
- [ ] Datenschutz: Auftragsverarbeiter auflisten
- [ ] AGB: AVV-Abschnitt (§8) prüfen
- [ ] AGB: Haftung, Kündigung, Preisänderungen prüfen
- [ ] Alle 3 Seiten: Links im Footer verifizieren
- [ ] Alle 3 Seiten: Mobile-Darstellung prüfen

## Akzeptanzkriterien
- [ ] Impressum enthält alle Pflichtangaben nach §5 TMG
- [ ] Datenschutzerklärung nennt alle Auftragsverarbeiter (Supabase, Stripe, Resend, Vercel)
- [ ] AGB enthält AVV (§8) für Zahnarztpraxen
- [ ] Alle 3 Seiten sind von /impressum, /datenschutz, /agb erreichbar
- [ ] Footer-Links funktionieren auf allen Seiten
- [ ] Mobile-Darstellung korrekt

## Hinweise
- Texte auf Deutsch (Siezen)
- Kein Anwalt nötig für MVP, aber DSGVO-Grundanforderungen müssen erfüllt sein
- AVV ist besonders wichtig weil Patientendaten (wenn auch anonym) verarbeitet werden

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-11 | Ticket erstellt | Aus CLAUDE.md Priorität #3 |
