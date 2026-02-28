"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SurveyCard } from "./survey-card";
import type { SurveyCardData } from "./survey-card";
import { CreateSurveyDialog } from "./create-survey-dialog";
import { ClipboardList, Plus } from "lucide-react";
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

interface SurveyListProps {
  surveys: SurveyCardData[];
  templates: TemplateData[];
}

export function SurveyList({ surveys, templates }: SurveyListProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      {/* Header with create button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Umfragen</h1>
          <p className="text-sm text-muted-foreground">
            Erstellen und verwalten Sie Ihre Umfragen
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neue Umfrage
        </Button>
      </div>

      {/* Survey list or empty state */}
      {surveys.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <ClipboardList className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold">Noch keine Umfragen</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Erstellen Sie Ihre erste Umfrage, um Feedback von Ihren Patienten
            oder Mitarbeitern zu sammeln.
          </p>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Erste Umfrage erstellen
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateSurveyDialog
        templates={templates}
        open={createOpen}
        onOpenChange={setCreateOpen}
      />
    </div>
  );
}
