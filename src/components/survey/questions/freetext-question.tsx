"use client";

import type { QuestionProps } from "./index";

export function FreetextQuestion({ question, value, onChange }: QuestionProps) {
  const textValue = typeof value === "string" ? value : "";

  return (
    <div className="space-y-4">
      <h3 className="text-center text-lg font-semibold">{question.label}</h3>
      <textarea
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ihr Feedback (optional)"
        className="w-full rounded-lg border border-gray-200 bg-white p-4 text-base focus:outline-none focus:ring-2 focus:ring-primary"
        rows={4}
        maxLength={2000}
      />
      <p className="text-xs text-muted-foreground">
        Bitte geben Sie keine persönlichen Daten (Name, Adresse, Gesundheitsinformationen) ein.
      </p>
    </div>
  );
}
