"use client";

import { useState } from "react";
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

const TEMPLATES = [
  {
    id: "zahnarzt_standard",
    name: "Standard",
    desc: "Empfehlung + 4 Kategorien + Freitext (empfohlen)",
  },
  {
    id: "zahnarzt_kurz",
    name: "Kurz",
    desc: "Nur Empfehlung + Freitext (30 Sekunden)",
  },
  {
    id: "zahnarzt_prophylaxe",
    name: "Prophylaxe",
    desc: "Empfehlung + PZR-spezifische Fragen",
  },
];

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
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
    name: "",
    postalCode: "",
    googlePlaceId: "",
    surveyTemplate: "zahnarzt_standard",
  });

  function resetForm() {
    setStep(1);
    setData({
      name: "",
      postalCode: "",
      googlePlaceId: "",
      surveyTemplate: "zahnarzt_standard",
    });
    setError(null);
    setLoading(false);
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

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
        setError(
          body?.error || "Fehler beim Erstellen. Bitte versuchen Sie es erneut."
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
          {/* Step 1: Name + PLZ */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="loc-name">Praxisname *</Label>
                <Input
                  id="loc-name"
                  placeholder="Zahnarztpraxis Dr. Müller — Filiale"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loc-plz">PLZ</Label>
                <Input
                  id="loc-plz"
                  placeholder="80331"
                  value={data.postalCode}
                  maxLength={5}
                  onChange={(e) =>
                    setData({ ...data, postalCode: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={() => setStep(2)}
                className="w-full"
                disabled={!data.name.trim()}
              >
                Weiter
              </Button>
            </>
          )}

          {/* Step 2: Google Places */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>Google-Eintrag des Standorts</Label>
                <p className="text-sm text-muted-foreground">
                  Damit zufriedene Patienten direkt zu Ihrer
                  Google-Bewertungsseite weitergeleitet werden.
                </p>
                <GooglePlacesSearch
                  value={data.googlePlaceId}
                  onChange={(placeId) =>
                    setData({ ...data, googlePlaceId: placeId })
                  }
                  selectedName=""
                  initialQuery={data.name || undefined}
                  postalCode={data.postalCode || undefined}
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
                <Button onClick={() => setStep(3)} className="flex-1">
                  {data.googlePlaceId ? "Weiter" : "Überspringen"}
                </Button>
              </div>
            </>
          )}

          {/* Step 3: Template */}
          {step === 3 && (
            <>
              <div className="space-y-3">
                <Label>Umfrage-Template wählen</Label>
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setData({ ...data, surveyTemplate: t.id })
                    }
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      data.surveyTemplate === t.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </button>
                ))}
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
                  disabled={loading}
                >
                  {loading ? "Wird erstellt..." : "Standort erstellen"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
