"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteSurveyDialogProps {
  type: "survey" | "responses";
  surveyTitle: string;
  responseCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function DeleteSurveyDialog({
  type,
  surveyTitle,
  responseCount,
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: DeleteSurveyDialogProps) {
  const isSurveyDelete = type === "survey";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSurveyDelete
              ? "Umfrage endgültig löschen?"
              : "Alle Antworten löschen?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isSurveyDelete ? (
              <>
                Die Umfrage <strong>&ldquo;{surveyTitle}&rdquo;</strong> und
                alle zugehörigen Antworten werden unwiderruflich gelöscht.
              </>
            ) : (
              <>
                Alle{" "}
                {responseCount !== undefined && (
                  <strong>{responseCount} </strong>
                )}
                Antworten der Umfrage{" "}
                <strong>&ldquo;{surveyTitle}&rdquo;</strong> werden
                unwiderruflich gelöscht. Die Umfrage selbst bleibt bestehen.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSurveyDelete ? "Endgültig löschen" : "Alle Antworten löschen"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
