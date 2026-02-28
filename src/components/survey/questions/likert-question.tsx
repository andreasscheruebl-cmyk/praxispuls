"use client";

import type { QuestionProps } from "./index";

const LIKERT_LABELS = [
  { value: 1, label: "Stimme nicht zu" },
  { value: 2, label: "Stimme eher nicht zu" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Stimme eher zu" },
  { value: 5, label: "Stimme voll zu" },
];

export function LikertQuestion({ question, value, onChange, color }: QuestionProps) {
  const currentValue = typeof value === "number" ? value : 0;

  return (
    <div className="rounded-lg bg-white p-4 shadow-theme">
      <p className="mb-3 text-sm font-medium">{question.label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-1">
        {LIKERT_LABELS.map(({ value: v, label }) => {
          const isActive = currentValue === v;
          return (
            <button
              key={v}
              onClick={() => onChange(v)}
              className="min-h-[44px] flex-1 rounded-lg border px-2 py-2 text-xs font-medium transition-colors"
              style={
                isActive
                  ? { backgroundColor: color, color: "#fff", borderColor: color }
                  : undefined
              }
              aria-label={`${label} für ${question.label}`}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
