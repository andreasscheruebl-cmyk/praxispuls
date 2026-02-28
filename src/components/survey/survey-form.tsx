"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { buildSteps } from "@/lib/survey-steps";
import { canProceedStep } from "@/lib/survey-validation";
import { QUESTION_COMPONENTS } from "@/components/survey/questions";
import { trackEvent } from "@/lib/plausible";
import type { SurveyQuestion, SurveyAnswers } from "@/types";

type Props = {
  surveyId: string;
  practiceName: string;
  practiceColor: string;
  questions: SurveyQuestion[];
  respondentType: string;
};

type Status = "filling" | "submitting" | "done" | "duplicate" | "error";

type RoutingResult = {
  category: string;
  showGooglePrompt: boolean;
  googleReviewUrl: string | null;
};

export function SurveyForm({
  surveyId,
  practiceColor,
  questions,
  respondentType,
}: Props) {
  const steps = useMemo(() => buildSteps(questions), [questions]);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [status, setStatus] = useState<Status>("filling");
  const [routingResult, setRoutingResult] = useState<RoutingResult | null>(null);

  const currentStep = steps[stepIndex] as (typeof steps)[number] | undefined;
  const isLastStep = stepIndex === steps.length - 1;
  const isFreetextOnly =
    currentStep?.questions.length === 1 &&
    currentStep.questions[0]?.type === "freetext";
  const canProceed = currentStep ? canProceedStep(currentStep, answers) : false;

  function handleAnswer(questionId: string, value: number | string | boolean) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function submitSurvey() {
    setStatus("submitting");

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
          answers,
          channel: "qr",
          deviceType: /Mobi/.test(navigator.userAgent) ? "mobile" : "desktop",
          sessionHash,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.code === "DUPLICATE_RESPONSE") {
          setStatus("duplicate");
          return;
        }
        console.error("Survey submission error:", res.status, data);
        setStatus("error");
        return;
      }
      if (data.routing) {
        setRoutingResult(data.routing);
      }
      trackEvent("Survey Completed", { category: data.routing?.category || "unknown" });
      setStatus("done");
    } catch (err) {
      console.error("Survey submission failed:", err);
      setStatus("error");
    }
  }

  // ============ STATUS SCREENS ============

  if (status === "submitting") {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
        <p className="mt-4 text-muted-foreground">Wird gesendet...</p>
      </div>
    );
  }

  if (status === "done") {
    const isEmployee = respondentType === "mitarbeiter";

    // Promoter + patient → Google prompt
    if (!isEmployee && routingResult?.showGooglePrompt && routingResult.googleReviewUrl) {
      return (
        <div className="space-y-6 text-center">
          <div className="text-4xl">🎉</div>
          <h2 className="text-xl font-semibold">
            Vielen Dank für Ihr tolles Feedback!
          </h2>
          <p className="text-muted-foreground">
            Würden Sie Ihre positive Erfahrung auch auf Google teilen?
            Das hilft anderen bei der Suche.
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

    // Passive / Employee → Simple thank you
    return (
      <div className="space-y-6 text-center">
        <div className="text-4xl">✅</div>
        <h2 className="text-xl font-semibold">
          Vielen Dank für Ihr Feedback!
        </h2>
        <p className="text-muted-foreground">
          Ihre Rückmeldung hilft uns, uns stetig zu verbessern.
        </p>
      </div>
    );
  }

  if (status === "error") {
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
          onClick={() => {
            setStepIndex(steps.length - 1);
            setStatus("filling");
          }}
          variant="outline"
          size="lg"
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  if (status === "duplicate") {
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

  // ============ FILLING: Dynamic Step Rendering ============

  if (!currentStep) return null;

  const progress = steps.length > 0 ? ((stepIndex + 1) / steps.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div>
        <div className="mb-1 h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: practiceColor }}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Schritt {stepIndex + 1} von {steps.length}
        </p>
      </div>

      {/* Questions for current step */}
      <div className="space-y-4">
        {currentStep.questions.map((question) => {
          const Component = QUESTION_COMPONENTS[question.type];
          return (
            <Component
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(val) => handleAnswer(question.id, val)}
              color={practiceColor}
            />
          );
        })}
      </div>

      {/* Navigation buttons */}
      {isLastStep ? (
        <div className="flex gap-3">
          <Button
            onClick={submitSurvey}
            disabled={!canProceed && !isFreetextOnly}
            className="flex-1"
            size="lg"
            style={{ backgroundColor: practiceColor }}
          >
            Absenden
          </Button>
          {isFreetextOnly && (
            <Button onClick={submitSurvey} variant="ghost" size="lg">
              Überspringen
            </Button>
          )}
        </div>
      ) : (
        <Button
          onClick={() => setStepIndex((i) => i + 1)}
          disabled={!canProceed}
          className="w-full"
          size="lg"
          style={{ backgroundColor: practiceColor }}
        >
          Weiter
        </Button>
      )}
    </div>
  );
}
