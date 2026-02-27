"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import type { SurveyQuestion, SurveyQuestionType } from "@/types";
import type { SurveyTemplateRow } from "@/lib/db/schema";

const MAX_CUSTOM_QUESTIONS = 3;

const QUESTION_TYPE_LABELS: Record<string, string> = {
  nps: "NPS",
  stars: "Sterne",
  freetext: "Freitext",
  enps: "eNPS",
  likert: "Likert",
  "single-choice": "Single Choice",
  "yes-no": "Ja/Nein",
};

const ADDABLE_TYPES: { value: SurveyQuestionType; label: string }[] = [
  { value: "stars", label: "Sterne (1–5)" },
  { value: "likert", label: "Likert-Skala" },
  { value: "single-choice", label: "Single Choice" },
  { value: "yes-no", label: "Ja/Nein" },
  { value: "freetext", label: "Freitext" },
];

// NPS and eNPS are core metrics and cannot be disabled
function isCorQuestion(q: SurveyQuestion): boolean {
  return q.type === "nps" || q.type === "enps";
}

interface TemplateCustomizerProps {
  template: SurveyTemplateRow;
  onCustomize: (questions: SurveyQuestion[]) => void;
}

export function TemplateCustomizer({
  template,
  onCustomize,
}: TemplateCustomizerProps) {
  const templateQuestions = (template.questions ?? []) as SurveyQuestion[];

  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [labelOverrides, setLabelOverrides] = useState<Record<string, string>>({});
  const [customQuestions, setCustomQuestions] = useState<SurveyQuestion[]>([]);

  function toggleQuestion(id: string) {
    const next = new Set(disabledIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setDisabledIds(next);
    emitChange(next, labelOverrides, customQuestions);
  }

  function updateLabel(id: string, label: string) {
    const next = { ...labelOverrides, [id]: label };
    setLabelOverrides(next);
    emitChange(disabledIds, next, customQuestions);
  }

  function addCustomQuestion() {
    if (customQuestions.length >= MAX_CUSTOM_QUESTIONS) return;
    const q: SurveyQuestion = {
      id: `custom_${Date.now()}`,
      type: "stars",
      label: "",
      required: false,
    };
    const next = [...customQuestions, q];
    setCustomQuestions(next);
    emitChange(disabledIds, labelOverrides, next);
  }

  function removeCustomQuestion(index: number) {
    const next = customQuestions.filter((_, i) => i !== index);
    setCustomQuestions(next);
    emitChange(disabledIds, labelOverrides, next);
  }

  function updateCustomQuestion(index: number, updates: Partial<SurveyQuestion>) {
    const next = customQuestions.map((q, i) =>
      i === index ? { ...q, ...updates } : q
    );
    setCustomQuestions(next);
    emitChange(disabledIds, labelOverrides, next);
  }

  function emitChange(
    disabled: Set<string>,
    labels: Record<string, string>,
    custom: SurveyQuestion[]
  ) {
    const active = templateQuestions
      .filter((q) => !disabled.has(q.id))
      .map((q) => ({
        ...q,
        label: labels[q.id] || q.label,
      }));

    const validCustom = custom.filter((q) => q.label.trim());
    onCustomize([...active, ...validCustom]);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {templateQuestions.map((q) => {
          const isCore = isCorQuestion(q);
          const isDisabled = disabledIds.has(q.id);
          const overriddenLabel = labelOverrides[q.id];

          return (
            <div
              key={q.id}
              className={`rounded-lg border p-3 transition-opacity ${
                isDisabled ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Switch
                  checked={!isDisabled}
                  onCheckedChange={() => toggleQuestion(q.id)}
                  disabled={isCore}
                />
                <div className="flex-1 min-w-0">
                  <Input
                    value={overriddenLabel ?? q.label}
                    onChange={(e) => updateLabel(q.id, e.target.value)}
                    disabled={isDisabled}
                    className="h-8 border-0 bg-transparent p-0 text-sm focus-visible:ring-0 disabled:opacity-50"
                  />
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {QUESTION_TYPE_LABELS[q.type] ?? q.type}
                </Badge>
                {isCore && (
                  <Badge className="shrink-0 text-xs bg-red-50 text-red-700 border-red-200">
                    Pflicht
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom questions */}
      {customQuestions.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Eigene Fragen</Label>
          {customQuestions.map((q, i) => (
            <div key={q.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Eigene Frage {i + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomQuestion(i)}
                  className="h-6 w-6 p-0 text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Select
                  value={q.type}
                  onValueChange={(v) =>
                    updateCustomQuestion(i, { type: v as SurveyQuestionType })
                  }
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADDABLE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={q.label}
                  onChange={(e) =>
                    updateCustomQuestion(i, { label: e.target.value })
                  }
                  placeholder="Frage-Text..."
                  className="h-8"
                />
              </div>
              {q.type === "single-choice" && (
                <Input
                  value={q.options?.join(", ") ?? ""}
                  onChange={(e) =>
                    updateCustomQuestion(i, {
                      options: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Option 1, Option 2, ..."
                  className="h-8"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {customQuestions.length < MAX_CUSTOM_QUESTIONS && (
        <Button
          variant="outline"
          size="sm"
          onClick={addCustomQuestion}
          className="w-full"
        >
          <Plus className="mr-1 h-4 w-4" />
          Eigene Frage hinzufügen ({customQuestions.length}/{MAX_CUSTOM_QUESTIONS})
        </Button>
      )}
    </div>
  );
}
