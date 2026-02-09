"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Trash2, AlertTriangle, Monitor, Smartphone, Globe, KeyRound, Check } from "lucide-react";

type LoginEvent = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  method: string | null;
  createdAt: string;
};

function parseDevice(ua: string | null): { label: string; icon: "desktop" | "mobile" | "unknown" } {
  if (!ua) return { label: "Unbekanntes Gerät", icon: "unknown" };
  const lower = ua.toLowerCase();
  const isPhone = /mobile|iphone|android(?!.*tablet)|ipod/.test(lower);
  const isTablet = /tablet|ipad/.test(lower);

  let browser = "Browser";
  if (lower.includes("chrome") && !lower.includes("edg")) browser = "Chrome";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("safari") && !lower.includes("chrome")) browser = "Safari";
  else if (lower.includes("edg")) browser = "Edge";

  let os = "";
  if (lower.includes("windows")) os = "Windows";
  else if (lower.includes("mac os")) os = "macOS";
  else if (lower.includes("linux")) os = "Linux";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone") || lower.includes("ipad")) os = "iOS";

  const device = isTablet ? "Tablet" : isPhone ? "Smartphone" : "Desktop";
  return {
    label: `${browser} · ${os || device}`,
    icon: isPhone || isTablet ? "mobile" : "desktop",
  };
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Gerade eben";
  if (minutes < 60) return `vor ${minutes} Min.`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `vor ${days} Tagen`;
  return formatDate(dateStr);
}

export default function ProfilePage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch login history
    fetch("/api/auth/login-event")
      .then((r) => r.ok ? r.json() : { events: [] })
      .then((data) => setLoginHistory(data.events || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));

    // Get user email
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function handlePasswordChange() {
    if (newPassword.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.");
      return;
    }
    setPwLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const supabase = createClient();
      const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
      if (pwError) {
        setError(pwError.message);
      } else {
        setSuccess("Passwort erfolgreich geändert.");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setPwLoading(false);
    }
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fehler beim Löschen des Accounts.");
        setDeleteLoading(false);
        return;
      }
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-muted-foreground">
          Kontoverwaltung und Sicherheit.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      {/* Account Info */}
      {userEmail && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Konto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {userEmail[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">{userEmail}</p>
                <p className="text-xs text-muted-foreground">E-Mail-Anmeldung</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <KeyRound className="h-5 w-5" />
            Passwort ändern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPw" className="text-sm">Neues Passwort</Label>
              <Input
                id="newPw"
                type="password"
                placeholder="Mindestens 8 Zeichen"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPw" className="text-sm">Passwort bestätigen</Label>
              <Input
                id="confirmPw"
                type="password"
                placeholder="Passwort wiederholen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handlePasswordChange} disabled={pwLoading || !newPassword}>
              {pwLoading ? "Wird gespeichert…" : "Passwort ändern"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Anmelde-Verlauf</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="flex justify-center py-6">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
            </div>
          ) : loginHistory.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Noch keine Anmeldungen aufgezeichnet.
            </p>
          ) : (
            <div className="space-y-3">
              {loginHistory.map((event, i) => {
                const device = parseDevice(event.userAgent);
                const isFirst = i === 0;
                const DeviceIcon = device.icon === "mobile" ? Smartphone : device.icon === "desktop" ? Monitor : Globe;
                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 ${isFirst ? "border-primary/30 bg-primary/5" : ""}`}
                  >
                    <DeviceIcon className={`mt-0.5 h-4 w-4 shrink-0 ${isFirst ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{device.label}</p>
                        {isFirst && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            Aktuelle Sitzung
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                        <span>{timeAgo(event.createdAt)}</span>
                        {event.ipAddress && <span>{event.ipAddress}</span>}
                        {event.method && event.method !== "password" && (
                          <span className="capitalize">{event.method.replace("_", " ")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Abmelden</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Sie werden von Ihrem PraxisPuls-Konto abgemeldet.
          </p>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Abmelden
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-600">
            Account löschen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Ihr Account und alle zugehörigen Daten (Praxis, Umfragen, Antworten)
            werden unwiderruflich gelöscht. Ein aktives Stripe-Abo wird automatisch
            gekündigt.
          </p>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Account löschen
            </Button>
          ) : (
            <div className="space-y-4 rounded-md border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">
                    Sind Sie sicher?
                  </p>
                  <p className="mt-1 text-sm text-red-700">
                    Diese Aktion kann nicht rückgängig gemacht werden. Alle Ihre
                    Daten werden permanent gelöscht.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                >
                  {deleteLoading
                    ? "Wird gelöscht..."
                    : "Ja, Account endgültig löschen"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteLoading}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
