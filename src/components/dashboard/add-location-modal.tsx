"use client";

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
import { useLocationSetup } from "@/hooks/use-location-setup";

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
  const {
    step, setStep, loading, templatesLoading, error,
    industry, name, setName, googlePlaceId, setGooglePlaceId,
    templateId, setTemplateId, templates, terminology, stepTitle,
    handleIndustryChange, handleComplete, resetForm,
  } = useLocationSetup();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  }

  async function onComplete() {
    await handleComplete(() => {
      resetForm();
      onSuccess();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Neuen Standort hinzufügen</DialogTitle>
          <DialogDescription>
            Schritt {step} von 3 — {stepTitle}
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
          {step === 1 && (
            <>
              <IndustryPicker value={industry} onChange={handleIndustryChange} />
              <Button onClick={() => setStep(2)} className="w-full" disabled={!industry || templatesLoading || !!error}>
                Weiter
              </Button>
            </>
          )}

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
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Zurück
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1" disabled={name.trim().length < 2}>
                  {googlePlaceId ? "Weiter" : "Überspringen"}
                </Button>
              </div>
            </>
          )}

          {error && (
            <p
              className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </p>
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
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Zurück
                </Button>
                <Button onClick={onComplete} className="flex-1" disabled={loading || !templateId}>
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
