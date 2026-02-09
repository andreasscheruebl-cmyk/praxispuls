import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { surveys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ nps?: string; rid?: string }>;
};

export default async function DankePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { nps, rid } = await searchParams;

  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.slug, slug),
    with: { practice: true },
  });

  if (!survey) notFound();

  const npsScore = nps ? parseInt(nps, 10) : null;
  const practice = survey.practice;
  const practiceColor = practice.primaryColor || "#2563EB";
  const threshold = practice.npsThreshold ?? 9;

  const isPromoter = npsScore !== null && npsScore >= threshold;
  const isDetractor = npsScore !== null && npsScore <= 6;

  const googleReviewUrl = practice.googleReviewUrl || (
    practice.googlePlaceId
      ? `https://search.google.com/local/writereview?placeid=${practice.googlePlaceId}`
      : null
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-white py-4 shadow-sm">
        <div className="mx-auto max-w-lg px-4 text-center">
          {practice.logoUrl ? (
            <img src={practice.logoUrl} alt={practice.name} className="mx-auto h-10 object-contain" />
          ) : (
            <h1 className="text-lg font-semibold" style={{ color: practiceColor }}>
              {practice.name}
            </h1>
          )}
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="mx-auto max-w-md text-center">
          {isPromoter && googleReviewUrl ? (
            <>
              <div className="text-5xl">🎉</div>
              <h2 className="mt-6 text-2xl font-bold">
                Vielen Dank für Ihr tolles Feedback!
              </h2>
              <p className="mt-4 text-muted-foreground">
                Würden Sie Ihre positive Erfahrung auch auf Google teilen?
                Das hilft anderen Patienten bei der Praxissuche.
              </p>
              <a
                href={googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Track click via API (fire and forget)
                  if (rid) {
                    fetch("/api/public/track-click", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ responseId: rid }),
                    }).catch(() => {});
                  }
                }}
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg px-8 text-base font-semibold text-white shadow-md transition-transform hover:scale-105"
                style={{ backgroundColor: practiceColor }}
              >
                ⭐ Ja, gerne auf Google bewerten!
              </a>
              <p className="mt-4 text-sm text-muted-foreground">
                <button className="underline hover:no-underline">
                  Nein, danke
                </button>
              </p>
            </>
          ) : isDetractor ? (
            <>
              <div className="text-5xl">🙏</div>
              <h2 className="mt-6 text-2xl font-bold">
                Danke für Ihre Ehrlichkeit.
              </h2>
              <p className="mt-4 text-muted-foreground">
                Wir nehmen Ihr Feedback sehr ernst und arbeiten daran, uns stetig
                zu verbessern. Ihre Rückmeldung wird intern ausgewertet.
              </p>
            </>
          ) : (
            <>
              <div className="text-5xl">✅</div>
              <h2 className="mt-6 text-2xl font-bold">
                Vielen Dank für Ihr Feedback!
              </h2>
              <p className="mt-4 text-muted-foreground">
                Ihre Rückmeldung hilft uns, unsere Praxis stetig zu verbessern.
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground">
          Anonym & DSGVO-konform · Powered by{" "}
          <a href="/" className="underline" target="_blank" rel="noopener">PraxisPuls</a>
        </p>
      </footer>
    </div>
  );
}
