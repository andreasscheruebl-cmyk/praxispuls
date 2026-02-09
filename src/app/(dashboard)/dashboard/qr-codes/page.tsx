"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Download, Sun, Moon, Sparkles, Star, MessageSquare } from "lucide-react";
import {
  generateA4Poster,
  generateA6Card,
  generateA5TableTentLight,
  generateBusinessCardLight,
  generateA4InfographicDark,
  generateA6BoldDark,
  generateA5TableTentDark,
  generateBusinessCardDark,
  generateA4MagazineInfographic,
  generateA4BoldGraphic,
  generateA5LandscapeInfographic,
  generateA6MinimalInfographic,
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
  | "card-dark"
  | "a4-magazine"
  | "a4-bold"
  | "a5-landscape"
  | "a6-minimal";

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

const INFOGRAPHIC_DESIGNS: DesignInfo[] = [
  { type: "a4-magazine", label: "A4 Magazin-Style", format: "A4", description: "Elegantes Editorial-Design mit Glaseffekten", filename: "praxispuls-magazin-a4.pdf" },
  { type: "a4-bold", label: "A4 Bold Graphic", format: "A4", description: "Kontrastreiche Typografie, Diagonal-Cut", filename: "praxispuls-bold-a4.pdf" },
  { type: "a5-landscape", label: "A5 Landscape", format: "A5 quer", description: "Dunkler Timeline-Stil mit Glow-QR", filename: "praxispuls-landscape-a5.pdf" },
  { type: "a6-minimal", label: "A6 Minimal", format: "A6", description: "Clean mit Accent-Stripe, icon-driven", filename: "praxispuls-minimal-a6.pdf" },
];

function LightMiniPreview({ color }: { color: string }) {
  return (
    <div className="flex h-64 w-44 flex-col items-center justify-between rounded-lg border bg-white p-3 shadow-md">
      <div className="h-4 w-full rounded-sm" style={{ backgroundColor: color }} />
      <p className="text-xs font-bold" style={{ color }}>Ihre Meinung zählt!</p>
      <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-100">
        <QrCode className="h-14 w-14 text-gray-300" />
      </div>
      <div className="rounded-full px-3 py-1 text-[8px] font-bold text-white" style={{ backgroundColor: "#22c55e" }}>Nur 60 Sekunden!</div>
      <div className="h-3 w-full rounded-sm" style={{ backgroundColor: color }} />
    </div>
  );
}

function DarkMiniPreview({ color }: { color: string }) {
  return (
    <div className="flex h-64 w-44 flex-col items-center justify-between rounded-lg border bg-slate-900 p-3 shadow-md">
      <p className="text-xs font-bold text-white">Praxis</p>
      <p className="text-[10px] font-bold" style={{ color }}>Ihre Meinung zählt!</p>
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-lg opacity-20" style={{ backgroundColor: color }} />
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white">
          <QrCode className="h-12 w-12 text-gray-400" />
        </div>
      </div>
      <div className="flex gap-1.5">
        {["60s", "Anonym", "DSGVO"].map((s) => (
          <span key={s} className="rounded-full border border-slate-600 px-2 py-0.5 text-[7px] text-slate-300">{s}</span>
        ))}
      </div>
      <div className="h-2 w-full rounded-sm bg-slate-800" />
    </div>
  );
}

function InfographicMiniPreview({ color }: { color: string }) {
  return (
    <div className="flex h-64 w-44 flex-col items-center justify-between rounded-lg border p-3 shadow-md" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
      <p className="text-[10px] font-bold text-white/70">Praxis</p>
      <p className="text-xs font-bold text-white">Ihre Meinung zählt!</p>
      <div className="flex gap-1.5">
        {["1", "2", "3"].map((n) => (
          <div key={n} className="flex h-6 w-6 items-center justify-center rounded-md bg-white/15 text-[9px] font-bold text-white">{n}</div>
        ))}
      </div>
      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-lg">
        <QrCode className="h-10 w-10 text-gray-400" />
      </div>
      <div className="flex gap-1">
        {["60s", "Anonym"].map((s) => (
          <span key={s} className="rounded-full bg-white/15 px-2 py-0.5 text-[7px] text-white">{s}</span>
        ))}
      </div>
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
  const [designMode, setDesignMode] = useState<"light" | "dark" | "infographic">("light");

  // Infographic config
  const [customHeadline, setCustomHeadline] = useState("");
  const [customColor, setCustomColor] = useState("#0D9488");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/practice/qr-code").then((r) => r.ok ? r.json() : null),
      fetch("/api/practice").then((r) => r.ok ? r.json() : null),
    ]).then(([qrData, practiceData]) => {
      if (qrData) { setQrDataUrl(qrData.qrCodeDataUrl); setSurveyUrl(qrData.surveyUrl); }
      if (practiceData) {
        setPracticeName(practiceData.name || "Praxis");
        if (practiceData.theme) setThemeId(practiceData.theme as ThemeId);
        if (practiceData.primaryColor) {
          setPracticeColor(practiceData.primaryColor);
          setCustomColor(practiceData.primaryColor);
        }
        // Load logo as data URL if available
        if (practiceData.logoUrl) {
          fetch(practiceData.logoUrl)
            .then((r) => r.ok ? r.blob() : null)
            .then((blob) => {
              if (!blob) return;
              const reader = new FileReader();
              reader.onloadend = () => setLogoDataUrl(reader.result as string);
              reader.readAsDataURL(blob);
            })
            .catch(() => {});
        }
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

  function hexToRgb(hex: string): [number, number, number] {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  async function downloadPdf(design: DesignInfo) {
    if (!qrDataUrl) return;
    setPdfLoading(design.type);

    // Use custom color for infographic designs, theme color for others
    const isInfographic = ["a4-magazine", "a4-bold", "a5-landscape", "a6-minimal"].includes(design.type);
    const brandColor = isInfographic ? hexToRgb(customColor) : getThemeConfig(themeId).pdf.brandColor;

    const config: PdfConfig = {
      qrDataUrl,
      practiceName,
      surveyUrl,
      brandColor,
      headline: isInfographic && customHeadline ? customHeadline : undefined,
      logoDataUrl: logoDataUrl || undefined,
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
        case "a4-magazine": blob = await generateA4MagazineInfographic(config); break;
        case "a4-bold": blob = await generateA4BoldGraphic(config); break;
        case "a5-landscape": blob = await generateA5LandscapeInfographic(config); break;
        case "a6-minimal": blob = await generateA6MinimalInfographic(config); break;
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

  const currentDesigns = designMode === "light" ? LIGHT_DESIGNS : designMode === "dark" ? DARK_DESIGNS : INFOGRAPHIC_DESIGNS;

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

          {/* PDF Designs – Light / Dark / Infographic switchable */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">PDF-Designs</CardTitle>
                <div className="flex items-center rounded-lg border p-0.5">
                  <button
                    onClick={() => setDesignMode("light")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${designMode === "light" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Sun className="h-3.5 w-3.5" />
                    Light
                  </button>
                  <button
                    onClick={() => setDesignMode("dark")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${designMode === "dark" ? "bg-slate-800 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Moon className="h-3.5 w-3.5" />
                    Dark
                  </button>
                  <button
                    onClick={() => setDesignMode("infographic")}
                    className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${designMode === "infographic" ? "bg-gradient-to-r from-primary to-primary/70 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Infografik
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Infographic configuration */}
              {designMode === "infographic" && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="mb-3 text-sm font-medium">Design anpassen</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="headline" className="text-xs">Headline (optional)</Label>
                      <Input
                        id="headline"
                        placeholder="Ihre Meinung zählt!"
                        value={customHeadline}
                        onChange={(e) => setCustomHeadline(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="pdfColor" className="text-xs">Primärfarbe</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="pdfColor"
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="h-9 w-12 cursor-pointer rounded border"
                        />
                        <span className="text-xs text-muted-foreground">{customColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {currentDesigns.map((design) => (
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
                      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2">
                        {designMode === "light" ? (
                          <LightMiniPreview color={practiceColor} />
                        ) : designMode === "dark" ? (
                          <DarkMiniPreview color={practiceColor} />
                        ) : (
                          <InfographicMiniPreview color={customColor} />
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Survey Preview – all 5 steps */}
          {surveyUrl && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Umfrage-Vorschau</CardTitle>
                  <a
                    href={surveyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    In neuem Tab öffnen
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {/* Step 1: NPS (Vertrauen Slider-Design) */}
                  <div className="w-56 shrink-0 rounded-xl border bg-[#faf8f5] p-4">
                    <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Schritt 1 von 3</p>
                    <p className="mb-3 text-center text-xs font-semibold">Wie wahrscheinlich ist es, dass Sie {practiceName} weiterempfehlen?</p>
                    <div className="mx-auto max-w-[180px] space-y-2">
                      <div className="relative h-2 rounded-full bg-gray-200">
                        <div className="absolute left-0 top-0 h-2 w-3/4 rounded-full" style={{ backgroundColor: practiceColor }} />
                        <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: practiceColor, left: "72%" }} />
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground">
                        <span>0</span>
                        <span className="font-bold" style={{ color: practiceColor }}>8</span>
                        <span>10</span>
                      </div>
                    </div>
                    <div className="mt-3 rounded-lg py-1.5 text-center text-[10px] font-semibold text-white" style={{ backgroundColor: practiceColor }}>Weiter</div>
                  </div>

                  {/* Step 2: Categories */}
                  <div className="w-56 shrink-0 rounded-xl border bg-[#faf8f5] p-4">
                    <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Schritt 2 von 3</p>
                    <p className="mb-3 text-center text-xs font-semibold">Wie bewerten Sie folgende Bereiche?</p>
                    <div className="space-y-1.5">
                      {[
                        { label: "Wartezeit", stars: 4 },
                        { label: "Freundlichkeit", stars: 5 },
                        { label: "Behandlung", stars: 5 },
                        { label: "Ausstattung", stars: 4 },
                      ].map((cat) => (
                        <div key={cat.label} className="rounded-lg bg-white px-2.5 py-1.5 shadow-sm">
                          <p className="mb-0.5 text-[9px] font-medium">{cat.label}</p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="h-3 w-3" style={s <= cat.stars ? { fill: practiceColor, color: practiceColor } : { color: "#d1d5db" }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 rounded-lg py-1.5 text-center text-[10px] font-semibold text-white" style={{ backgroundColor: practiceColor }}>Weiter</div>
                  </div>

                  {/* Step 3: Freetext */}
                  <div className="w-56 shrink-0 rounded-xl border bg-[#faf8f5] p-4">
                    <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Schritt 3 von 3</p>
                    <p className="mb-3 text-center text-xs font-semibold">Möchten Sie uns noch etwas mitteilen?</p>
                    <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-2.5">
                      <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <p className="text-[10px] italic text-muted-foreground">Ihr Feedback (optional)</p>
                    </div>
                    <p className="mt-1.5 text-[8px] text-muted-foreground">Bitte keine persönlichen Daten eingeben.</p>
                    <div className="mt-3 flex gap-2">
                      <div className="flex-1 rounded-lg py-1.5 text-center text-[10px] font-semibold text-white" style={{ backgroundColor: practiceColor }}>Absenden</div>
                      <div className="rounded-lg border px-2 py-1.5 text-center text-[10px] text-muted-foreground">Überspringen</div>
                    </div>
                  </div>

                  {/* Step 4: Google Review Prompt (Promoter) */}
                  <div className="w-56 shrink-0 rounded-xl border bg-[#faf8f5] p-4 text-center">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Promoter (9–10)</p>
                    <div className="my-3 text-2xl">🎉</div>
                    <p className="mb-2 text-xs font-semibold">Vielen Dank für Ihr tolles Feedback!</p>
                    <p className="mb-3 text-[10px] text-muted-foreground">Würden Sie Ihre positive Erfahrung auch auf Google teilen?</p>
                    <div className="rounded-lg py-1.5 text-center text-[10px] font-semibold text-white" style={{ backgroundColor: practiceColor }}>⭐ Ja, gerne bewerten!</div>
                    <p className="mt-2 text-[9px] text-muted-foreground underline">Nein, danke</p>
                  </div>

                  {/* Step 5: Thank you / Detractor */}
                  <div className="w-56 shrink-0 rounded-xl border bg-[#faf8f5] p-4 text-center">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Detractor (0–6)</p>
                    <div className="my-3 text-2xl">🙏</div>
                    <p className="mb-2 text-xs font-semibold">Danke für Ihre Ehrlichkeit.</p>
                    <p className="text-[10px] text-muted-foreground">Wir nehmen Ihr Feedback ernst und arbeiten daran, uns zu verbessern.</p>
                  </div>
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-foreground">← Scrollen für alle Schritte →</p>
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
