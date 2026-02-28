"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SurveyQrDialogProps {
  surveyId: string;
  surveySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SurveyQrDialog({
  surveyId,
  surveySlug,
  open,
  onOpenChange,
}: SurveyQrDialogProps) {
  const [qrData, setQrData] = useState<{
    qrCodeDataUrl: string;
    surveyUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`/api/surveys/${surveyId}/qr-code`)
      .then(async (res) => {
        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw new Error("Unerwartete Antwort vom Server");
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setQrData(data);
      })
      .catch(() => toast.error("QR-Code konnte nicht geladen werden"))
      .finally(() => setLoading(false));
  }, [open, surveyId]);

  function handleCopyLink() {
    if (!qrData) return;
    navigator.clipboard.writeText(qrData.surveyUrl);
    toast.success("Link kopiert");
  }

  function handleDownload() {
    if (!qrData) return;
    const link = document.createElement("a");
    link.download = `qr-${surveySlug}.png`;
    link.href = qrData.qrCodeDataUrl;
    link.click();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR-Code</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : qrData ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrData.qrCodeDataUrl}
                alt="QR-Code"
                className="h-64 w-64"
              />
            </div>

            <div className="rounded-md bg-muted px-3 py-2 text-center text-sm font-mono break-all">
              {qrData.surveyUrl}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCopyLink}
              >
                <Copy className="mr-2 h-4 w-4" />
                Link kopieren
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                PNG herunterladen
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
