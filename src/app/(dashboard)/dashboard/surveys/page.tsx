import { redirect } from "next/navigation";
import { getActivePractice } from "@/actions/practice";
import { getSurveysWithStats } from "@/lib/db/queries/surveys";
import { getTemplatesForPractice } from "@/lib/db/queries/templates";
import { SurveyList } from "@/components/dashboard/survey-list";

export const metadata = { title: "Umfragen" };

export default async function SurveysPage() {
  const practice = await getActivePractice();
  if (!practice) redirect("/onboarding");

  const [surveys, templates] = await Promise.all([
    getSurveysWithStats(practice.id),
    getTemplatesForPractice(
      practice.industryCategory ?? "gesundheit",
      practice.industrySubCategory ?? undefined
    ),
  ]);

  // Serialize dates for client component boundary
  const serializedSurveys = surveys.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    status: s.status,
    description: s.description,
    respondentType: s.respondentType,
    templateName: s.templateName,
    templateCategory: s.templateCategory,
    startsAt: s.startsAt?.toISOString() ?? null,
    endsAt: s.endsAt?.toISOString() ?? null,
    responseCount: s.responseCount,
    npsScore: s.npsScore,
    createdAt: s.createdAt?.toISOString() ?? "",
    updatedAt: s.updatedAt?.toISOString() ?? "",
  }));

  return (
    <SurveyList
      surveys={serializedSurveys}
      templates={templates}
    />
  );
}
