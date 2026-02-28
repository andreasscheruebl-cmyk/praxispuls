"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SurveyStatusBadge } from "./survey-status-badge";
import { SurveyActionsMenu } from "./survey-actions-menu";
import { SurveyQrDialog } from "./survey-qr-dialog";
import { DeleteSurveyDialog } from "./delete-survey-dialog";
import { updateSurveyStatus, deleteSurvey, deleteAllSurveyResponses } from "@/actions/survey";
import { Copy, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { formatDateDE } from "@/lib/utils";
import type { SurveyStatus } from "@/lib/db/schema";

export interface SurveyCardData {
  id: string;
  title: string;
  slug: string;
  status: SurveyStatus;
  description: string | null;
  respondentType: string | null;
  templateName: string | null;
  templateCategory: string | null;
  startsAt: string | null;
  endsAt: string | null;
  responseCount: number;
  npsScore: number | null;
  createdAt: string;
  updatedAt: string;
}

interface SurveyCardProps {
  survey: SurveyCardData;
}

export function SurveyCard({ survey }: SurveyCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [qrOpen, setQrOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<"survey" | "responses" | null>(null);

  function handleStatusChange(newStatus: SurveyStatus) {
    startTransition(async () => {
      const result = await updateSurveyStatus(survey.id, newStatus);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Status aktualisiert");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteSurvey(survey.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Umfrage gelöscht");
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

  function handleDeleteResponses() {
    startTransition(async () => {
      const result = await deleteAllSurveyResponses(survey.id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(`${result.deletedCount} Antworten gelöscht`);
        router.refresh();
      }
      setDeleteTarget(null);
    });
  }

  function handleCopyLink() {
    const url = `${window.location.origin}/s/${survey.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link kopiert");
  }

  const npsColor =
    survey.npsScore === null
      ? "text-muted-foreground"
      : survey.npsScore > 50
        ? "text-green-600"
        : survey.npsScore >= 0
          ? "text-yellow-600"
          : "text-red-600";

  return (
    <>
      <Card className={`transition-opacity ${isPending ? "opacity-60" : ""}`}>
        <CardContent className="p-4 sm:p-5">
          {/* Header: Title + Status + Actions */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold truncate">
                  {survey.title}
                </h3>
                <SurveyStatusBadge
                  status={survey.status}
                  startsAt={survey.startsAt}
                  endsAt={survey.endsAt}
                />
                {survey.templateName && (
                  <Badge variant="secondary" className="text-xs">
                    {survey.templateName}
                  </Badge>
                )}
              </div>

              {/* Date range */}
              {(survey.startsAt || survey.endsAt) && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {survey.startsAt ? formatDateDE(survey.startsAt) : "—"}
                  {" – "}
                  {survey.endsAt ? formatDateDE(survey.endsAt) : "—"}
                </p>
              )}
            </div>

            <SurveyActionsMenu
              status={survey.status}
              onStatusChange={handleStatusChange}
              onDelete={() => setDeleteTarget("survey")}
              onDeleteResponses={() => setDeleteTarget("responses")}
              onShowQr={() => setQrOpen(true)}
            />
          </div>

          {/* Metrics row */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{survey.responseCount} Antworten</span>
            </div>
            <div className={`flex items-center gap-1.5 ${npsColor}`}>
              <TrendingUp className="h-4 w-4" />
              <span>
                NPS {survey.npsScore !== null ? survey.npsScore : "—"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 px-2 text-xs"
              onClick={handleCopyLink}
            >
              <Copy className="mr-1 h-3 w-3" />
              Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SurveyQrDialog
        surveyId={survey.id}
        surveySlug={survey.slug}
        open={qrOpen}
        onOpenChange={setQrOpen}
      />

      <DeleteSurveyDialog
        type={deleteTarget === "responses" ? "responses" : "survey"}
        surveyTitle={survey.title}
        responseCount={deleteTarget === "responses" ? survey.responseCount : undefined}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={
          deleteTarget === "responses" ? handleDeleteResponses : handleDelete
        }
        isPending={isPending}
      />
    </>
  );
}
