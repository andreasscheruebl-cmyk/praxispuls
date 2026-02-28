"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Play,
  Pause,
  Archive,
  ArchiveRestore,
  QrCode,
  Trash2,
  FileX,
} from "lucide-react";
import { getAvailableActions } from "@/lib/survey-status";
import type { SurveyStatus } from "@/lib/db/schema";

interface SurveyActionsMenuProps {
  status: SurveyStatus;
  onStatusChange: (newStatus: SurveyStatus) => void;
  onDelete: () => void;
  onDeleteResponses: () => void;
  onShowQr: () => void;
}

const ACTION_CONFIG = {
  activate: { label: "Aktivieren", icon: Play, status: "active" as const },
  pause: { label: "Pausieren", icon: Pause, status: "paused" as const },
  archive: { label: "Archivieren", icon: Archive, status: "archived" as const },
  unarchive: { label: "Dearchivieren", icon: ArchiveRestore, status: "paused" as const },
} as const;

export function SurveyActionsMenu({
  status,
  onStatusChange,
  onDelete,
  onDeleteResponses,
  onShowQr,
}: SurveyActionsMenuProps) {
  const actions = getAvailableActions(status);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Aktionen</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Status transitions */}
        {(["activate", "pause", "archive", "unarchive"] as const).map((key) => {
          if (!actions.includes(key)) return null;
          const config = ACTION_CONFIG[key];
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onStatusChange(config.status)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {config.label}
            </DropdownMenuItem>
          );
        })}

        {actions.includes("show-qr") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onShowQr}>
              <QrCode className="mr-2 h-4 w-4" />
              QR-Code anzeigen
            </DropdownMenuItem>
          </>
        )}

        {actions.includes("delete-responses") && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDeleteResponses}
              className="text-destructive focus:text-destructive"
            >
              <FileX className="mr-2 h-4 w-4" />
              Alle Antworten löschen
            </DropdownMenuItem>
          </>
        )}

        {actions.includes("delete") && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Umfrage löschen
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
