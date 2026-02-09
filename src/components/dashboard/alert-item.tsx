"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { markAlertRead, addAlertNote } from "@/actions/alerts";
import { formatDateDE } from "@/lib/utils";

type AlertData = {
  id: string;
  isRead: boolean | null;
  note: string | null;
  createdAt: Date | null;
  npsScore: number;
  freeText: string | null;
  ratingWaitTime: number | null;
  ratingFriendliness: number | null;
  ratingTreatment: number | null;
  ratingFacility: number | null;
};

export function AlertItem({ alert }: { alert: AlertData }) {
  const [note, setNote] = useState(alert.note || "");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(!alert.isRead);

  async function handleMarkRead() {
    setSaving(true);
    try {
      await markAlertRead(alert.id);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveNote() {
    if (!note.trim()) return;
    setSaving(true);
    try {
      await addAlertNote(alert.id, note);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const ratings = [
    { label: "Wartezeit", value: alert.ratingWaitTime },
    { label: "Freundlichkeit", value: alert.ratingFriendliness },
    { label: "Behandlung", value: alert.ratingTreatment },
    { label: "Ausstattung", value: alert.ratingFacility },
  ].filter((r) => r.value !== null);

  return (
    <Card className={!alert.isRead ? "border-red-200 bg-red-50/50" : ""}>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header */}
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex w-full items-center gap-3 text-left"
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white ${
                  alert.npsScore <= 3 ? "bg-red-500" : "bg-orange-500"
                }`}
              >
                {alert.npsScore}
              </span>
              <div className="flex-1">
                <span className="font-medium">
                  NPS {alert.npsScore}/10 – Kritisches Feedback
                </span>
                {alert.createdAt && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {formatDateDE(alert.createdAt)}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                {expanded ? "▲" : "▼"}
              </span>
            </button>

            {/* Expanded content */}
            {expanded && (
              <div className="mt-4 space-y-4 pl-11">
                {/* Free text */}
                {alert.freeText && (
                  <div className="rounded-md border-l-4 border-red-300 bg-white p-3">
                    <p className="text-sm italic">&ldquo;{alert.freeText}&rdquo;</p>
                  </div>
                )}

                {/* Ratings */}
                {ratings.length > 0 && (
                  <div className="flex flex-wrap gap-4 text-sm">
                    {ratings.map((r) => (
                      <span key={r.label} className="text-muted-foreground">
                        {r.label}:{" "}
                        <span className="text-yellow-500">
                          {"★".repeat(r.value!)}{"☆".repeat(5 - r.value!)}
                        </span>
                      </span>
                    ))}
                  </div>
                )}

                {/* Note */}
                <div className="space-y-2">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Interne Notiz hinzufügen (z.B. 'Wartezeit lang wegen Notfall')"
                    className="w-full rounded-md border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    {!alert.isRead && (
                      <button
                        onClick={handleMarkRead}
                        disabled={saving}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Als gelesen markieren
                      </button>
                    )}
                    <button
                      onClick={handleSaveNote}
                      disabled={saving || !note.trim()}
                      className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      {saving ? "Speichert…" : "Notiz speichern"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
