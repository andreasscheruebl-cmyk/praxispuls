import { ArrowUp, Star, StarHalf } from "lucide-react";

function GoogleStarsCard() {
  return (
    <div className="absolute -top-2 left-4 z-10 w-[200px] rotate-2 rounded-xl border border-border bg-white p-4 shadow-theme md:left-8 lg:-top-4 lg:left-6">
      <p className="text-xs font-medium text-muted-foreground">
        Google-Bewertung
      </p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">4,6</span>
        <div className="flex gap-0.5 text-amber-400">
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <StarHalf className="h-4 w-4 fill-current" />
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">120 Bewertungen</p>
    </div>
  );
}

function NpsScoreCard() {
  return (
    <div className="absolute left-2 top-[130px] z-10 w-[180px] rounded-xl border border-border bg-white p-4 shadow-theme md:left-4 lg:left-0 lg:top-[140px]">
      <p className="text-xs font-medium text-muted-foreground">NPS Score</p>
      <p className="mt-1 text-4xl font-bold text-primary">87</p>
      {/* Mini bar indicator */}
      <div className="mt-2 flex h-2 w-full overflow-hidden rounded-full">
        <div className="h-full w-[10%] bg-red-400" />
        <div className="h-full w-[15%] bg-amber-400" />
        <div className="h-full w-[75%] bg-teal-500" />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>Kritiker</span>
        <span>Promotoren</span>
      </div>
    </div>
  );
}

function SurveyPhoneCard() {
  return (
    <div className="absolute right-2 top-[90px] z-20 w-[160px] rounded-2xl border-2 border-border bg-white p-4 shadow-theme md:right-8 lg:right-4 lg:top-[80px]">
      <div className="mb-3 h-1 w-10 rounded-full bg-muted mx-auto" />
      <p className="text-center text-[11px] leading-tight text-muted-foreground">
        Wie wahrscheinlich empfehlen Sie uns weiter?
      </p>
      <div className="mt-3 flex items-baseline justify-center gap-1">
        <span className="text-4xl font-bold text-primary">9</span>
        <span className="text-lg text-muted-foreground">/ 10</span>
      </div>
      {/* Slider bar */}
      <div className="mt-3 h-2 w-full rounded-full bg-muted">
        <div className="h-full w-[90%] rounded-full bg-primary" />
      </div>
      <div className="mt-3 rounded-lg bg-primary/10 px-3 py-1.5 text-center text-xs font-medium text-primary">
        Weiter →
      </div>
    </div>
  );
}

function ReviewsCard() {
  return (
    <div className="absolute bottom-2 left-1/2 z-10 w-[170px] -translate-x-1/3 -rotate-1 rounded-xl border border-border bg-white p-4 shadow-theme lg:bottom-0">
      <div className="flex items-center gap-2">
        <ArrowUp className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-semibold text-emerald-600">
          +2 neue Bewertungen
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">heute</p>
    </div>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Radial gradient background */}
      <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,hsl(174_84%_30%/0.08),transparent_70%)]" />

      {/* Desktop/Tablet: absolute positioned cards */}
      <div className="relative hidden aspect-square max-h-[480px] w-full md:block">
        <GoogleStarsCard />
        <NpsScoreCard />
        <SurveyPhoneCard />
        <ReviewsCard />
      </div>

      {/* Mobile: grid layout */}
      <div className="relative grid grid-cols-2 gap-3 md:hidden">
        <div className="rounded-xl border border-border bg-white p-3 shadow-theme">
          <p className="text-xs font-medium text-muted-foreground">
            Google-Bewertung
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold">4,6</span>
            <div className="flex gap-0.5 text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <Star className="h-3 w-3 fill-current" />
              <StarHalf className="h-3 w-3 fill-current" />
            </div>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            120 Bewertungen
          </p>
        </div>

        <div className="rounded-xl border border-border bg-white p-3 shadow-theme">
          <p className="text-xs font-medium text-muted-foreground">
            NPS Score
          </p>
          <p className="mt-1 text-2xl font-bold text-primary">87</p>
          <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full">
            <div className="h-full w-[10%] bg-red-400" />
            <div className="h-full w-[15%] bg-amber-400" />
            <div className="h-full w-[75%] bg-teal-500" />
          </div>
        </div>

        <div className="rounded-2xl border-2 border-border bg-white p-3 shadow-theme">
          <p className="text-[10px] leading-tight text-muted-foreground">
            Wie wahrscheinlich empfehlen Sie uns?
          </p>
          <div className="mt-1.5 flex items-baseline justify-center gap-1">
            <span className="text-2xl font-bold text-primary">9</span>
            <span className="text-sm text-muted-foreground">/ 10</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
            <div className="h-full w-[90%] rounded-full bg-primary" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-3 shadow-theme">
          <div className="flex items-center gap-1.5">
            <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-600">
              +2 neue
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bewertungen heute
          </p>
        </div>
      </div>
    </div>
  );
}
