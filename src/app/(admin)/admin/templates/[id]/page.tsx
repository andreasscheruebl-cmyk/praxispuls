import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateById } from "@/lib/db/queries/templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import { TemplateDeleteButton } from "@/components/admin/template-delete-button";


const QUESTION_TYPE_LABELS: Record<string, string> = {
  nps: "NPS",
  stars: "Sterne",
  freetext: "Freitext",
  enps: "eNPS",
  likert: "Likert",
  "single-choice": "Single Choice",
  "yes-no": "Ja/Nein",
};

export default async function AdminTemplateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(id)) return notFound();

  const template = await getTemplateById(id);
  if (!template) return notFound();

  const questions = template.questions ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/templates">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Zurück
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{template.name}</h1>
            {template.isSystem ? (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                System
              </Badge>
            ) : (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Custom
              </Badge>
            )}
          </div>
          {template.description && (
            <p className="mt-1 text-muted-foreground">{template.description}</p>
          )}
        </div>
        {!template.isSystem && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/templates/${template.id}/edit`}>
                <Pencil className="mr-1 h-4 w-4" />
                Bearbeiten
              </Link>
            </Button>
            <TemplateDeleteButton templateId={template.id} />
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Branche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{template.industryCategory}</p>
            {template.industrySubCategory && (
              <p className="text-sm text-muted-foreground">
                {template.industrySubCategory}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kategorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {template.category === "customer" ? "Kunden" : "Mitarbeiter"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Respondent-Typ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{template.respondentType}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fragen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{questions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Fragen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {questions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{q.label}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {QUESTION_TYPE_LABELS[q.type] ?? q.type}
                    </Badge>
                    {q.required && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        Pflicht
                      </Badge>
                    )}
                    {q.category && (
                      <span className="text-xs text-muted-foreground">
                        {q.category}
                      </span>
                    )}
                  </div>
                  {q.options && q.options.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {q.options.map((opt) => (
                        <Badge key={opt} variant="secondary" className="text-xs">
                          {opt}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Meta */}
      <Card>
        <CardHeader>
          <CardTitle>Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID</span>
            <code className="text-xs">{template.id}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slug</span>
            <code className="text-xs">{template.slug}</code>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sort Order</span>
            <span>{template.sortOrder}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
