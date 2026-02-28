"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowUp, ArrowDown, X, Save } from "lucide-react";
import { toast } from "sonner";
import { createTemplateAction, updateTemplateAction } from "@/actions/templates";
import type { SurveyQuestion, SurveyQuestionType } from "@/types";
import type { SurveyTemplateRow } from "@/lib/db/schema";
import { INDUSTRY_CATEGORY_IDS } from "@/lib/validations";

const QUESTION_TYPES: { value: SurveyQuestionType; label: string }[] = [
  { value: "nps", label: "NPS (0–10)" },
  { value: "stars", label: "Sterne (1–5)" },
  { value: "freetext", label: "Freitext" },
  { value: "enps", label: "eNPS (0–10)" },
  { value: "likert", label: "Likert-Skala" },
  { value: "single-choice", label: "Single Choice" },
  { value: "yes-no", label: "Ja/Nein" },
];

const RESPONDENT_TYPES = [
  { value: "patient", label: "Patient" },
  { value: "tierhalter", label: "Tierhalter" },
  { value: "kunde", label: "Kunde" },
  { value: "gast", label: "Gast" },
  { value: "mitglied", label: "Mitglied" },
  { value: "fahrschueler", label: "Fahrschüler" },
  { value: "schueler", label: "Schüler" },
  { value: "eltern", label: "Eltern" },
  { value: "mandant", label: "Mandant" },
  { value: "mitarbeiter", label: "Mitarbeiter" },
  { value: "individuell", label: "Individuell" },
  { value: "teilnehmer", label: "Teilnehmer" },
];

function newQuestion(): SurveyQuestion {
  return {
    id: `q_${Date.now()}`,
    type: "stars",
    label: "",
    required: false,
  };
}

interface TemplateEditorProps {
  template?: SurveyTemplateRow;
}

export function TemplateEditor({ template }: TemplateEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!template;

  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [industryCategory, setIndustryCategory] = useState(
    template?.industryCategory ?? "individuell"
  );
  const [industrySubCategory, setIndustrySubCategory] = useState(
    template?.industrySubCategory ?? ""
  );
  const [respondentType, setRespondentType] = useState(
    template?.respondentType ?? "kunde"
  );
  const [category, setCategory] = useState<"customer" | "employee">(
    (template?.category as "customer" | "employee") ?? "customer"
  );
  const [questions, setQuestions] = useState<SurveyQuestion[]>(
    (template?.questions) ?? [
      { id: "nps", type: "nps", label: "Wie wahrscheinlich ist es, dass Sie uns weiterempfehlen?", required: true },
    ]
  );

  function addQuestion() {
    setQuestions([...questions, newQuestion()]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    const temp = updated[index]!;
    updated[index] = updated[newIndex]!;
    updated[newIndex] = temp;
    setQuestions(updated);
  }

  function updateQuestion(index: number, updates: Partial<SurveyQuestion>) {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  }

  function handleSubmit() {
    if (!name.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }
    if (questions.length === 0) {
      toast.error("Mindestens eine Frage erforderlich");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("name", name);
        formData.set("description", description);
        formData.set("industryCategory", industryCategory);
        if (industrySubCategory) formData.set("industrySubCategory", industrySubCategory);
        formData.set("respondentType", respondentType);
        formData.set("category", category);
        formData.set("questions", JSON.stringify(questions));

        const result = isEdit
          ? await updateTemplateAction(template.id, formData)
          : await createTemplateAction(formData);

        if ("error" in result && result.error) {
          toast.error(result.error);
        } else {
          toast.success(isEdit ? "Template aktualisiert" : "Template erstellt");
          const created = "template" in result
            ? (result.template as { id: string } | undefined)
            : undefined;
          if (!isEdit && created) {
            router.push(`/admin/templates/${created.id}`);
          } else {
            router.push("/admin/templates");
          }
        }
      } catch {
        toast.error("Ein unerwarteter Fehler ist aufgetreten");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Allgemein</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Zahnarzt Standard"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Kurze Beschreibung..."
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Branche</Label>
              <Select
                value={industryCategory}
                onValueChange={setIndustryCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_CATEGORY_IDS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sub-Branche (optional)</Label>
              <Input
                value={industrySubCategory}
                onChange={(e) => setIndustrySubCategory(e.target.value)}
                placeholder="z.B. zahnarzt"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Respondent-Typ</Label>
              <Select value={respondentType} onValueChange={setRespondentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RESPONDENT_TYPES.map((rt) => (
                    <SelectItem key={rt.value} value={rt.value}>
                      {rt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select
                value={category}
                onValueChange={(v) =>
                  setCategory(v as "customer" | "employee")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Kunden</SelectItem>
                  <SelectItem value="employee">Mitarbeiter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fragen ({questions.length})</CardTitle>
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="mr-1 h-4 w-4" />
            Frage hinzufügen
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, i) => (
            <div
              key={q.id}
              className="rounded-lg border p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Frage {i + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(i, -1)}
                    disabled={i === 0}
                    className="h-7 w-7 p-0"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveQuestion(i, 1)}
                    disabled={i === questions.length - 1}
                    className="h-7 w-7 p-0"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(i)}
                    className="h-7 w-7 p-0 text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Typ</Label>
                  <Select
                    value={q.type}
                    onValueChange={(v) =>
                      updateQuestion(i, { type: v as SurveyQuestionType })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map((qt) => (
                        <SelectItem key={qt.value} value={qt.value}>
                          {qt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Kategorie (optional)</Label>
                  <Input
                    value={q.category ?? ""}
                    onChange={(e) =>
                      updateQuestion(i, {
                        category: e.target.value || undefined,
                      })
                    }
                    placeholder="z.B. waitTime"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Input
                  value={q.label}
                  onChange={(e) => updateQuestion(i, { label: e.target.value })}
                  placeholder="Frage-Text..."
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={q.required}
                  onCheckedChange={(checked) =>
                    updateQuestion(i, { required: checked })
                  }
                />
                <Label className="text-sm">Pflichtfrage</Label>
              </div>

              {q.type === "single-choice" && (
                <div className="space-y-2">
                  <Label className="text-xs">Antwortoptionen (kommagetrennt)</Label>
                  <Input
                    value={q.options?.join(", ") ?? ""}
                    onChange={(e) =>
                      updateQuestion(i, {
                        options: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              Keine Fragen. Klicken Sie auf &quot;Frage hinzufügen&quot;.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/templates")}
        >
          Abbrechen
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          <Save className="mr-2 h-4 w-4" />
          {isPending
            ? "Speichere..."
            : isEdit
              ? "Speichern"
              : "Template erstellen"}
        </Button>
      </div>
    </div>
  );
}
