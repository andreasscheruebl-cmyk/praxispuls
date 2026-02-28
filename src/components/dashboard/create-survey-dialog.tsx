"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSurvey } from "@/actions/survey";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Plus, X, FileText } from "lucide-react";
import type { SurveyQuestionType } from "@/lib/validations";

interface TemplateData {
  id: string;
  name: string;
  description: string | null;
  category: string;
  respondentType: string;
  questions: {
    id: string;
    type: SurveyQuestionType;
    label: string;
    required: boolean;
    category?: string;
    options?: string[];
  }[];
}

interface CreateSurveyDialogProps {
  templates: TemplateData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CustomQuestion = {
  id: string;
  type: SurveyQuestionType;
  label: string;
  required: boolean;
};

const NPS_TYPES = new Set<SurveyQuestionType>(["nps", "enps"]);

const CUSTOM_QUESTION_TYPES: { value: SurveyQuestionType; label: string }[] = [
  { value: "stars", label: "Sterne (1-5)" },
  { value: "likert", label: "Likert-Skala" },
  { value: "single-choice", label: "Einzelauswahl" },
  { value: "yes-no", label: "Ja/Nein" },
  { value: "freetext", label: "Freitext" },
];

export function CreateSurveyDialog({
  templates,
  open,
  onOpenChange,
}: CreateSurveyDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Step 1: Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<"customer" | "employee">("customer");

  // Step 2: Customization
  const [title, setTitle] = useState("");
  const [disabledIds, setDisabledIds] = useState<Set<string>>(new Set());
  const [labelOverrides, setLabelOverrides] = useState<Record<string, string>>({});
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [autoDelete, setAutoDelete] = useState<string>("none");

  const filteredTemplates = templates.filter(
    (t) => t.category === categoryFilter
  );

  function handleSelectTemplate(template: TemplateData) {
    setSelectedTemplate(template);
    setTitle(template.name);
    setDisabledIds(new Set());
    setLabelOverrides({});
    setCustomQuestions([]);
    setStartsAt("");
    setEndsAt("");
    setAutoDelete("none");
  }

  function handleBack() {
    setSelectedTemplate(null);
  }

  function handleClose() {
    setSelectedTemplate(null);
    setCategoryFilter("customer");
    onOpenChange(false);
  }

  function toggleQuestion(qId: string) {
    setDisabledIds((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) {
        next.delete(qId);
      } else {
        next.add(qId);
      }
      return next;
    });
  }

  function handleLabelChange(qId: string, newLabel: string) {
    setLabelOverrides((prev) => ({ ...prev, [qId]: newLabel }));
  }

  function addCustomQuestion() {
    if (customQuestions.length >= 3) return;
    setCustomQuestions((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        type: "stars",
        label: "",
        required: false,
      },
    ]);
  }

  function removeCustomQuestion(id: string) {
    setCustomQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  function updateCustomQuestion(
    id: string,
    field: keyof CustomQuestion,
    value: string | boolean
  ) {
    setCustomQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  }

  function handleSubmit() {
    if (!selectedTemplate) return;

    // Clean label overrides: only include changed labels
    const cleanedOverrides: Record<string, string> = {};
    for (const [id, label] of Object.entries(labelOverrides)) {
      const original = selectedTemplate.questions.find((q) => q.id === id);
      if (original && label && label !== original.label) {
        cleanedOverrides[id] = label;
      }
    }

    // Filter out custom questions with empty labels
    const validCustomQuestions = customQuestions
      .filter((q) => q.label.trim().length > 0)
      .map((q) => ({
        id: q.id,
        type: q.type,
        label: q.label.trim(),
        required: q.required,
      }));

    startTransition(async () => {
      const result = await createSurvey({
        templateId: selectedTemplate.id,
        title: title.trim(),
        disabledQuestionIds: Array.from(disabledIds),
        labelOverrides:
          Object.keys(cleanedOverrides).length > 0
            ? cleanedOverrides
            : undefined,
        customQuestions:
          validCustomQuestions.length > 0 ? validCustomQuestions : undefined,
        startsAt: startsAt || null,
        endsAt: endsAt || null,
        autoDeleteAfterMonths:
          autoDelete !== "none" ? parseInt(autoDelete, 10) : null,
      });

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Umfrage erstellt");
        handleClose();
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedTemplate && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {selectedTemplate ? "Umfrage anpassen" : "Neue Umfrage erstellen"}
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          /* Step 1: Template Selection */
          <div className="space-y-4">
            {/* Category Tabs */}
            <div className="flex gap-2">
              <Button
                variant={categoryFilter === "customer" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("customer")}
              >
                Kunden
              </Button>
              <Button
                variant={categoryFilter === "employee" ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter("employee")}
              >
                Mitarbeiter
              </Button>
            </div>

            {/* Template Grid */}
            {filteredTemplates.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                Keine Vorlagen für diese Kategorie verfügbar.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-colors hover:bg-accent/50"
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          {template.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {template.questions.length} Fragen
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Customization */
          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="survey-title">Titel</Label>
              <Input
                id="survey-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name der Umfrage"
                maxLength={200}
              />
            </div>

            {/* Questions */}
            <div className="space-y-2">
              <Label>Fragen</Label>
              <div className="space-y-2 rounded-md border p-3">
                {selectedTemplate.questions.map((q) => {
                  const isNps = NPS_TYPES.has(q.type);
                  const isDisabled = disabledIds.has(q.id);
                  const currentLabel = labelOverrides[q.id] ?? q.label;

                  return (
                    <div
                      key={q.id}
                      className={`flex items-start gap-3 rounded-md p-2 ${
                        isDisabled ? "opacity-50" : ""
                      }`}
                    >
                      <Switch
                        checked={!isDisabled}
                        onCheckedChange={() => toggleQuestion(q.id)}
                        disabled={isNps}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <Input
                          value={currentLabel}
                          onChange={(e) =>
                            handleLabelChange(q.id, e.target.value)
                          }
                          disabled={isDisabled}
                          className="h-8 text-sm"
                          maxLength={500}
                        />
                        <div className="mt-1 flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {q.type}
                          </Badge>
                          {isNps && (
                            <Badge variant="secondary" className="text-xs">
                              Pflicht
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Questions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Eigene Fragen</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomQuestion}
                  disabled={customQuestions.length >= 3}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Hinzufügen
                </Button>
              </div>

              {customQuestions.map((cq) => (
                <div
                  key={cq.id}
                  className="flex items-start gap-2 rounded-md border p-3"
                >
                  <div className="flex-1 space-y-2">
                    <Input
                      value={cq.label}
                      onChange={(e) =>
                        updateCustomQuestion(cq.id, "label", e.target.value)
                      }
                      placeholder="Fragetext"
                      maxLength={500}
                      className="h-8 text-sm"
                    />
                    <Select
                      value={cq.type}
                      onValueChange={(v) =>
                        updateCustomQuestion(cq.id, "type", v)
                      }
                    >
                      <SelectTrigger className="h-8 w-40 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CUSTOM_QUESTION_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeCustomQuestion(cq.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Schedule */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="starts-at">Startet am (optional)</Label>
                <Input
                  id="starts-at"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ends-at">Endet am (optional)</Label>
                <Input
                  id="ends-at"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>

            {/* Auto-delete */}
            <div className="space-y-2">
              <Label>Antworten automatisch löschen</Label>
              <Select value={autoDelete} onValueChange={setAutoDelete}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nie</SelectItem>
                  <SelectItem value="6">Nach 6 Monaten</SelectItem>
                  <SelectItem value="12">Nach 12 Monaten</SelectItem>
                  <SelectItem value="24">Nach 24 Monaten</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || title.trim().length < 2}
              >
                {isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <FileText className="mr-2 h-4 w-4" />
                Umfrage erstellen
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
