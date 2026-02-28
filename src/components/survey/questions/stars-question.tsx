"use client";

import { Star } from "lucide-react";
import type { QuestionProps } from "./index";

export function StarsQuestion({ question, value, onChange, color }: QuestionProps) {
  const currentRating = typeof value === "number" ? value : 0;

  return (
    <div className="rounded-lg bg-white p-4 shadow-theme">
      <p className="mb-3 text-sm font-medium">{question.label}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isActive = star <= currentRating;
          return (
            <button
              key={star}
              onClick={() => onChange(star)}
              className="min-h-[44px] min-w-[44px] p-1"
              aria-label={`${star} ${star === 1 ? "Stern" : "Sterne"} für ${question.label}`}
            >
              <Star
                className={`h-8 w-8 ${isActive ? "" : "text-gray-300"}`}
                style={
                  isActive
                    ? { fill: color, color: color }
                    : undefined
                }
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
