"use client";

import { memo } from "react";

type CategoryScore = {
  label: string;
  value: number | null;
};

type Props = {
  categories: CategoryScore[];
  color: string;
};

export const CategoryBars = memo(function CategoryBars({ categories, color }: Props) {
  return (
    <div className="space-y-4">
      {categories.map((cat) => {
        const percent = cat.value !== null ? (cat.value / 5) * 100 : 0;
        return (
          <div key={cat.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{cat.label}</span>
              <span className="text-muted-foreground">
                {cat.value !== null ? cat.value.toFixed(1) : "–"} / 5
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted/50">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});
