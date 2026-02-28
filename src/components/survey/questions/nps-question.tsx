"use client";

import { NpsSlider } from "@/components/survey/nps-slider";
import type { QuestionProps } from "./index";

export function NpsQuestion({ question, value, onChange, color }: QuestionProps) {
  const numValue = typeof value === "number" ? value : null;

  return (
    <div className="space-y-4 text-center">
      <h3 className="text-lg font-semibold">{question.label}</h3>
      <p className="text-sm text-muted-foreground">
        0 = sehr unwahrscheinlich · 10 = sehr wahrscheinlich
      </p>
      <NpsSlider
        value={numValue}
        onChange={(v) => onChange(v)}
        color={color}
      />
    </div>
  );
}
