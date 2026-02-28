"use client";

import { Clock, FileText, Loader2 } from "lucide-react";

// ============================================================
// Types
// ============================================================

type TemplateOption = {
  id: string;
  name: string;
  description: string | null;
  questionCount: number;
};

type TemplateQuickSelectProps = {
  templates: TemplateOption[];
  value: string | null;
  onChange: (templateId: string) => void;
  loading?: boolean;
};

// ============================================================
// Helpers
// ============================================================

function estimateDuration(questionCount: number): string {
  if (questionCount <= 2) return "~30 Sek.";
  if (questionCount <= 5) return "~1 Min.";
  if (questionCount <= 8) return "~2 Min.";
  return "~3 Min.";
}

// ============================================================
// Component
// ============================================================

export function TemplateQuickSelect({
  templates,
  value,
  onChange,
  loading,
}: TemplateQuickSelectProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Templates werden geladen…
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        Keine Templates für diese Branche verfügbar.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {templates.map((t) => {
        const isSelected = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`w-full rounded-lg border p-4 text-left transition-colors ${
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted/50"
            }`}
          >
            <p className="font-medium">{t.name}</p>
            {t.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
            )}
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {t.questionCount} Fragen
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {estimateDuration(t.questionCount)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
