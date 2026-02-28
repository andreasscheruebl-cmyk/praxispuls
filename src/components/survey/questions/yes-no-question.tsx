"use client";

import type { QuestionProps } from "./index";

export function YesNoQuestion({ question, value, onChange, color }: QuestionProps) {
  const boolValue = typeof value === "boolean" ? value : undefined;

  return (
    <div className="rounded-lg bg-white p-4 shadow-theme">
      <p className="mb-3 text-sm font-medium">{question.label}</p>
      <div className="flex gap-3">
        <button
          onClick={() => onChange(true)}
          className="min-h-[44px] flex-1 rounded-lg border px-4 py-3 text-base font-semibold transition-colors"
          style={
            boolValue === true
              ? { backgroundColor: color, color: "#fff", borderColor: color }
              : undefined
          }
          aria-pressed={boolValue === true}
        >
          Ja
        </button>
        <button
          onClick={() => onChange(false)}
          className="min-h-[44px] flex-1 rounded-lg border px-4 py-3 text-base font-semibold transition-colors"
          style={
            boolValue === false
              ? { backgroundColor: color, color: "#fff", borderColor: color }
              : undefined
          }
          aria-pressed={boolValue === false}
        >
          Nein
        </button>
      </div>
    </div>
  );
}
