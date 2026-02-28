"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GooglePlacesSearch } from "@/components/dashboard/google-places-search";
import { IndustryPicker } from "@/components/dashboard/industry-picker";
import { TemplateQuickSelect } from "@/components/dashboard/template-quick-select";
import { getOnboardingTemplates } from "@/actions/templates";
import { getSubCategory } from "@/lib/industries";
import { getTerminology } from "@/lib/terminology";
import type { IndustryCategory, IndustrySubCategory } from "@/types";

type TemplateData = {
  id: string;
  name: string;
  description: string | null;
  questionCount: number;
  respondentType: string | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [industry, setIndustry] = useState<{
    category: IndustryCategory;
    subCategory: IndustrySubCategory;
  } | null>(null);
  const [name, setName] = useState("");
  const [googlePlaceId, setGooglePlaceId] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateData[]>([]);

  const loadTemplates = useCallback(
    async (category: IndustryCategory, subCategory: IndustrySubCategory) => {
      setTemplatesLoading(true);
      try {
        const result = await getOnboardingTemplates(category, subCategory);
        if ("error" in result) {
          setTemplates([]);
        } else {
          setTemplates(result.templates);
          // Pre-select first template
          if (result.templates.length > 0) {
            setTemplateId(result.templates[0]!.id);
          }
        }
      } catch {
        setTemplates([]);
      }
      setTemplatesLoading(false);
    },
    [],
  );

  function handleIndustryChange(selection: {
    category: IndustryCategory;
    subCategory: IndustrySubCategory;
  }) {
    setIndustry(selection);
    setTemplateId(null);
    // Pre-fetch templates while user fills in name
    loadTemplates(selection.category, selection.subCategory);
  }

  // Get dynamic terminology for selected sub-category
  const sub = industry ? getSubCategory(industry.subCategory) : null;
  const terminology = sub ? getTerminology(sub.defaultRespondentType) : null;

  async function handleComplete() {
    if (!industry || !templateId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industryCategory: industry.category,
          industrySubCategory: industry.subCategory,
          googlePlaceId: googlePlaceId || undefined,
          templateId,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Fehler beim Einrichten. Bitte versuchen Sie es erneut.");
        setLoading(false);
        return;
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
          <CardTitle className="text-2xl">
            {step === 1 ? "Branche wählen" : step === 2 ? "Einrichtung benennen" : "Umfrage-Template"}
          </CardTitle>
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
          {/* Step 1: Industry selection */}
          {step === 1 && (
            <>
              <IndustryPicker value={industry} onChange={handleIndustryChange} />
              <Button
                onClick={() => setStep(2)}
                className="w-full"
                disabled={!industry}
              >
                Weiter
              </Button>
            </>
          )}

          {/* Step 2: Name + Google Places */}
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
                  <p className="text-xs text-green-600">
                    Google-Eintrag verknüpft
                  </p>
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
                <Button
                  onClick={() => setStep(3)}
                  className="flex-1"
                  disabled={!name.trim()}
                >
                  {googlePlaceId ? "Weiter" : "Überspringen"}
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Template selection */}
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
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                  disabled={loading || !templateId}
                >
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
