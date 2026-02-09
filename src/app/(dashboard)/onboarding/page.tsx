"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoUpload } from "@/components/dashboard/logo-upload";

const TEMPLATES = [
  { id: "zahnarzt_standard", name: "Standard", desc: "NPS + 4 Kategorien + Freitext (empfohlen)" },
  { id: "zahnarzt_kurz", name: "Kurz", desc: "Nur NPS + Freitext (30 Sekunden)" },
  { id: "zahnarzt_prophylaxe", name: "Prophylaxe", desc: "NPS + PZR-spezifische Fragen" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    postalCode: "",
    logoUrl: "",
    googlePlaceId: "",
    surveyTemplate: "zahnarzt_standard",
  });

  async function handleComplete() {
    setLoading(true);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push("/dashboard/qr-codes");
        router.refresh();
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4 text-brand-500 font-bold text-xl">PraxisPuls</div>
          <CardTitle className="text-2xl">Praxis einrichten</CardTitle>
          <CardDescription>Schritt {step} von 3</CardDescription>
          <div className="mt-4 flex gap-2 justify-center">
            {[1,2,3].map(s => (
              <div key={s} className={`h-2 w-16 rounded-full ${s <= step ? "bg-brand-500" : "bg-gray-200"}`} />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Praxisname *</Label>
                <Input id="name" placeholder="Zahnarztpraxis Dr. Müller" value={data.name}
                  onChange={e => setData({...data, name: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plz">PLZ</Label>
                <Input id="plz" placeholder="80331" value={data.postalCode} maxLength={5}
                  onChange={e => setData({...data, postalCode: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Logo <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <LogoUpload
                  currentLogoUrl={data.logoUrl || null}
                  onUpload={(url) => setData({ ...data, logoUrl: url })}
                />
              </div>
              <Button onClick={() => setStep(2)} className="w-full" disabled={!data.name.trim()}>
                Weiter
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="gpi">Google Place ID (optional)</Label>
                <Input id="gpi" placeholder="ChIJ..." value={data.googlePlaceId}
                  onChange={e => setData({...data, googlePlaceId: e.target.value})} />
                <p className="text-xs text-muted-foreground">
                  Nötig für die Google-Bewertungs-Weiterleitung. Sie können das auch später ergänzen.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Zurück</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Weiter</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-3">
                <Label>Umfrage-Template wählen</Label>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setData({...data, surveyTemplate: t.id})}
                    className={`w-full rounded-lg border p-4 text-left transition ${data.surveyTemplate === t.id ? "border-brand-500 bg-brand-50" : "hover:bg-gray-50"}`}>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Zurück</Button>
                <Button onClick={handleComplete} className="flex-1" disabled={loading}>
                  {loading ? "Wird eingerichtet..." : "Praxis einrichten 🚀"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
