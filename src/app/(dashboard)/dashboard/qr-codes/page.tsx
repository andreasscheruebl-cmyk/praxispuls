"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download } from "lucide-react";
import { generateA4Poster, generateA6Card } from "@/lib/qr-pdf";
import { type ThemeId, getThemeConfig } from "@/lib/themes";

export default function QrCodesPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [surveyUrl, setSurveyUrl] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [themeId, setThemeId] = useState<ThemeId>("standard");

  useEffect(() => {
    Promise.all([
      fetch("/api/practice/qr-code").then((r) => r.ok ? r.json() : null),
      fetch("/api/practice").then((r) => r.ok ? r.json() : null),
    ]).then(([qrData, practiceData]) => {
      if (qrData) { setQrDataUrl(qrData.qrCodeDataUrl); setSurveyUrl(qrData.surveyUrl); }
      if (practiceData) {
        setPracticeName(practiceData.name || "Praxis");
        if (practiceData.theme) setThemeId(practiceData.theme as ThemeId);
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

  async function downloadPdf(type: "a4" | "a6") {
    if (!qrDataUrl) return;
    setPdfLoading(type);
    const brandColor = getThemeConfig(themeId).pdf.brandColor;
    try {
      const blob = type === "a4"
        ? await generateA4Poster(qrDataUrl, practiceName, surveyUrl, brandColor)
        : await generateA6Card(qrDataUrl, practiceName, surveyUrl, brandColor);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = type === "a4" ? "praxispuls-poster-a4.pdf" : "praxispuls-aufsteller-a6.pdf";
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
            <CardHeader><CardTitle className="text-lg">Herunterladen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <button onClick={downloadQr} className="flex w-full items-center gap-4 rounded-lg border p-4 text-left hover:bg-gray-50">
                <Download className="h-5 w-5 text-primary" />
                <div><p className="font-medium">PNG (512×512)</p><p className="text-sm text-muted-foreground">Website, Social Media, E-Mails</p></div>
              </button>
              <button onClick={() => downloadPdf("a4")} disabled={pdfLoading === "a4"} className="flex w-full items-center gap-4 rounded-lg border p-4 text-left hover:bg-gray-50 disabled:opacity-50">
                <Download className="h-5 w-5 text-primary" />
                <div><p className="font-medium">A4 Poster (PDF)</p><p className="text-sm text-muted-foreground">{pdfLoading === "a4" ? "Wird erstellt..." : "Wartezimmer, Behandlungsräume"}</p></div>
              </button>
              <button onClick={() => downloadPdf("a6")} disabled={pdfLoading === "a6"} className="flex w-full items-center gap-4 rounded-lg border p-4 text-left hover:bg-gray-50 disabled:opacity-50">
                <Download className="h-5 w-5 text-primary" />
                <div><p className="font-medium">A6 Aufsteller (PDF)</p><p className="text-sm text-muted-foreground">{pdfLoading === "a6" ? "Wird erstellt..." : "Rezeption, Tresen"}</p></div>
              </button>
            </CardContent>
          </Card>
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
