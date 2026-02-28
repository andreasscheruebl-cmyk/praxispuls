"use client";

import type { QuestionProps } from "./index";

export function SingleChoiceQuestion({ question, value, onChange, color }: QuestionProps) {
  const selected = typeof value === "string" ? value : "";
  const options = question.options ?? [];

  return (
    <div className="rounded-lg bg-white p-4 shadow-theme">
      <p className="mb-3 text-sm font-medium">{question.label}</p>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isActive = selected === option;
          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className="min-h-[44px] rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors"
              style={
                isActive
                  ? { backgroundColor: color, color: "#fff", borderColor: color }
                  : undefined
              }
              aria-pressed={isActive}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
