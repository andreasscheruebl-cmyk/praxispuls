"use client";

// Review funnel visualization component
// Shows the conversion pipeline: Responses → Promoters → Google Shown → Google Clicked

type ReviewFunnelData = {
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  googleShown: number;
  googleClicked: number;
  conversionRate: number | null;
};

type FunnelStep = {
  label: string;
  count: number;
  color: string;
  bgColor: string;
};

function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function ReviewFunnel({ data }: { data: ReviewFunnelData }) {
  if (data.totalResponses === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        Noch keine Daten
      </div>
    );
  }

  const steps: FunnelStep[] = [
    {
      label: "Antworten",
      count: data.totalResponses,
      color: "text-blue-700",
      bgColor: "bg-blue-500",
    },
    {
      label: "Promoter",
      count: data.promoters,
      color: "text-green-700",
      bgColor: "bg-green-500",
    },
    {
      label: "Google angezeigt",
      count: data.googleShown,
      color: "text-yellow-700",
      bgColor: "bg-yellow-500",
    },
    {
      label: "Google geklickt",
      count: data.googleClicked,
      color: "text-orange-700",
      bgColor: "bg-orange-500",
    },
  ];

  const maxCount = data.totalResponses;

  return (
    <div className="space-y-6">
      {/* Funnel bars */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          // Calculate bar width as percentage relative to total responses
          const widthPercent =
            maxCount > 0
              ? Math.max((step.count / maxCount) * 100, 2)
              : 0;

          // Calculate percentage relative to previous step
          const prevStep = index > 0 ? steps[index - 1] : undefined;
          const prevCount = prevStep ? prevStep.count : step.count;
          const stepPercentage = formatPercentage(step.count, prevCount);
          const totalPercentage = formatPercentage(step.count, maxCount);

          return (
            <div key={step.label} className="space-y-1">
              {/* Label row */}
              <div className="flex items-center justify-between text-sm">
                <span className={`font-medium ${step.color}`}>
                  {step.label}
                </span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {step.count}
                  </span>
                  {" "}
                  ({totalPercentage} gesamt
                  {index > 0 && ` · ${stepPercentage} vom Vorschritt`})
                </span>
              </div>
              {/* Bar */}
              <div className="h-8 w-full rounded-md bg-muted/50">
                <div
                  className={`h-full rounded-md ${step.bgColor} transition-all duration-500 ease-out`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Connector arrows between steps (visual indicator) */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Antworten</span>
        <span>→</span>
        <span>Promoter</span>
        <span>→</span>
        <span>Google angezeigt</span>
        <span>→</span>
        <span>Google geklickt</span>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 md:grid-cols-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Promoter-Anteil</p>
          <p className="mt-1 text-lg font-bold text-green-600">
            {formatPercentage(data.promoters, data.totalResponses)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Passive</p>
          <p className="mt-1 text-lg font-bold text-gray-600">
            {data.passives}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Kritiker</p>
          <p className="mt-1 text-lg font-bold text-red-600">
            {data.detractors}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Conversion (Promoter → Klick)
          </p>
          <p className="mt-1 text-lg font-bold text-orange-600">
            {data.conversionRate !== null ? `${data.conversionRate}%` : "–"}
          </p>
        </div>
      </div>
    </div>
  );
}
