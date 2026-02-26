"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  ShieldAlert,
  ShieldOff,
  Ban,
  UserCheck,
  Mail,
  KeyRound,
  Trash2,
  Copy,
  Check,
  MapPin,
  Unlink,
} from "lucide-react";
import { formatDateTimeDE } from "@/lib/utils";
import { GooglePlacesSearch } from "@/components/dashboard/google-places-search";

type PracticeManagementProps = {
  practiceId: string;
  practiceName: string;
  ownerUserId: string;
  email: string;
  suspendedAt: Date | null;
  deletedAt: Date | null;
  googlePlaceId: string | null;
  googleReviewUrl: string | null;
  googleRedirectEnabled: boolean | null;
};

export function PracticeManagement({
  practiceId,
  practiceName,
  ownerUserId,
  email: initialEmail,
  suspendedAt: initialSuspendedAt,
  deletedAt,
  googlePlaceId: initialGooglePlaceId,
  googleReviewUrl: initialGoogleReviewUrl,
  googleRedirectEnabled: initialGoogleRedirectEnabled,
}: PracticeManagementProps) {
  const router = useRouter();

  // Local state for optimistic updates
  const [suspendedAt, setSuspendedAt] = useState(initialSuspendedAt);
  const [email, setEmail] = useState(initialEmail);
  const [googlePlaceId, setGooglePlaceId] = useState(initialGooglePlaceId);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(initialGoogleReviewUrl);
  const [googleRedirectEnabled, setGoogleRedirectEnabled] = useState(
    initialGoogleRedirectEnabled ?? true
  );

  // Loading states
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [banLoading, setBanLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [resetPwLoading, setResetPwLoading] = useState(false);
  const [setPwLoading, setSetPwLoading] = useState(false);
  const [googleToggleLoading, setGoogleToggleLoading] = useState(false);
  const [googleUpdateLoading, setGoogleUpdateLoading] = useState(false);
  const [googleRemoveLoading, setGoogleRemoveLoading] = useState(false);

  // Dialog states
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showGoogleSearchDialog, setShowGoogleSearchDialog] = useState(false);
  const [showGoogleRemoveDialog, setShowGoogleRemoveDialog] = useState(false);

  // Form state
  const [newEmail, setNewEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);
  const [deleteConfirmName, setDeleteConfirmName] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  // Error states
  const [accountError, setAccountError] = useState("");
  const [userError, setUserError] = useState("");
  const [googleError, setGoogleError] = useState("");

  const isSuspended = !!suspendedAt;
  const isDeleted = !!deletedAt;

  // ── Helpers ──────────────────────────────────

  async function apiCall(
    url: string,
    method: string,
    body?: unknown
  ): Promise<{ ok: boolean; data?: Record<string, unknown>; error?: string }> {
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || "Unbekannter Fehler" };
      return { ok: true, data };
    } catch {
      return { ok: false, error: "Netzwerkfehler" };
    }
  }

  // ── Account Actions ──────────────────────────

  async function handleSuspend() {
    setSuspendLoading(true);
    setAccountError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/suspend`,
      "PUT",
      { suspended: !isSuspended }
    );
    setSuspendLoading(false);
    setShowSuspendDialog(false);

    if (result.ok) {
      setSuspendedAt(isSuspended ? null : new Date());
      toast.success(isSuspended ? "Praxis entsperrt" : "Praxis gesperrt");
      router.refresh();
    } else {
      setAccountError(result.error || "Fehler beim Sperren");
    }
  }

  async function handleBan() {
    setBanLoading(true);
    setAccountError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/ban-user`,
      "POST",
      { banned: true }
    );
    setBanLoading(false);
    setShowBanDialog(false);

    if (result.ok) {
      toast.success("Benutzer-Account gesperrt (Supabase Ban)");
      router.refresh();
    } else {
      setAccountError(result.error || "Fehler beim Sperren");
    }
  }

  async function handleUnban() {
    setBanLoading(true);
    setAccountError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/ban-user`,
      "POST",
      { banned: false }
    );
    setBanLoading(false);

    if (result.ok) {
      toast.success("Benutzer-Account entsperrt");
      router.refresh();
    } else {
      setAccountError(result.error || "Fehler beim Entsperren");
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    setAccountError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}`,
      "DELETE"
    );
    setDeleteLoading(false);
    setShowDeleteDialog(false);

    if (result.ok) {
      toast.success("Praxis gelöscht (Soft-Delete)");
      router.push("/admin/practices");
    } else {
      setAccountError(result.error || "Fehler beim Löschen");
    }
  }

  // ── User Actions ─────────────────────────────

  async function handleEmailChange() {
    setEmailLoading(true);
    setUserError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/email`,
      "PUT",
      { email: newEmail }
    );
    setEmailLoading(false);
    setShowEmailDialog(false);

    if (result.ok) {
      setEmail(newEmail);
      setNewEmail("");
      toast.success("E-Mail geändert");
      router.refresh();
    } else {
      setUserError(result.error || "Fehler beim Ändern der E-Mail");
    }
  }

  async function handleResetPassword() {
    setResetPwLoading(true);
    setUserError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/reset-password`,
      "POST"
    );
    setResetPwLoading(false);

    if (result.ok) {
      toast.success("Reset-E-Mail gesendet");
    } else {
      setUserError(result.error || "Fehler beim Senden");
    }
  }

  async function handleSetPassword() {
    setSetPwLoading(true);
    setUserError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/set-password`,
      "POST"
    );
    setSetPwLoading(false);

    if (result.ok && result.data?.password) {
      setGeneratedPassword(result.data.password as string);
      setShowPasswordDialog(true);
    } else {
      setUserError(result.error || "Fehler beim Setzen des Passworts");
    }
  }

  async function copyPassword() {
    await navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  }

  // ── Google Actions ───────────────────────────

  async function handleGoogleRedirectToggle(checked: boolean) {
    setGoogleToggleLoading(true);
    setGoogleError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/google`,
      "PUT",
      { googleRedirectEnabled: checked }
    );
    setGoogleToggleLoading(false);

    if (result.ok) {
      setGoogleRedirectEnabled(checked);
      toast.success(checked ? "Google-Redirect aktiviert" : "Google-Redirect deaktiviert");
    } else {
      setGoogleError(result.error || "Fehler");
    }
  }

  async function handleGoogleUpdate() {
    if (!selectedPlaceId) return;
    setGoogleUpdateLoading(true);
    setGoogleError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/google`,
      "PUT",
      { googlePlaceId: selectedPlaceId }
    );
    setGoogleUpdateLoading(false);
    setShowGoogleSearchDialog(false);

    if (result.ok) {
      setGooglePlaceId(selectedPlaceId);
      setGoogleReviewUrl(
        `https://search.google.com/local/writereview?placeid=${selectedPlaceId}`
      );
      setSelectedPlaceId("");
      toast.success("Google-Verknüpfung aktualisiert");
      router.refresh();
    } else {
      setGoogleError(result.error || "Fehler");
    }
  }

  async function handleGoogleRemove() {
    setGoogleRemoveLoading(true);
    setGoogleError("");
    const result = await apiCall(
      `/api/admin/practices/${practiceId}/google`,
      "PUT",
      { googlePlaceId: null }
    );
    setGoogleRemoveLoading(false);
    setShowGoogleRemoveDialog(false);

    if (result.ok) {
      setGooglePlaceId(null);
      setGoogleReviewUrl(null);
      setGoogleRedirectEnabled(false);
      toast.success("Google-Verknüpfung entfernt");
      router.refresh();
    } else {
      setGoogleError(result.error || "Fehler");
    }
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Card 1: Konto-Verwaltung ────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Konto-Verwaltung</CardTitle>
            <CardDescription>
              Praxis sperren, Benutzer bannen oder Account löschen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              {isSuspended ? (
                <Badge variant="destructive">
                  Gesperrt seit {formatDateTimeDE(suspendedAt)}
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  Aktiv
                </Badge>
              )}
            </div>

            {accountError && (
              <p className="text-sm text-destructive">{accountError}</p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={isSuspended ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSuspendDialog(true)}
                disabled={isDeleted}
              >
                {isSuspended ? (
                  <><ShieldOff className="mr-1 h-4 w-4" /> Entsperren</>
                ) : (
                  <><ShieldAlert className="mr-1 h-4 w-4" /> Praxis sperren</>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBanDialog(true)}
                disabled={isDeleted}
              >
                <Ban className="mr-1 h-4 w-4" />
                Account sperren
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnban}
                disabled={banLoading || isDeleted}
              >
                <UserCheck className="mr-1 h-4 w-4" />
                {banLoading ? "Wird verarbeitet…" : "Account entsperren"}
              </Button>
            </div>

            <div className="border-t pt-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleted}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Praxis löschen (Soft-Delete)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Card 2: Benutzer-Verwaltung ─────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Benutzer-Verwaltung</CardTitle>
            <CardDescription>
              E-Mail ändern, Passwort zurücksetzen oder direkt setzen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">E-Mail</span>
                <p className="text-sm font-medium">{email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewEmail(email);
                  setShowEmailDialog(true);
                }}
              >
                <Mail className="mr-1 h-4 w-4" />
                Ändern
              </Button>
            </div>

            {userError && (
              <p className="text-sm text-destructive">{userError}</p>
            )}

            {/* Password actions */}
            <div className="border-t pt-4 space-y-2">
              <span className="text-sm text-muted-foreground">Passwort</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetPassword}
                  disabled={resetPwLoading}
                >
                  <KeyRound className="mr-1 h-4 w-4" />
                  {resetPwLoading ? "Sende…" : "Reset-E-Mail senden"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSetPassword}
                  disabled={setPwLoading}
                >
                  <KeyRound className="mr-1 h-4 w-4" />
                  {setPwLoading ? "Generiere…" : "Passwort direkt setzen"}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Owner-ID: <code className="text-xs">{ownerUserId}</code>
            </p>
          </CardContent>
        </Card>

        {/* ── Card 3: Google Integration ──────── */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Google Integration (Admin)</CardTitle>
            <CardDescription>
              Google-Verknüpfung verwalten und Redirect-Einstellung ändern.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {googleError && (
              <p className="text-sm text-destructive">{googleError}</p>
            )}

            {/* Current state */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-muted-foreground">Place ID</span>
                <p className="text-sm font-mono">
                  {googlePlaceId ?? "Nicht verknüpft"}
                </p>
              </div>
              {googlePlaceId && googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Review-Link öffnen
                </a>
              )}
            </div>

            {/* Redirect toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="google-redirect" className="text-sm">
                Google-Redirect aktiv
              </Label>
              <Switch
                id="google-redirect"
                checked={googleRedirectEnabled}
                onCheckedChange={handleGoogleRedirectToggle}
                disabled={!googlePlaceId || googleToggleLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPlaceId("");
                  setShowGoogleSearchDialog(true);
                }}
              >
                <MapPin className="mr-1 h-4 w-4" />
                Google-Verknüpfung ändern
              </Button>
              {googlePlaceId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGoogleRemoveDialog(true)}
                >
                  <Unlink className="mr-1 h-4 w-4" />
                  Verknüpfung entfernen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Dialogs ─────────────────────────────── */}

      {/* Suspend confirmation */}
      <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isSuspended ? "Praxis entsperren?" : "Praxis sperren?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isSuspended
                ? "Die Praxis kann danach wieder auf das Dashboard und Umfragen zugreifen."
                : "Die Praxis wird aus dem Dashboard ausgesperrt und Umfragen werden blockiert. Daten bleiben erhalten."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspend}
              disabled={suspendLoading}
              className={!isSuspended ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {suspendLoading
                ? "Wird verarbeitet…"
                : isSuspended
                  ? "Entsperren"
                  : "Sperren"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban confirmation */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Benutzer-Account sperren?</AlertDialogTitle>
            <AlertDialogDescription>
              Der Benutzer wird auf Supabase-Ebene gebannt und kann sich nicht
              mehr einloggen. Dies ist eine härtere Maßnahme als die
              Praxis-Sperrung.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={banLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {banLoading ? "Wird verarbeitet…" : "Account sperren"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation – type practice name */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Praxis löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Soft-Delete: Die Praxis und alle Umfragen werden deaktiviert.
              Stripe-Abo wird gekündigt. Geben Sie den Praxis-Namen ein zur
              Bestätigung:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input
              placeholder={practiceName}
              value={deleteConfirmName}
              onChange={(e) => setDeleteConfirmName(e.target.value)}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Tippen Sie <strong>{practiceName}</strong> ein
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmName("")}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading || deleteConfirmName !== practiceName}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Wird gelöscht…" : "Endgültig löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email change dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>E-Mail ändern</DialogTitle>
            <DialogDescription>
              Ändert die E-Mail in Supabase Auth und in der Datenbank.
              Es wird keine Bestätigungs-E-Mail gesendet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="new-email">Neue E-Mail</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleEmailChange}
              disabled={emailLoading || !newEmail || newEmail === email}
            >
              {emailLoading ? "Speichere…" : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generated password dialog */}
      <Dialog
        open={showPasswordDialog}
        onOpenChange={(open) => {
          setShowPasswordDialog(open);
          if (!open) {
            setGeneratedPassword("");
            setPasswordCopied(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passwort gesetzt</DialogTitle>
            <DialogDescription>
              Das neue Passwort wurde gesetzt. Kopieren Sie es jetzt – es wird
              nicht erneut angezeigt.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-md bg-muted p-3">
            <code className="flex-1 text-sm font-mono break-all">
              {generatedPassword}
            </code>
            <Button variant="ghost" size="sm" onClick={copyPassword}>
              {passwordCopied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Places search dialog */}
      <Dialog
        open={showGoogleSearchDialog}
        onOpenChange={setShowGoogleSearchDialog}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Google-Verknüpfung ändern</DialogTitle>
            <DialogDescription>
              Suchen Sie die Praxis auf Google und wählen Sie den richtigen
              Eintrag aus.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <GooglePlacesSearch
              value={selectedPlaceId}
              onChange={setSelectedPlaceId}
              initialQuery={practiceName}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleGoogleUpdate}
              disabled={googleUpdateLoading || !selectedPlaceId}
            >
              {googleUpdateLoading ? "Speichere…" : "Übernehmen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google remove confirmation */}
      <AlertDialog
        open={showGoogleRemoveDialog}
        onOpenChange={setShowGoogleRemoveDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Google-Verknüpfung entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Die Google Place ID, Review-URL und der Redirect werden
              zurückgesetzt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleGoogleRemove}
              disabled={googleRemoveLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {googleRemoveLoading ? "Wird entfernt…" : "Entfernen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
