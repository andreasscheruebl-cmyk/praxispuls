"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoUpload } from "@/components/dashboard/logo-upload";
import { GooglePlacesSearch } from "@/components/dashboard/google-places-search";

const TEMPLATES = [
  { id: "zahnarzt_standard", name: "Standard", desc: "Empfehlung + 4 Kategorien + Freitext (empfohlen)" },
  { id: "zahnarzt_kurz", name: "Kurz", desc: "Nur Empfehlung + Freitext (30 Sekunden)" },
  { id: "zahnarzt_prophylaxe", name: "Prophylaxe", desc: "Empfehlung + PZR-spezifische Fragen" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [data, setData] = useState({
    name: "",
    postalCode: "",
    logoUrl: "",
    googlePlaceId: "",
    templateId: "zahnarzt_standard",
  });

  async function handleComplete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Fehler beim Einrichten. Bitte versuchen Sie es erneut.");
        setLoading(false);
        return;
      }

      // Upload deferred logo now that the practice exists
      if (pendingLogoFile) {
        const formData = new FormData();
        formData.append("file", pendingLogoFile);
        await fetch("/api/practice/logo", { method: "POST", body: formData });
      }

      router.push("/dashboard/qr-codes");
      router.refresh();
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4 text-primary font-bold text-xl">PraxisPuls</div>
          <CardTitle className="text-2xl">Praxis einrichten</CardTitle>
          <CardDescription>Schritt {step} von 3</CardDescription>
          <div className="mt-4 flex gap-2 justify-center">
            {[1,2,3].map(s => (
              <div key={s} className={`h-2 w-16 rounded-full ${s <= step ? "bg-primary" : "bg-gray-200"}`} />
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
                  deferUpload
                  onFileSelect={(file) => setPendingLogoFile(file)}
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
                <Label>Google-Eintrag Ihrer Praxis</Label>
                <p className="text-sm text-muted-foreground">
                  Damit zufriedene Patienten direkt zu Ihrer Google-Bewertungsseite weitergeleitet werden.
                </p>
                <GooglePlacesSearch
                  value={data.googlePlaceId}
                  onChange={(placeId) => setData({...data, googlePlaceId: placeId})}
                  selectedName=""
                  initialQuery={data.name || undefined}
                  postalCode={data.postalCode || undefined}
                />
                {data.googlePlaceId && (
                  <p className="text-xs text-green-600">
                    Google-Eintrag verknüpft (Place ID: {data.googlePlaceId})
                  </p>
                )}
                {!data.googlePlaceId && (
                  <p className="text-xs text-muted-foreground">
                    Suchen Sie nach Ihrem Praxisnamen. Sie können das auch später unter Einstellungen ergänzen.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Zurück</Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  {data.googlePlaceId ? "Weiter" : "Überspringen"}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-3">
                <Label>Umfrage-Template wählen</Label>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => setData({...data, templateId: t.id})}
                    className={`w-full rounded-lg border p-4 text-left transition ${data.templateId === t.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"}`}>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
              </div>
              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
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
