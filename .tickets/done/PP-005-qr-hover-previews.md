---
id: PP-005
type: bug
title: "QR-Codes: Hover-Previews zu klein und zeigen nicht das richtige PDF"
status: done
priority: medium
sprint: foundation
branch: ticket/PP-005-qr-hover-previews
created: 2026-02-10
updated: 2026-02-10
---

# PP-005: QR-Codes Hover-Previews zu klein und zeigen nicht das richtige PDF

## Fehlerbeschreibung
Auf der QR-Codes Seite im Dashboard sind die Hover-Previews der PDF-Designs winzige Mockups (~44x64px). Sie zeigen nicht das tatsächliche PDF-Design und sind zu klein um Details zu erkennen. Alle 4 Designs pro Modus (Light/Dark/Infographic) zeigen dieselbe generische Mini-Vorschau.

## Analyse
- **Ist-Zustand:** `src/app/(dashboard)/dashboard/qr-codes/page.tsx` enthält drei statische Mini-Preview-Komponenten (`LightMiniPreview`, `DarkMiniPreview`, `InfographicMiniPreview`) die generische Mockups rendern — nicht das tatsächliche PDF.
- **Problem:** Alle 4 Designs eines Modus zeigen dieselbe Vorschau. Man kann nicht erkennen ob man A4 Poster, A6 Aufsteller, A5 Tischaufsteller oder Visitenkarte bekommt.
- **PDF-Generation:** 12 Generator-Funktionen existieren in `src/lib/qr-pdf.ts`, werden aber nur beim Download aufgerufen (in `downloadPdf()`).
- **Ansatz:** On-hover das echte PDF generieren, als Blob-URL cachen, und in einem iframe anzeigen.

## Lösungsansatz
1. `generatePdfBlob(type, config)` Helper extrahieren (kapselt den switch-Block aus `downloadPdf()`)
2. Preview-State + Caching mit `Record<string, string>` für Blob-URLs + `useRef` für Cache
3. On hover → `generatePdfBlob()` aufrufen, Blob-URL cachen, iframe mit PDF anzeigen
4. Cache invalidieren wenn `customColor`, `customHeadline`, `logoDataUrl` oder `designMode` sich ändern
5. Blob-URLs bei Unmount aufräumen (memory leak verhindern)

## Änderungen

### `generatePdfBlob()` Helper (Zeile 67-82, gleiche Datei)
- Neuer async Helper der den switch-Block kapselt
- Wird von `downloadPdf()` und `handlePreviewHover()` genutzt
- Eliminiert Code-Duplizierung

### Preview-State + Caching
- `pdfPreviews: Record<string, string>` — React State für UI-Updates
- `previewCacheRef: useRef<Record<string, string>>` — stabiler Cache für schnelle Lookup ohne Re-Render
- Cache-Invalidation via `useEffect` bei Änderung von `customColor`, `customHeadline`, `logoDataUrl`, `designMode`
- Cleanup-Effect bei Unmount: `Object.values(previewCacheRef.current).forEach(URL.revokeObjectURL)`

### `handlePreviewHover()` Callback
- Setzt `hoveredItem` sofort (zeigt Loading-Spinner)
- Prüft ob Cache-Hit vorliegt → wenn ja, kein Re-Generate
- Generiert PDF via `generatePdfBlob()`, erstellt Blob-URL, cached sie

### Hover-Preview Rendering (ersetzt alte Mini-Previews)
- `<iframe src={blobUrl}#toolbar=0&navpanes=0&view=FitH>` zeigt echtes PDF
- Größe: 240×340px (A4-Portrait-Ratio)
- Loading-Spinner (animate-spin) solange PDF generiert wird
- `pointer-events-none` auf Container damit kein Klick ins PDF geht

### `downloadPdf()` Refactoring
- Nutzt jetzt `generatePdfBlob(design.type, config)` statt eigenem switch-Block

### Gelöschte Komponenten
- `LightMiniPreview` — entfernt
- `DarkMiniPreview` — entfernt
- `InfographicMiniPreview` — entfernt

## Betroffene Dateien
- `src/app/(dashboard)/dashboard/qr-codes/page.tsx` (geändert)

## Verifikation
- `npx next build` — Build sauber, keine Fehler ✅
- Manuell testen: `/dashboard/qr-codes` → über PDF-Design hovern → echtes PDF als Vorschau
- Verschiedene Designs hovern → jedes zeigt eigene Vorschau
- Farbe/Headline ändern → Previews werden neu generiert
- Mobile: kein Hover, keine Probleme (pointer-events-none, Touch löst keinen Hover aus)

## Akzeptanzkriterien
- [x] Hover-Preview zeigt erkennbare Vorschau des tatsächlichen PDF-Designs
- [x] Preview ist groß genug um Details zu erkennen (240x340px iframe)
- [x] Jedes Design zeigt seine eigene korrekte Vorschau
- [x] Mobile: kein Hover nötig (Touch-Geräte)

## Log
| Datum | Aktion | Details |
|-------|--------|---------|
| 2026-02-10 | Ticket erstellt | Mini-Previews zu klein, zeigen nicht das richtige PDF |
| 2026-02-10 | Analyse | page.tsx gelesen, 3 statische Mini-Preview-Komponenten identifiziert, 12 PDF-Generatoren in qr-pdf.ts |
| 2026-02-10 | Implementiert | `generatePdfBlob` Helper extrahiert, Blob-URL-Caching mit State + Ref, iframe-Preview (240x340px), Cache-Invalidation, Unmount-Cleanup |
| 2026-02-10 | Refactored | `downloadPdf()` nutzt neuen Helper, 3 alte Mini-Preview-Komponenten gelöscht |
| 2026-02-10 | Build | `npx next build` sauber ✅ |
| 2026-02-10 | Review | Commit `0df7086`, gepusht auf `origin/main` |
| 2026-02-10 | Done | Andi bestätigt ✅ |
