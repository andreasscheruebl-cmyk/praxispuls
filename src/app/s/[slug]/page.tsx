import { notFound } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/db";
import { surveys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SurveyForm } from "@/components/survey/survey-form";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function SurveyPage({ params }: Props) {
  const { slug } = await params;

  const survey = await db.query.surveys.findFirst({
    where: eq(surveys.slug, slug),
    with: { practice: true },
  });

  if (!survey || !survey.isActive) {
    notFound();
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-gray-50"
      style={{
        // Apply practice branding color
        ["--practice-color" as string]: survey.practice.primaryColor || "#2563EB",
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
            practiceName={survey.practice.name}
            practiceColor={survey.practice.primaryColor || "#2563EB"}
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
