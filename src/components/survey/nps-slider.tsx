"use client";

import { useState } from "react";

type Props = {
  value: number | null;
  onChange: (value: number) => void;
  color: string;
};

export function NpsSlider({ value, onChange, color }: Props) {
  const [dragging, setDragging] = useState(false);
  const displayValue = value ?? 5;

  return (
    <div className="space-y-4">
      <div className="relative px-2">
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={displayValue}
          onChange={(e) => onChange(parseInt(e.target.value))}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          className="nps-slider w-full"
          style={{
            ["--slider-color" as string]: color,
          }}
          aria-label="NPS Score"
        />
        {/* Tick marks */}
        <div className="mt-1 flex justify-between px-0.5">
          {Array.from({ length: 11 }, (_, i) => (
            <span
              key={i}
              className={`text-xs transition-all ${
                value === i ? "font-bold" : "text-muted-foreground"
              }`}
              style={value === i ? { color } : undefined}
            >
              {i}
            </span>
          ))}
        </div>
      </div>
      <div
        className={`text-center transition-all ${dragging ? "scale-110" : ""}`}
      >
        <span
          className="inline-flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {value !== null ? value : "–"}
        </span>
      </div>
      <style jsx>{`
        .nps-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            hsl(var(--muted)) 0%,
            var(--slider-color) 100%
          );
          outline: none;
        }
        .nps-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--slider-color);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border: 3px solid white;
        }
        .nps-slider::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--slider-color);
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border: 3px solid white;
        }
      `}</style>
    </div>
  );
}
