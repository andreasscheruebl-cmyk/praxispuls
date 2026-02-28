"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GooglePlacesSearch } from "@/components/dashboard/google-places-search";
import { IndustryPicker } from "@/components/dashboard/industry-picker";
import { TemplateQuickSelect } from "@/components/dashboard/template-quick-select";
import { useLocationSetup } from "@/hooks/use-location-setup";

export default function OnboardingPage() {
  const router = useRouter();
  const {
    step, setStep, loading, templatesLoading, error,
    industry, name, setName, googlePlaceId, setGooglePlaceId,
    templateId, setTemplateId, templates, terminology, stepTitle,
    handleIndustryChange, handleComplete,
  } = useLocationSetup();

  function onComplete() {
    handleComplete(() => {
      router.push("/dashboard/qr-codes");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-4 text-primary font-bold text-xl">PraxisPuls</div>
          <CardTitle className="text-2xl">{stepTitle}</CardTitle>
          <CardDescription>Schritt {step} von 3</CardDescription>
          <div className="mt-4 flex gap-2 justify-center">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 w-16 rounded-full ${s <= step ? "bg-primary" : "bg-gray-200"}`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <IndustryPicker value={industry} onChange={handleIndustryChange} />
              <Button onClick={() => setStep(2)} className="w-full" disabled={!industry}>
                Weiter
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder={terminology ? `z.B. ${terminology.singular}spraxis Dr. Müller` : "Name Ihrer Einrichtung"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Google-Eintrag</Label>
                <p className="text-sm text-muted-foreground">
                  Damit zufriedene {terminology?.plural ?? "Kunden"} direkt zu Ihrer
                  Google-Bewertungsseite weitergeleitet werden.
                </p>
                <GooglePlacesSearch
                  value={googlePlaceId}
                  onChange={setGooglePlaceId}
                  selectedName=""
                  initialQuery={name || undefined}
                />
                {googlePlaceId && (
                  <p className="text-xs text-green-600">Google-Eintrag verknüpft</p>
                )}
                {!googlePlaceId && (
                  <p className="text-xs text-muted-foreground">
                    Sie können das auch später unter Einstellungen ergänzen.
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Zurück
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1" disabled={!name.trim()}>
                  {googlePlaceId ? "Weiter" : "Überspringen"}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-3">
                <Label>Umfrage-Template wählen</Label>
                <TemplateQuickSelect
                  templates={templates}
                  value={templateId}
                  onChange={setTemplateId}
                  loading={templatesLoading}
                />
              </div>
              {error && (
                <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Zurück
                </Button>
                <Button onClick={onComplete} className="flex-1" disabled={loading || !templateId}>
                  {loading ? "Wird eingerichtet…" : "Einrichtung starten"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
