"use client";

import { memo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type RegistrationPoint = {
  date: string;
  count: number;
  label: string;
};

export const RegistrationsChart = memo(function RegistrationsChart({
  data,
}: {
  data: RegistrationPoint[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Keine Registrierungen in den letzten 30 Tagen.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const point = payload[0]?.payload as RegistrationPoint;
            return (
              <div className="rounded-md border bg-white px-3 py-2 text-sm shadow-md">
                <p className="font-medium">{point.date}</p>
                <p className="text-emerald-600">
                  {point.count} {point.count === 1 ? "Registrierung" : "Registrierungen"}
                </p>
              </div>
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.1}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
});
