import { ArrowUp, BarChart3, Star, TrendingUp } from "lucide-react";

function GoogleStarsCard() {
  return (
    <div className="hero-card-1 absolute left-[5%] top-0 z-20 w-[250px] rounded-xl bg-white p-6 shadow-lg ring-1 ring-black/[0.04]">
      <p className="text-sm font-medium text-muted-foreground">
        Google-Bewertung
      </p>
      <div className="mt-2 flex items-baseline gap-2.5">
        <span className="text-5xl font-bold text-foreground">4,9</span>
        <div className="flex gap-0.5 text-amber-400">
          <Star className="h-5 w-5 fill-current" />
          <Star className="h-5 w-5 fill-current" />
          <Star className="h-5 w-5 fill-current" />
          <Star className="h-5 w-5 fill-current" />
          <Star className="h-5 w-5 fill-current" />
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">142 Bewertungen</p>
    </div>
  );
}

function DashboardCard() {
  return (
    <div className="hero-card-2 absolute left-0 top-[125px] z-10 w-[290px] rounded-xl bg-white p-6 shadow-lg ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-foreground">312</p>
          <p className="text-xs text-muted-foreground">Antworten</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">94%</p>
          <p className="text-xs text-muted-foreground">Zufriedenheit</p>
        </div>
      </div>
      {/* Mini bar chart */}
      <div className="mt-4 flex items-end gap-1.5 h-10">
        <div className="w-full rounded-sm bg-primary/20 h-[40%]" />
        <div className="w-full rounded-sm bg-primary/30 h-[55%]" />
        <div className="w-full rounded-sm bg-primary/40 h-[45%]" />
        <div className="w-full rounded-sm bg-primary/50 h-[70%]" />
        <div className="w-full rounded-sm bg-primary/60 h-[60%]" />
        <div className="w-full rounded-sm bg-primary/70 h-[85%]" />
        <div className="w-full rounded-sm bg-primary h-full" />
      </div>
    </div>
  );
}

function SurveyPhoneCard() {
  return (
    <div className="hero-card-3 absolute right-[5%] top-[15px] z-30 w-[195px] rounded-2xl bg-white p-6 shadow-lg ring-1 ring-black/[0.04]">
      <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-muted" />
      <p className="text-center text-xs leading-snug text-muted-foreground">
        Wie wahrscheinlich empfehlen Sie uns weiter?
      </p>
      <div className="mt-5 flex items-baseline justify-center gap-1">
        <span className="text-6xl font-bold text-primary">9</span>
        <span className="text-xl text-muted-foreground">/ 10</span>
      </div>
      {/* Slider bar */}
      <div className="mt-5 h-2.5 w-full rounded-full bg-muted">
        <div className="h-full w-[90%] rounded-full bg-primary" />
      </div>
      <div className="mt-5 rounded-lg bg-primary/10 px-4 py-2.5 text-center text-sm font-medium text-primary">
        Weiter →
      </div>
    </div>
  );
}

function ReviewsCard() {
  return (
    <div className="hero-card-4 absolute bottom-0 left-[15%] z-20 w-[250px] rounded-xl bg-white p-5 shadow-lg ring-1 ring-black/[0.04]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              +12 Bewertungen
            </p>
            <p className="text-xs text-muted-foreground">diese Woche</p>
          </div>
        </div>
        <ArrowUp className="h-5 w-5 text-emerald-500" />
      </div>
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
      {/* Radial gradient background */}
      <div className="absolute inset-0 -m-6 rounded-3xl bg-[radial-gradient(circle_at_60%_40%,hsl(174_84%_30%/0.12),transparent_70%)]" />

      {/* Desktop/Tablet: overlapping absolute cards */}
      <div className="relative hidden min-h-[400px] w-full md:block lg:min-h-[430px]">
        <GoogleStarsCard />
        <DashboardCard />
        <SurveyPhoneCard />
        <ReviewsCard />
      </div>

      {/* Mobile: 2-column grid */}
      <div className="relative grid grid-cols-2 gap-3 py-2 md:hidden">
        {/* Google Stars */}
        <div className="hero-card-1 rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/[0.04]">
          <p className="text-xs font-medium text-muted-foreground">
            Google-Bewertung
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">4,9</span>
            <div className="flex gap-0.5 text-amber-400">
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
              <Star className="h-3.5 w-3.5 fill-current" />
            </div>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            142 Bewertungen
          </p>
        </div>

        {/* Dashboard */}
        <div className="hero-card-2 rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/[0.04]">
          <p className="text-xs font-medium text-muted-foreground">
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

        {/* Survey */}
        <div className="hero-card-3 rounded-2xl bg-white p-4 shadow-lg ring-1 ring-black/[0.04]">
          <p className="text-[11px] leading-tight text-muted-foreground">
            Wie wahrscheinlich empfehlen Sie uns?
          </p>
          <div className="mt-2 flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-primary">9</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-muted">
            <div className="h-full w-[90%] rounded-full bg-primary" />
          </div>
        </div>

        {/* Reviews */}
        <div className="hero-card-4 flex items-center gap-2.5 rounded-xl bg-white p-4 shadow-lg ring-1 ring-black/[0.04]">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold">+12 Bewertungen</p>
            <p className="text-[10px] text-muted-foreground">diese Woche</p>
          </div>
        </div>
      </div>
    </div>
  );
}
