"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

type PlanData = {
  name: string;
  count: number;
  color: string;
};

const PLAN_COLORS: Record<string, string> = {
  Free: "#94a3b8",
  Starter: "#3b82f6",
  Professional: "#8b5cf6",
};

export const PlanDistributionChart = memo(function PlanDistributionChart({
  data,
}: {
  data: PlanData[];
}) {
  if (data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Noch keine Praxen registriert.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const item = payload[0]?.payload as PlanData;
            return (
              <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md">
                <p className="font-medium">{item.name}</p>
                <p style={{ color: item.color }}>
                  {item.count} {item.count === 1 ? "Praxis" : "Praxen"}
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={PLAN_COLORS[entry.name] ?? "#94a3b8"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
});
