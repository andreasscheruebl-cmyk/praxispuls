"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ComparisonPanel } from "./comparison-panel";
import {
  fetchSurveyStats,
  fetchTimeRangeStats,
  fetchLocationStats,
} from "@/actions/compare";
import type { ComparisonStats } from "@/lib/db/queries/compare";

// ============================================================
// TYPES (serializable from RSC)
// ============================================================

type SurveyOption = {
  id: string;
  title: string;
  responseCount: number;
};

type PracticeOption = {
  id: string;
  name: string;
};

type SharedTemplate = {
  templateId: string;
  templateName: string;
  practiceCount: number;
};

type ComparisonMode = "survey" | "time" | "location";

type ComparisonViewProps = {
  surveys: SurveyOption[];
  allPractices: PracticeOption[];
  activePracticeId: string;
  sharedTemplates: SharedTemplate[];
};

function isError(
  result: ComparisonStats | { error: string; code: string }
): result is { error: string; code: string } {
  return "error" in result;
}

// ============================================================
// MODE TABS
// ============================================================

const MODES: { value: ComparisonMode; label: string }[] = [
  { value: "survey", label: "Umfrage vs Umfrage" },
  { value: "time", label: "Zeitraum" },
  { value: "location", label: "Standorte" },
];

// ============================================================
// COMPONENT
// ============================================================

export function ComparisonView({
  surveys,
  allPractices,
  activePracticeId,
  sharedTemplates,
}: ComparisonViewProps) {
  const [activeMode, setActiveMode] = useState<ComparisonMode>("survey");
  const [isPending, startTransition] = useTransition();

  // Mode 1: Survey vs Survey
  const [surveyA, setSurveyA] = useState("");
  const [surveyB, setSurveyB] = useState("");
  const [statsA, setStatsA] = useState<ComparisonStats | null>(null);
  const [statsB, setStatsB] = useState<ComparisonStats | null>(null);

  // Mode 2: Time Range
  const [timeSurvey, setTimeSurvey] = useState("");
  const [fromA, setFromA] = useState("");
  const [toA, setToA] = useState("");
  const [fromB, setFromB] = useState("");
  const [toB, setToB] = useState("");
  const [timeStatsA, setTimeStatsA] = useState<ComparisonStats | null>(null);
  const [timeStatsB, setTimeStatsB] = useState<ComparisonStats | null>(null);

  // Mode 3: Location
  const [locTemplate, setLocTemplate] = useState("");
  const [locPracticeA, setLocPracticeA] = useState(activePracticeId);
  const [locPracticeB, setLocPracticeB] = useState("");
  const [locStatsA, setLocStatsA] = useState<ComparisonStats | null>(null);
  const [locStatsB, setLocStatsB] = useState<ComparisonStats | null>(null);

  // ── Mode 1 handlers ──

  function loadSurveyComparison(idA: string, idB: string) {
    if (!idA || !idB) return;
    startTransition(async () => {
      const [resA, resB] = await Promise.all([
        fetchSurveyStats({ surveyId: idA }),
        fetchSurveyStats({ surveyId: idB }),
      ]);
      setStatsA(isError(resA) ? null : resA);
      setStatsB(isError(resB) ? null : resB);
    });
  }

  function onSurveyAChange(id: string) {
    setSurveyA(id);
    loadSurveyComparison(id, surveyB);
  }

  function onSurveyBChange(id: string) {
    setSurveyB(id);
    loadSurveyComparison(surveyA, id);
  }

  // ── Mode 2 handlers ──

  function loadTimeComparison() {
    if (!timeSurvey || !fromA || !toA || !fromB || !toB) return;
    startTransition(async () => {
      const [resA, resB] = await Promise.all([
        fetchTimeRangeStats({
          surveyId: timeSurvey,
          from: new Date(fromA).toISOString(),
          to: new Date(toA).toISOString(),
        }),
        fetchTimeRangeStats({
          surveyId: timeSurvey,
          from: new Date(fromB).toISOString(),
          to: new Date(toB).toISOString(),
        }),
      ]);
      setTimeStatsA(isError(resA) ? null : resA);
      setTimeStatsB(isError(resB) ? null : resB);
    });
  }

  // ── Mode 3 handlers ──

  function loadLocationComparison(templateId: string, practA: string, practB: string) {
    if (!templateId || !practA || !practB) return;
    startTransition(async () => {
      const [resA, resB] = await Promise.all([
        fetchLocationStats({ templateId, practiceId: practA }),
        fetchLocationStats({ templateId, practiceId: practB }),
      ]);
      setLocStatsA(isError(resA) ? null : resA);
      setLocStatsB(isError(resB) ? null : resB);
    });
  }

  function onLocTemplateChange(id: string) {
    setLocTemplate(id);
    loadLocationComparison(id, locPracticeA, locPracticeB);
  }

  function onLocPracticeAChange(id: string) {
    setLocPracticeA(id);
    loadLocationComparison(locTemplate, id, locPracticeB);
  }

  function onLocPracticeBChange(id: string) {
    setLocPracticeB(id);
    loadLocationComparison(locTemplate, locPracticeA, id);
  }

  // ── Helpers ──

  function getSurveyTitle(id: string) {
    return surveys.find((s) => s.id === id)?.title ?? "—";
  }

  function getPracticeName(id: string) {
    return allPractices.find((p) => p.id === id)?.name ?? "—";
  }

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* Tab Toggle */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((mode) => (
          <Button
            key={mode.value}
            variant={activeMode === mode.value ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveMode(mode.value)}
          >
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Mode selectors */}
      <div className="space-y-4">
        {activeMode === "survey" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Umfrage A</label>
              <Select value={surveyA} onValueChange={onSurveyAChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Umfrage wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {surveys.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title} ({s.responseCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Umfrage B</label>
              <Select value={surveyB} onValueChange={onSurveyBChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Umfrage wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {surveys.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title} ({s.responseCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeMode === "time" && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Umfrage</label>
              <Select value={timeSurvey} onValueChange={setTimeSurvey}>
                <SelectTrigger className="max-w-sm">
                  <SelectValue placeholder="Umfrage wählen…" />
                </SelectTrigger>
                <SelectContent>
                  {surveys.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.title} ({s.responseCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <fieldset className="space-y-2 rounded-md border p-3">
                <legend className="px-1 text-sm font-medium">Zeitraum A</legend>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="rounded-md border px-3 py-2 text-sm"
                    value={fromA}
                    onChange={(e) => setFromA(e.target.value)}
                  />
                  <span className="self-center text-sm text-muted-foreground">bis</span>
                  <input
                    type="date"
                    className="rounded-md border px-3 py-2 text-sm"
                    value={toA}
                    onChange={(e) => setToA(e.target.value)}
                  />
                </div>
              </fieldset>
              <fieldset className="space-y-2 rounded-md border p-3">
                <legend className="px-1 text-sm font-medium">Zeitraum B</legend>
                <div className="flex gap-2">
                  <input
                    type="date"
                    className="rounded-md border px-3 py-2 text-sm"
                    value={fromB}
                    onChange={(e) => setFromB(e.target.value)}
                  />
                  <span className="self-center text-sm text-muted-foreground">bis</span>
                  <input
                    type="date"
                    className="rounded-md border px-3 py-2 text-sm"
                    value={toB}
                    onChange={(e) => setToB(e.target.value)}
                  />
                </div>
              </fieldset>
            </div>
            <Button
              size="sm"
              onClick={loadTimeComparison}
              disabled={!timeSurvey || !fromA || !toA || !fromB || !toB || isPending}
            >
              Vergleichen
            </Button>
          </div>
        )}

        {activeMode === "location" && (
          <>
            {allPractices.length < 2 ? (
              <p className="text-sm text-muted-foreground">
                Mindestens 2 Standorte benötigt für den Standort-Vergleich.
              </p>
            ) : sharedTemplates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine gemeinsamen Vorlagen zwischen Ihren Standorten gefunden.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Vorlage</label>
                  <Select value={locTemplate} onValueChange={onLocTemplateChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vorlage wählen…" />
                    </SelectTrigger>
                    <SelectContent>
                      {sharedTemplates.map((t) => (
                        <SelectItem key={t.templateId} value={t.templateId}>
                          {t.templateName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Standort A</label>
                  <Select value={locPracticeA} onValueChange={onLocPracticeAChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Standort wählen…" />
                    </SelectTrigger>
                    <SelectContent>
                      {allPractices.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Standort B</label>
                  <Select value={locPracticeB} onValueChange={onLocPracticeBChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Standort wählen…" />
                    </SelectTrigger>
                    <SelectContent>
                      {allPractices.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Comparison Panels */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {activeMode === "survey" && (
          <>
            <ComparisonPanel
              label={surveyA ? getSurveyTitle(surveyA) : "Umfrage A"}
              data={statsA}
              isLoading={isPending && !!surveyA && !!surveyB}
            />
            <ComparisonPanel
              label={surveyB ? getSurveyTitle(surveyB) : "Umfrage B"}
              data={statsB}
              isLoading={isPending && !!surveyA && !!surveyB}
            />
          </>
        )}

        {activeMode === "time" && (
          <>
            <ComparisonPanel
              label="Zeitraum A"
              sublabel={fromA && toA ? `${fromA} – ${toA}` : undefined}
              data={timeStatsA}
              isLoading={isPending}
            />
            <ComparisonPanel
              label="Zeitraum B"
              sublabel={fromB && toB ? `${fromB} – ${toB}` : undefined}
              data={timeStatsB}
              isLoading={isPending}
            />
          </>
        )}

        {activeMode === "location" && allPractices.length >= 2 && sharedTemplates.length > 0 && (
          <>
            <ComparisonPanel
              label={locPracticeA ? getPracticeName(locPracticeA) : "Standort A"}
              data={locStatsA}
              isLoading={isPending && !!locTemplate && !!locPracticeA && !!locPracticeB}
            />
            <ComparisonPanel
              label={locPracticeB ? getPracticeName(locPracticeB) : "Standort B"}
              data={locStatsB}
              isLoading={isPending && !!locTemplate && !!locPracticeA && !!locPracticeB}
            />
          </>
        )}
      </div>
    </div>
  );
}
