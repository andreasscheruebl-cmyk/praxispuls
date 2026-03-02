import { getUser } from "@/lib/auth";
import { getActivePracticeForUser, getPracticesForUser } from "@/lib/practice";
import { getSurveysWithStats } from "@/lib/db/queries/surveys";
import { getSharedTemplates } from "@/lib/db/queries/compare";
import { ComparisonView } from "@/components/dashboard/comparison-view";

export const metadata = {
  title: "Vergleich – PraxisPuls",
};

export default async function ComparePage() {
  const user = await getUser();
  const [allPractices, practice] = await Promise.all([
    getPracticesForUser(user.id),
    getActivePracticeForUser(user.id),
  ]);

  if (!practice) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">Keine Praxis gefunden.</p>
      </div>
    );
  }

  // Load surveys for current practice + shared templates for cross-location
  const practiceIds = allPractices.map((p) => p.id);
  const [surveys, sharedTemplates] = await Promise.all([
    getSurveysWithStats(practice.id),
    getSharedTemplates(practiceIds),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Vergleich</h1>
        <p className="text-muted-foreground">
          Vergleichen Sie Umfragen, Zeiträume oder Standorte miteinander.
        </p>
      </div>

      <ComparisonView
        surveys={surveys.map((s) => ({
          id: s.id,
          title: s.title,
          responseCount: s.responseCount,
        }))}
        allPractices={allPractices.map((p) => ({
          id: p.id,
          name: p.name,
        }))}
        activePracticeId={practice.id}
        sharedTemplates={sharedTemplates}
      />
    </div>
  );
}
