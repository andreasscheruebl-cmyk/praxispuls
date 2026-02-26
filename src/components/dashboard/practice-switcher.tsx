"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AddLocationModal } from "./add-location-modal";

type PracticeItem = {
  id: string;
  name: string;
  postalCode: string | null;
};

type PracticeSwitcherProps = {
  practices: PracticeItem[];
  activePracticeId: string;
  maxLocations: number;
};

export function PracticeSwitcher({
  practices,
  activePracticeId,
  maxLocations,
}: PracticeSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PracticeItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activePractice = practices.find((p) => p.id === activePracticeId);
  const canAddMore = practices.length < maxLocations;

  async function handleSwitch(practiceId: string) {
    if (practiceId === activePracticeId) return;
    startTransition(async () => {
      const { setActivePractice } = await import("@/actions/practice");
      await setActivePractice(practiceId);
      router.refresh();
    });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/practice/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        alert(body?.error || "Fehler beim Entfernen des Standorts.");
        return;
      }
      setDeleteTarget(null);
      router.refresh();
    } catch {
      alert("Netzwerkfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setDeleting(false);
    }
  }

  // Single practice — no switcher needed
  if (practices.length <= 1 && !canAddMore) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between gap-2 text-left font-normal"
            disabled={isPending}
          >
            <span className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="truncate">
                {activePractice?.name || "Standort wählen"}
              </span>
            </span>
            <ChevronDown className="h-3 w-3 flex-shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Ihre Standorte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {practices.map((practice) => (
            <DropdownMenuItem
              key={practice.id}
              className="flex items-center justify-between gap-2"
              onSelect={(e) => {
                // Prevent close when clicking delete
                if ((e.target as HTMLElement).closest("[data-delete]")) {
                  e.preventDefault();
                  return;
                }
                handleSwitch(practice.id);
              }}
            >
              <span className="flex items-center gap-2 truncate">
                <span
                  className={`h-2 w-2 flex-shrink-0 rounded-full ${
                    practice.id === activePracticeId
                      ? "bg-primary"
                      : "bg-muted"
                  }`}
                />
                <span className="truncate">{practice.name}</span>
                {practice.postalCode && (
                  <span className="text-xs text-muted-foreground">
                    {practice.postalCode}
                  </span>
                )}
              </span>
              {practices.length > 1 && (
                <button
                  data-delete
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(practice);
                  }}
                  className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-focus:opacity-100 [.group:hover_&]:opacity-100"
                  title="Standort entfernen"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          {activePractice && (
            <DropdownMenuItem
              onSelect={() => router.push("/dashboard/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Einstellungen
            </DropdownMenuItem>
          )}
          {canAddMore ? (
            <DropdownMenuItem onSelect={() => setAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Standort hinzufügen
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled>
              <Plus className="mr-2 h-4 w-4" />
              <span className="text-xs">
                Limit erreicht ({practices.length}/{maxLocations})
                {" — "}
                <span
                  className="cursor-pointer text-primary underline"
                  onClick={() => router.push("/dashboard/billing")}
                >
                  Upgrade
                </span>
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Add Location Modal */}
      <AddLocationModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={() => {
          setAddModalOpen(false);
          router.refresh();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Standort entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie den Standort &quot;{deleteTarget?.name}&quot; wirklich
              entfernen? Alle zugehörigen Umfragen und Antworten werden
              archiviert. Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Wird entfernt..." : "Entfernen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
