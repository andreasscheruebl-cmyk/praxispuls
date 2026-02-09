"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download, Sun, Moon } from "lucide-react";
import {
  generateA4Poster,
  generateA6Card,
  generateA5TableTentLight,
  generateBusinessCardLight,
  generateA4InfographicDark,
  generateA6BoldDark,
  generateA5TableTentDark,
  generateBusinessCardDark,
  type PdfConfig,
} from "@/lib/qr-pdf";
import { type ThemeId, getThemeConfig } from "@/lib/themes";

type PdfDesignType =
  | "a4-light"
  | "a6-light"
  | "a5-light"
  | "card-light"
  | "a4-dark"
  | "a6-dark"
  | "a5-dark"
  | "card-dark";

type DesignInfo = {
  type: PdfDesignType;
  label: string;
  format: string;
  description: string;
  filename: string;
};

const LIGHT_DESIGNS: DesignInfo[] = [
  { type: "a4-light", label: "A4 Poster", format: "A4", description: "Wartezimmer, Behandlungsräume", filename: "praxispuls-poster-a4-light.pdf" },
  { type: "a6-light", label: "A6 Aufsteller", format: "A6", description: "Rezeption, Tresen", filename: "praxispuls-aufsteller-a6-light.pdf" },
  { type: "a5-light", label: "A5 Tischaufsteller", format: "A5", description: "Empfang, Wartebereich", filename: "praxispuls-tischaufsteller-a5-light.pdf" },
  { type: "card-light", label: "Visitenkarte", format: "85×55mm", description: "Zum Mitnehmen, mit Schnittlinien", filename: "praxispuls-visitenkarte-light.pdf" },
];

const DARK_DESIGNS: DesignInfo[] = [
  { type: "a4-dark", label: "A4 Infographic", format: "A4", description: "Premium-Look mit Glow-Effekt", filename: "praxispuls-infographic-a4-dark.pdf" },
  { type: "a6-dark", label: "A6 Bold", format: "A6", description: "Dunkler Aufsteller, modern", filename: "praxispuls-aufsteller-a6-dark.pdf" },
  { type: "a5-dark", label: "A5 Tisch-Infographic", format: "A5", description: "Split-Design, Schritte + QR", filename: "praxispuls-tischaufsteller-a5-dark.pdf" },
  { type: "card-dark", label: "Visitenkarte Dark", format: "85×55mm", description: "Premium-Karte mit Accent-Stripe", filename: "praxispuls-visitenkarte-dark.pdf" },
];

function LightMiniPreview({ color }: { color: string }) {
  return (
    <div className="flex h-44 w-32 flex-col items-center justify-between rounded border bg-white p-2 shadow-sm">
      <div className="h-3 w-full rounded-sm" style={{ backgroundColor: color }} />
      <p className="text-[7px] font-bold" style={{ color }}>Ihre Meinung zählt!</p>
      <div className="flex h-14 w-14 items-center justify-center rounded bg-gray-100">
        <QrCode className="h-10 w-10 text-gray-300" />
      </div>
      <div className="rounded-full px-2 py-0.5 text-[6px] font-bold text-white" style={{ backgroundColor: "#22c55e" }}>Nur 60 Sekunden!</div>
      <div className="h-2 w-full rounded-sm" style={{ backgroundColor: color }} />
    </div>
  );
}

function DarkMiniPreview({ color }: { color: string }) {
  return (
    <div className="flex h-44 w-32 flex-col items-center justify-between rounded border bg-slate-900 p-2 shadow-sm">
      <p className="text-[7px] font-bold text-white">Praxis</p>
      <p className="text-[8px] font-bold" style={{ color }}>Ihre Meinung zählt!</p>
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded opacity-20" style={{ backgroundColor: color }} />
        <div className="flex h-12 w-12 items-center justify-center rounded bg-white">
          <QrCode className="h-8 w-8 text-gray-400" />
        </div>
      </div>
      <div className="flex gap-1">
        {["60s", "Anonym", "DSGVO"].map((s) => (
          <span key={s} className="rounded-full border border-slate-600 px-1.5 py-0.5 text-[5px] text-slate-300">{s}</span>
        ))}
      </div>
      <div className="h-1.5 w-full rounded-sm bg-slate-800" />
    </div>
  );
}

export default function QrCodesPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [surveyUrl, setSurveyUrl] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [practiceColor, setPracticeColor] = useState("#0D9488");
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<ThemeId>("standard");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/practice/qr-code").then((r) => r.ok ? r.json() : null),
      fetch("/api/practice").then((r) => r.ok ? r.json() : null),
    ]).then(([qrData, practiceData]) => {
      if (qrData) { setQrDataUrl(qrData.qrCodeDataUrl); setSurveyUrl(qrData.surveyUrl); }
      if (practiceData) {
        setPracticeName(practiceData.name || "Praxis");
        if (practiceData.theme) setThemeId(practiceData.theme as ThemeId);
        if (practiceData.primaryColor) setPracticeColor(practiceData.primaryColor);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = "praxispuls-qr-code.png";
    link.href = qrDataUrl;
    link.click();
  }

  async function downloadPdf(design: DesignInfo) {
    if (!qrDataUrl) return;
    setPdfLoading(design.type);
    const brandColor = getThemeConfig(themeId).pdf.brandColor;

    const config: PdfConfig = {
      qrDataUrl,
      practiceName,
      surveyUrl,
      brandColor,
    };

    try {
      let blob: Blob;
      switch (design.type) {
        case "a4-light": blob = await generateA4Poster(config); break;
        case "a6-light": blob = await generateA6Card(config); break;
        case "a5-light": blob = await generateA5TableTentLight(config); break;
        case "card-light": blob = await generateBusinessCardLight(config); break;
        case "a4-dark": blob = await generateA4InfographicDark(config); break;
        case "a6-dark": blob = await generateA6BoldDark(config); break;
        case "a5-dark": blob = await generateA5TableTentDark(config); break;
        case "card-dark": blob = await generateBusinessCardDark(config); break;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = design.filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setPdfLoading(null);
    }
  }

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">QR-Codes</h1>
        <p className="text-muted-foreground">Laden Sie den QR-Code herunter und platzieren Sie ihn in Ihrer Praxis.</p>
      </div>
      {qrDataUrl ? (
        <div className="space-y-8">
          {/* QR Preview + PNG Download */}
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Ihr QR-Code</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <div className="rounded-lg border bg-white p-4"><img src={qrDataUrl} alt="QR-Code" className="h-64 w-64" /></div>
                <p className="mt-4 text-center text-sm text-muted-foreground">URL: <code className="text-xs">{surveyUrl}</code></p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">PNG herunterladen</CardTitle></CardHeader>
              <CardContent>
                <button onClick={downloadQr} onMouseEnter={() => setHoveredItem("png")} onMouseLeave={() => setHoveredItem(null)} className="relative flex w-full items-center gap-4 rounded-lg border p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Download className="h-5 w-5 text-primary" />
                  <div><p className="font-medium">PNG (512×512)</p><p className="text-sm text-muted-foreground">Website, Social Media, E-Mails</p></div>
                </button>
                {hoveredItem === "png" && qrDataUrl && (
                  <div className="mt-3 flex justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrDataUrl} alt="QR Preview" className="h-28 w-28 rounded border" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Light Designs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="h-5 w-5 text-amber-500" />
                Light-Designs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {LIGHT_DESIGNS.map((design) => (
                  <div key={design.type} className="relative">
                    <button
                      onClick={() => downloadPdf(design)}
                      disabled={pdfLoading === design.type}
                      onMouseEnter={() => setHoveredItem(design.type)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-800"
                    >
                      <Download className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="font-medium">{design.label} <span className="text-xs text-muted-foreground">({design.format})</span></p>
                        <p className="text-sm text-muted-foreground">{pdfLoading === design.type ? "Wird erstellt..." : design.description}</p>
                      </div>
                    </button>
                    {hoveredItem === design.type && (
                      <div className="pointer-events-none absolute right-0 top-0 z-10 hidden -translate-y-1/4 translate-x-[calc(100%+8px)] xl:block">
                        <LightMiniPreview color={practiceColor} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dark Premium Designs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Moon className="h-5 w-5 text-indigo-400" />
                Premium Dark-Designs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {DARK_DESIGNS.map((design) => (
                  <div key={design.type} className="relative">
                    <button
                      onClick={() => downloadPdf(design)}
                      disabled={pdfLoading === design.type}
                      onMouseEnter={() => setHoveredItem(design.type)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className="flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-800"
                    >
                      <Download className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0">
                        <p className="font-medium">{design.label} <span className="text-xs text-muted-foreground">({design.format})</span></p>
                        <p className="text-sm text-muted-foreground">{pdfLoading === design.type ? "Wird erstellt..." : design.description}</p>
                      </div>
                    </button>
                    {hoveredItem === design.type && (
                      <div className="pointer-events-none absolute right-0 top-0 z-10 hidden -translate-y-1/4 translate-x-[calc(100%+8px)] xl:block">
                        <DarkMiniPreview color={practiceColor} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Survey Preview */}
          {surveyUrl && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Umfrage-Vorschau</CardTitle></CardHeader>
              <CardContent>
                <div className="rounded-xl border bg-gray-50 p-6">
                  <div className="mx-auto max-w-sm space-y-4 text-center">
                    <p className="text-lg font-semibold">Wie wahrscheinlich ist es, dass Sie {practiceName} weiterempfehlen?</p>
                    <div className="flex justify-center gap-1">
                      {Array.from({ length: 11 }, (_, i) => (
                        <div key={i} className="flex h-8 w-7 items-center justify-center rounded text-xs font-medium" style={i >= 9 ? { backgroundColor: practiceColor, color: "white" } : { border: "1px solid #e5e7eb" }}>
                          {i}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">0 = sehr unwahrscheinlich · 10 = sehr wahrscheinlich</p>
                  </div>
                </div>
                <a
                  href={surveyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Umfrage in neuem Tab öffnen
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <QrCode className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Noch kein QR-Code</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground">Bitte vervollständigen Sie Ihre Praxisdaten.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
