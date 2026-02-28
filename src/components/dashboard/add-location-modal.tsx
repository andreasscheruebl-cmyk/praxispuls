"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

type AddLocationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function AddLocationModal({
  open,
  onOpenChange,
  onSuccess,
}: AddLocationModalProps) {
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

  function resetForm() {
    setStep(1);
    setIndustry(null);
    setName("");
    setGooglePlaceId("");
    setTemplateId(null);
    setTemplates([]);
    setError(null);
    setLoading(false);
    setTemplatesLoading(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

  const loadTemplates = useCallback(
    async (category: IndustryCategory, subCategory: IndustrySubCategory) => {
      setTemplatesLoading(true);
      try {
        const result = await getOnboardingTemplates(category, subCategory);
        if ("error" in result) {
          setTemplates([]);
        } else {
          setTemplates(result.templates);
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
    loadTemplates(selection.category, selection.subCategory);
  }

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
        setError(
          body?.error || "Fehler beim Erstellen. Bitte versuchen Sie es erneut.",
        );
        setLoading(false);
        return;
      }

      resetForm();
      onSuccess();
    } catch {
      setError("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neuen Standort hinzufügen</DialogTitle>
          <DialogDescription>
            Schritt {step} von 3 — Richten Sie einen weiteren Standort ein.
          </DialogDescription>
          <div className="flex gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full ${
                  s <= step ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Step 1: Industry */}
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
                <Label htmlFor="loc-name">Name *</Label>
                <Input
                  id="loc-name"
                  placeholder="Name des Standorts"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Google-Eintrag</Label>
                <p className="text-sm text-muted-foreground">
                  Damit zufriedene {terminology?.plural ?? "Kunden"} direkt zu
                  Ihrer Google-Bewertungsseite weitergeleitet werden.
                </p>
                <GooglePlacesSearch
                  value={googlePlaceId}
                  onChange={setGooglePlaceId}
                  selectedName=""
                  initialQuery={name || undefined}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
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

          {/* Step 3: Template */}
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
                <p
                  className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
                  role="alert"
                >
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Zurück
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1"
                  disabled={loading || !templateId}
                >
                  {loading ? "Wird erstellt…" : "Standort erstellen"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
