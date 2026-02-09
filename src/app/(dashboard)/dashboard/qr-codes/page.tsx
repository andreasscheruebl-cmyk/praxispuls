"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, Download } from "lucide-react";

export default function QrCodesPage() {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [surveyUrl, setSurveyUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/practice/qr-code")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) { setQrDataUrl(data.qrCodeDataUrl); setSurveyUrl(data.surveyUrl); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = "praxispuls-qr-code.png";
    link.href = qrDataUrl;
    link.click();
  }

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" /></div>;

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
              <div className="rounded-lg border bg-white p-4"><img src={qrDataUrl} alt="QR-Code" className="h-64 w-64" /></div>
              <p className="mt-4 text-center text-sm text-muted-foreground">URL: <code className="text-xs">{surveyUrl}</code></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Herunterladen</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <button onClick={downloadQr} className="flex w-full items-center gap-4 rounded-lg border p-4 text-left hover:bg-gray-50">
                <Download className="h-5 w-5 text-brand-500" />
                <div><p className="font-medium">PNG (512×512)</p><p className="text-sm text-muted-foreground">Website, Social Media, E-Mails</p></div>
              </button>
              <div className="flex w-full items-center gap-4 rounded-lg border p-4 opacity-50">
                <Download className="h-5 w-5" />
                <div><p className="font-medium">A4 Poster (PDF)</p><p className="text-sm text-muted-foreground">Wartezimmer – kommt bald</p></div>
              </div>
              <div className="flex w-full items-center gap-4 rounded-lg border p-4 opacity-50">
                <Download className="h-5 w-5" />
                <div><p className="font-medium">A6 Aufsteller (PDF)</p><p className="text-sm text-muted-foreground">Rezeption – kommt bald</p></div>
              </div>
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
