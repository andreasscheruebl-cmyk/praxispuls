"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

type NpsTrendPoint = {
  week: string;
  label: string;
  nps: number;
  responses: number;
  promoters: number;
  detractors: number;
};

export const NpsChart = memo(function NpsChart({ data, color = "#2563eb" }: { data: NpsTrendPoint[]; color?: string }) {
  if (data.length < 2) {
    return (
      <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
        Mindestens 2 Wochen mit Daten nötig für den Trend-Chart.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[-100, 100]}
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${v}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const point = payload[0]?.payload as NpsTrendPoint;
            return (
              <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md">
                <p className="font-medium">KW {point.week}</p>
                <p style={{ color }}>Empfehlung: {point.nps}</p>
                <p className="text-muted-foreground">
                  {point.responses} Antworten ({point.promoters} Zufriedene, {point.detractors} Kritiker)
                </p>
              </div>
            );
          }}
        />
        <ReferenceLine y={0} stroke="#d1d5db" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="nps"
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4, fill: color }}
          activeDot={{ r: 6, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});
