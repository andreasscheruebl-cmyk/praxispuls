"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
  label: string;
  color: string;
};

export function RatingCircles({ value, onChange, label, color }: Props) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="group relative flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all"
          style={{
            borderColor: n <= value ? color : "hsl(var(--border))",
            backgroundColor: n <= value ? color : "transparent",
            color: n <= value ? "white" : "hsl(var(--muted-foreground))",
          }}
          aria-label={`${n} von 5 für ${label}`}
        >
          {n}
        </button>
      ))}
    </div>
  );
}
