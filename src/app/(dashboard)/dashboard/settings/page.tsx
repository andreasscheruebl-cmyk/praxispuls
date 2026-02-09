"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GooglePlacesSearch } from "@/components/dashboard/google-places-search";
import { LogoUpload } from "@/components/dashboard/logo-upload";

type PlaceInfo = { name: string; address: string; rating?: number; totalRatings?: number } | null;

export default function SettingsPage() {
  const [practice, setPractice] = useState<Record<string, string | number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentPlaceInfo, setCurrentPlaceInfo] = useState<PlaceInfo>(null);

  useEffect(() => {
    fetch("/api/practice").then(r => r.ok ? r.json() : null).then(d => {
      if (d) {
        setPractice(d);
        // Load details for existing Place ID
        if (d.googlePlaceId) {
          fetch(`/api/google/places?placeId=${encodeURIComponent(d.googlePlaceId)}`)
            .then(r => r.ok ? r.json() : null)
            .then(info => { if (info) setCurrentPlaceInfo(info); })
            .catch(() => {});
        }
      }
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!practice) return;
    setSaving(true); setMessage(null);
    const res = await fetch("/api/practice", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(practice) });
    setMessage(res.ok ? "Einstellungen gespeichert!" : "Fehler beim Speichern.");
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500" /></div>;
  if (!practice) return <p className="text-muted-foreground">Praxis nicht gefunden.</p>;

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold">Einstellungen</h1><p className="text-muted-foreground">Praxisdaten und Umfrage-Konfiguration</p></div>
      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Logo</CardTitle></CardHeader>
          <CardContent>
            <LogoUpload
              currentLogoUrl={practice.logoUrl ? String(practice.logoUrl) : null}
              onUpload={(url) => setPractice({ ...practice, logoUrl: url })}
            />
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-lg">Praxisdaten</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label htmlFor="name">Praxisname</Label><Input id="name" value={String(practice.name || "")} onChange={e => setPractice({...practice, name: e.target.value})} /></div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="postalCode">PLZ</Label><Input id="postalCode" value={String(practice.postalCode || "")} onChange={e => setPractice({...practice, postalCode: e.target.value})} maxLength={5} /></div>
              <div className="space-y-2"><Label htmlFor="alertEmail">Alert-E-Mail</Label><Input id="alertEmail" type="email" value={String(practice.alertEmail || "")} onChange={e => setPractice({...practice, alertEmail: e.target.value})} /></div>
            </div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-lg">Google-Verknüpfung</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">
            {/* Show current linked place info */}
            {practice.googlePlaceId && currentPlaceInfo && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-xs font-medium text-green-800">Aktuell verknüpft:</p>
                <p className="text-sm font-medium text-green-900">{currentPlaceInfo.name}</p>
                <p className="text-xs text-green-700">{currentPlaceInfo.address}</p>
                {currentPlaceInfo.rating && (
                  <p className="text-xs text-green-700">
                    {"★".repeat(Math.round(currentPlaceInfo.rating))}{"☆".repeat(5 - Math.round(currentPlaceInfo.rating))}{" "}
                    {currentPlaceInfo.rating}/5
                    {currentPlaceInfo.totalRatings ? ` (${currentPlaceInfo.totalRatings} Bewertungen)` : ""}
                  </p>
                )}
              </div>
            )}
            <Label>Google-Standort {practice.googlePlaceId ? "ändern" : "suchen"}</Label>
            <GooglePlacesSearch
              value={String(practice.googlePlaceId || "")}
              onChange={(placeId) => {
                setPractice({...practice, googlePlaceId: placeId});
                if (!placeId) setCurrentPlaceInfo(null);
              }}
              selectedName={currentPlaceInfo?.name || ""}
              postalCode={practice.postalCode ? String(practice.postalCode) : undefined}
            />
            <p className="text-xs text-muted-foreground">
              {practice.googlePlaceId
                ? "Zufriedene Patienten werden automatisch zum Google-Bewertungsformular weitergeleitet."
                : "Suchen Sie Ihre Praxis, um die Weiterleitung zum Google-Bewertungsformular zu aktivieren."}
            </p>
          </div></CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-lg">Umfrage</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>NPS-Schwellenwert (Google)</Label>
              <select value={Number(practice.npsThreshold || 9)} onChange={e => setPractice({...practice, npsThreshold: parseInt(e.target.value)})} className="w-full rounded-md border bg-white px-3 py-2 text-sm">
                <option value={8}>8+ (mehr Bewertungen)</option><option value={9}>9+ (Standard)</option><option value={10}>Nur 10</option>
              </select>
            </div>
            <div className="space-y-2"><Label>Praxis-Farbe</Label>
              <div className="flex items-center gap-3"><input type="color" value={String(practice.primaryColor || "#2563EB")} onChange={e => setPractice({...practice, primaryColor: e.target.value})} className="h-10 w-14 cursor-pointer rounded border" /><span className="text-sm text-muted-foreground">{String(practice.primaryColor || "#2563EB")}</span></div>
            </div>
          </CardContent>
        </Card>
        {message && <p className={`text-sm ${message.includes("Fehler") ? "text-destructive" : "text-green-600"}`}>{message}</p>}
        <Button type="submit" disabled={saving}>{saving ? "Wird gespeichert..." : "Einstellungen speichern"}</Button>
      </form>
    </div>
  );
}
