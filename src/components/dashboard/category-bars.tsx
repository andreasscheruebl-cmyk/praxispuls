"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { CategoryScore } from "@/lib/db/queries/compare";

type CategoryBarsProps = {
  categories: CategoryScore[];
  color?: string;
};

export const CategoryBars = memo(function CategoryBars({
  categories,
  color = "#0D9488",
}: CategoryBarsProps) {
  if (categories.length === 0) return null;

  // Normalize scores to percentage for comparable display
  const data = categories.map((c) => ({
    name: c.category,
    score: c.avgScore,
    maxScore: c.maxScore,
    pct: Math.round((c.avgScore / c.maxScore) * 100),
    responseCount: c.responseCount,
  }));

  const barHeight = 32;
  const chartHeight = Math.max(data.length * barHeight + 40, 80);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 12, bottom: 0, left: 0 }}
      >
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload as (typeof data)[number];
            return (
              <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md">
                <p className="font-medium">{d.name}</p>
                <p style={{ color }}>
                  {d.score} / {d.maxScore} ({d.pct}%)
                </p>
                <p className="text-muted-foreground">
                  {d.responseCount} Antworten
                </p>
              </div>
            );
          }}
        />
        <Bar
          dataKey="pct"
          fill={color}
          radius={[0, 4, 4, 0]}
          barSize={18}
        />
      </BarChart>
    </ResponsiveContainer>
  );
});
