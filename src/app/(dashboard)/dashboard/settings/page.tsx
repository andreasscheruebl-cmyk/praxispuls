"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [practice, setPractice] = useState<Record<string, string | number> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/practice").then(r => r.ok ? r.json() : null).then(d => { if (d) setPractice(d); }).finally(() => setLoading(false));
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
          <CardContent><div className="space-y-2"><Label htmlFor="gpi">Google Place ID</Label><Input id="gpi" value={String(practice.googlePlaceId || "")} onChange={e => setPractice({...practice, googlePlaceId: e.target.value})} placeholder="ChIJ..." /><p className="text-xs text-muted-foreground">Für die Weiterleitung zum Google-Bewertungsformular.</p></div></CardContent>
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
