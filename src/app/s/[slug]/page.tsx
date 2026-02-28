import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { surveys } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { SurveyForm } from "@/components/survey/survey-form";
import { SurveyUnavailable } from "@/components/survey/survey-unavailable";
import type { SurveyQuestion } from "@/types";

type Props = {
  params: Promise<{ slug: string }>;
};

// Deduplicate DB query between generateMetadata() and SurveyPage()
const getSurveyBySlug = cache(async (slug: string) => {
  return db.query.surveys.findFirst({
    where: and(eq(surveys.slug, slug), isNull(surveys.deletedAt)),
    with: { practice: true },
  });
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);

  if (!survey) {
    return { title: "Umfrage nicht gefunden" };
  }

  return {
    title: `${survey.title} – ${survey.practice.name}`,
    description: `Ihre Meinung ist uns wichtig! Nehmen Sie an der anonymen Befragung von ${survey.practice.name} teil.`,
    robots: { index: false, follow: false },
  };
}

export default async function SurveyPage({ params }: Props) {
  const { slug } = await params;
  const survey = await getSurveyBySlug(slug);

  if (!survey || survey.status !== "active" || survey.practice.deletedAt) {
    notFound();
  }

  // Suspended practices cannot serve surveys
  if (survey.practice.suspendedAt) {
    return <SurveyUnavailable />;
  }

  // On-access time checks
  const now = new Date();
  if (survey.startsAt && now < survey.startsAt) {
    return <SurveyUnavailable />;
  }
  if (survey.endsAt && now > survey.endsAt) {
    return <SurveyUnavailable />;
  }

  // Defensive: no questions → not found
  const questions = (survey.questions ?? []) as SurveyQuestion[];
  if (questions.length === 0) {
    notFound();
  }

  return (
      <div
        className="flex min-h-screen flex-col bg-paper-texture"
        style={{
          ["--practice-color" as string]: survey.practice.primaryColor || "#0D9488",
        }}
      >
        {/* Header */}
        <header className="bg-white py-4 shadow-sm">
          <div className="mx-auto max-w-lg px-4 text-center">
            {survey.practice.logoUrl ? (
              <Image
                src={survey.practice.logoUrl}
                alt={survey.practice.name}
                width={200}
                height={40}
                className="mx-auto h-10 w-auto object-contain"
                unoptimized
              />
            ) : (
              <h1 className="text-lg font-semibold" style={{ color: "var(--practice-color)" }}>
                {survey.practice.name}
              </h1>
            )}
          </div>
        </header>

        {/* Survey content */}
        <main className="flex-1 px-4 py-6">
          <div className="mx-auto max-w-lg">
            <SurveyForm
              surveyId={survey.id}
              practiceColor={survey.practice.primaryColor || "#0D9488"}
              questions={questions}
              respondentType={survey.respondentType ?? "patient"}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="py-4 text-center">
          <p className="text-xs text-muted-foreground">
            Anonym & DSGVO-konform · Powered by{" "}
            <a href="/" className="underline" target="_blank" rel="noopener">
              PraxisPuls
            </a>
          </p>
        </footer>
      </div>
  );
}
