"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { NpsSlider } from "@/components/survey/nps-slider";
import { trackEvent } from "@/lib/plausible";

type Props = {
  surveyId: string;
  practiceName: string;
  practiceColor: string;
};

type Step = "nps" | "categories" | "freetext" | "submitting" | "done" | "duplicate" | "error";

export function SurveyForm({ surveyId, practiceName, practiceColor }: Props) {
  const [step, setStep] = useState<Step>("nps");
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [ratings, setRatings] = useState({
    waitTime: 0,
    friendliness: 0,
    treatment: 0,
    facility: 0,
  });
  const [freeText, setFreeText] = useState("");
  const [routingResult, setRoutingResult] = useState<{
    category: string;
    showGooglePrompt: boolean;
    googleReviewUrl: string | null;
  } | null>(null);

  async function submitSurvey() {
    setStep("submitting");

    // Generate session hash for deduplication (surveyId + date, no PII)
    const dateKey = new Date().toISOString().slice(0, 10);
    const raw = `${surveyId}-${dateKey}-${navigator.userAgent}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(raw));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sessionHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    try {
      const res = await fetch("/api/public/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId,
          npsScore,
          answers: {
            ...(ratings.waitTime ? { wait_time: ratings.waitTime } : {}),
            ...(ratings.friendliness ? { friendliness: ratings.friendliness } : {}),
            ...(ratings.treatment ? { treatment: ratings.treatment } : {}),
            ...(ratings.facility ? { facility: ratings.facility } : {}),
          },
          freeText: freeText || undefined,
          deviceType: /Mobi/.test(navigator.userAgent) ? "mobile" : "desktop",
          sessionHash,
        }),
      });

      if (!res.ok) {
        setStep("error");
        return;
      }
      const data = await res.json();
      if (data.code === "DUPLICATE_RESPONSE") {
        setStep("duplicate");
        return;
      }
      if (data.routing) {
        setRoutingResult(data.routing);
      }
      trackEvent("Survey Completed", { category: data.routing?.category || "unknown" });
      setStep("done");
    } catch {
      setStep("error");
    }
  }

  // ============ STEP: NPS ============
  if (step === "nps") {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-xl font-semibold">
          Wie wahrscheinlich ist es, dass Sie {practiceName} weiterempfehlen?
        </h2>
        <p className="text-sm text-muted-foreground">
          0 = sehr unwahrscheinlich · 10 = sehr wahrscheinlich
        </p>

        <div className="space-y-6">
          <NpsSlider
            value={npsScore}
            onChange={setNpsScore}
            color={practiceColor}
          />
          <Button
            onClick={() => { if (npsScore !== null) setStep("categories"); }}
            disabled={npsScore === null}
            className="w-full"
            size="lg"
            style={{ backgroundColor: practiceColor }}
          >
            Weiter
          </Button>
        </div>
      </div>
    );
  }

  // ============ STEP: CATEGORIES ============
  if (step === "categories") {
    const categories = [
      { key: "waitTime" as const, label: "Wartezeit" },
      { key: "friendliness" as const, label: "Freundlichkeit" },
      { key: "treatment" as const, label: "Behandlungsqualität" },
      { key: "facility" as const, label: "Praxisausstattung" },
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-center text-xl font-semibold">
          Wie bewerten Sie folgende Bereiche?
        </h2>
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.key} className="rounded-lg bg-white p-4 shadow-theme">
              <p className="mb-2 text-sm font-medium">{cat.label}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = star <= ratings[cat.key];
                  return (
                    <button
                      key={star}
                      onClick={() =>
                        setRatings((prev) => ({ ...prev, [cat.key]: star }))
                      }
                      className="p-1"
                      aria-label={`${star} Sterne für ${cat.label}`}
                    >
                      <Star
                        className={`h-8 w-8 ${isActive ? "" : "text-gray-300"}`}
                        style={
                          isActive
                            ? { fill: practiceColor, color: practiceColor }
                            : undefined
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={() => setStep("freetext")}
          className="w-full"
          size="lg"
          style={{ backgroundColor: practiceColor }}
        >
          Weiter
        </Button>
      </div>
    );
  }

  // ============ STEP: FREETEXT ============
  if (step === "freetext") {
    return (
      <div className="space-y-6">
        <h2 className="text-center text-xl font-semibold">
          Möchten Sie uns noch etwas mitteilen?
        </h2>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          placeholder="Ihr Feedback (optional)"
          className="w-full rounded-lg border border-gray-200 bg-white p-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
          rows={4}
          maxLength={2000}
        />
        <p className="text-xs text-muted-foreground">
          Bitte geben Sie keine persönlichen Daten (Name, Adresse, Gesundheitsinformationen) ein.
        </p>
        <div className="flex gap-3">
          <Button
            onClick={submitSurvey}
            className="flex-1"
            size="lg"
            style={{ backgroundColor: practiceColor }}
          >
            Absenden
          </Button>
          <Button
            onClick={submitSurvey}
            variant="ghost"
            size="lg"
          >
            Überspringen
          </Button>
        </div>
      </div>
    );
  }

  // ============ STEP: SUBMITTING ============
  if (step === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        <p className="mt-4 text-muted-foreground">Wird gesendet...</p>
      </div>
    );
  }

  // ============ STEP: DONE (with routing) ============
  if (step === "done") {
    // Promoter → Google prompt
    if (routingResult?.showGooglePrompt && routingResult.googleReviewUrl) {
      return (
        <div className="space-y-6 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-semibold">
            Vielen Dank für Ihr tolles Feedback!
          </h2>
          <p className="text-muted-foreground">
            Würden Sie Ihre positive Erfahrung auch auf Google teilen?
            Das hilft anderen Patienten bei der Suche.
          </p>
          <a
            href={routingResult.googleReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("Google Review Click")}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg px-8 text-base font-semibold text-white"
            style={{ backgroundColor: practiceColor }}
          >
            ⭐ Ja, gerne bewerten!
          </a>
          <button
            onClick={() => {}}
            className="block w-full text-sm text-muted-foreground hover:underline"
          >
            Nein, danke
          </button>
        </div>
      );
    }

    // Detractor → Empathy
    if (routingResult?.category === "detractor") {
      return (
        <div className="space-y-6 text-center">
          <div className="text-4xl">🙏</div>
          <h2 className="text-xl font-semibold">
            Danke für Ihre Ehrlichkeit.
          </h2>
          <p className="text-muted-foreground">
            Wir nehmen Ihr Feedback ernst und arbeiten daran, uns zu verbessern.
            Ihre Rückmeldung wird intern ausgewertet.
          </p>
        </div>
      );
    }

    // Passive → Simple thank you
    return (
      <div className="space-y-6 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-semibold">
          Vielen Dank für Ihr Feedback!
        </h2>
        <p className="text-muted-foreground">
          Ihre Rückmeldung hilft uns, unsere Praxis stetig zu verbessern.
        </p>
      </div>
    );
  }

  // ============ STEP: ERROR ============
  if (step === "error") {
    return (
      <div className="space-y-6 text-center">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-xl font-semibold">
          Leider ist ein Fehler aufgetreten.
        </h2>
        <p className="text-muted-foreground">
          Bitte versuchen Sie es in einigen Minuten erneut.
        </p>
        <Button
          onClick={() => setStep("freetext")}
          variant="outline"
          size="lg"
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  // ============ STEP: DUPLICATE ============
  if (step === "duplicate") {
    return (
      <div className="space-y-6 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-semibold">
          Vielen Dank — Sie haben bereits Feedback abgegeben.
        </h2>
        <p className="text-muted-foreground">
          Wir haben Ihre Rückmeldung erhalten und wissen sie zu schätzen!
        </p>
      </div>
    );
  }

  return null;
}
