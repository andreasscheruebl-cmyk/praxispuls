import { ArrowUp, Star, TrendingUp } from "lucide-react";

const PREMIUM_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.08)]";
const BADGE_SHADOW =
  "shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_4px_12px_rgba(0,0,0,0.08),0_20px_48px_rgba(0,0,0,0.06)]";

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );
}

function StarsMobile() {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3 w-3 fill-current" />
      ))}
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Teal glow behind dashboard */}
      <div className="hero-glow absolute -inset-8 rounded-[32px] bg-[radial-gradient(ellipse_at_50%_40%,hsl(174_84%_30%/0.14),transparent_70%)]" />

      {/* === DESKTOP / TABLET === */}
      <div className="relative hidden md:block">
        {/* Main dashboard frame */}
        <div
          className={`hero-frame relative overflow-hidden rounded-2xl bg-white ${PREMIUM_SHADOW}`}
        >
          {/* Window chrome header */}
          <div className="flex items-center gap-2 border-b border-black/[0.06] bg-gradient-to-r from-teal-50/80 to-transparent px-5 py-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-teal-300/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal-200/60" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal-100/60" />
            </div>
            <span className="ml-2 text-[11px] font-medium tracking-wide text-teal-700/50">
              PraxisPuls
            </span>
          </div>

          {/* Dashboard body */}
          <div className="space-y-5 p-5 lg:p-6">
            {/* Row 1: Google rating */}
            <div className="hero-row-1 flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50/60 to-transparent p-4">
              <div className="flex items-center gap-3">
                <Stars />
                <span className="text-3xl font-bold tracking-tight text-foreground">
                  4,9
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">
                  Google-Bewertung
                </p>
                <p className="text-xs text-muted-foreground">
                  142 Bewertungen
                </p>
              </div>
            </div>

            {/* Row 2: Three metric tiles */}
            <div className="hero-row-2 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-teal-50/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">312</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Antworten
                </p>
              </div>
              <div className="rounded-xl bg-teal-50/50 p-4 text-center">
                <p className="text-2xl font-bold text-primary">94%</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Zufriedenheit
                </p>
              </div>
              <div className="rounded-xl bg-teal-50/50 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">9,1</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Ø Bewertung
                </p>
              </div>
            </div>

            {/* Row 3: Bar chart */}
            <div className="hero-row-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Antworten (letzte 7 Tage)
              </p>
              <div className="flex items-end gap-2 h-16">
                <div className="w-full rounded bg-teal-100 h-[35%]" />
                <div className="w-full rounded bg-teal-200/80 h-[50%]" />
                <div className="w-full rounded bg-teal-200 h-[40%]" />
                <div className="w-full rounded bg-teal-300/80 h-[65%]" />
                <div className="w-full rounded bg-teal-300 h-[55%]" />
                <div className="w-full rounded bg-teal-400/80 h-[80%]" />
                <div className="w-full rounded bg-teal-500 h-full" />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground/60">
                <span>Mo</span>
                <span>Di</span>
                <span>Mi</span>
                <span>Do</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>So</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating badge: survey score (top-left overlap) */}
        <div
          className={`hero-badge-1 absolute -left-4 -top-4 z-10 w-[130px] rounded-xl bg-white p-3.5 ${BADGE_SHADOW} lg:-left-6 lg:-top-5`}
        >
          <p className="text-center text-[10px] font-medium text-muted-foreground">
            Letzte Umfrage
          </p>
          <div className="mt-1.5 flex items-baseline justify-center gap-0.5">
            <span className="text-3xl font-bold text-primary">9</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
            <div className="h-full w-[90%] rounded-full bg-primary" />
          </div>
        </div>

        {/* Floating badge: review notification (bottom-right overlap) */}
        <div
          className={`hero-badge-2 absolute -bottom-4 -right-3 z-10 flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 ${BADGE_SHADOW} lg:-bottom-5 lg:-right-5`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              +12 Bewertungen
            </p>
            <p className="text-[11px] text-muted-foreground">diese Woche</p>
          </div>
          <ArrowUp className="h-4 w-4 text-emerald-500" />
        </div>
      </div>

      {/* === MOBILE === */}
      <div className="relative grid grid-cols-2 gap-3 md:hidden">
        {/* Google rating */}
        <div
          className={`hero-card-1 rounded-xl bg-white p-4 ${PREMIUM_SHADOW}`}
        >
          <StarsMobile />
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">4,9</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            142 Bewertungen
          </p>
        </div>

        {/* Metrics */}
        <div
          className={`hero-card-2 rounded-xl bg-white p-4 ${PREMIUM_SHADOW}`}
        >
          <p className="text-[10px] font-medium text-muted-foreground">
            Dashboard
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div>
              <p className="text-lg font-bold">312</p>
              <p className="text-[10px] text-muted-foreground">Antworten</p>
            </div>
            <div>
              <p className="text-lg font-bold text-primary">94%</p>
              <p className="text-[10px] text-muted-foreground">Zufrieden</p>
            </div>
          </div>
        </div>

        {/* Survey score */}
        <div
          className={`hero-card-3 rounded-xl bg-white p-4 ${PREMIUM_SHADOW}`}
        >
          <p className="text-[10px] font-medium text-muted-foreground">
            Umfrage
          </p>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-primary">9</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
            <div className="h-full w-[90%] rounded-full bg-primary" />
          </div>
        </div>

        {/* Reviews */}
        <div
          className={`hero-card-4 flex items-center gap-2.5 rounded-xl bg-white p-4 ${PREMIUM_SHADOW}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold">+12</p>
            <p className="text-[10px] text-muted-foreground">diese Woche</p>
          </div>
        </div>
      </div>
    </div>
  );
}
