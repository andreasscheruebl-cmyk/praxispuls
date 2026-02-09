"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Check, Zap, Crown, FileText, Download } from "lucide-react";

type PlanId = "free" | "starter" | "professional";

const PLANS = [
  {
    id: "free" as PlanId,
    name: "Free",
    price: "0 €",
    period: "",
    features: [
      "30 Antworten / Monat",
      "1 Umfrage-Template",
      "Google Review Routing",
      "QR-Code Download",
      "Dashboard (30-Tage-Ansicht)",
    ],
    missingFeatures: [
      "E-Mail-Alerts",
      "Praxis-Branding",
      "Zeitraum-Filter",
    ],
  },
  {
    id: "starter" as PlanId,
    name: "Starter",
    price: "49 €",
    period: "/ Monat",
    popular: true,
    features: [
      "200 Antworten / Monat",
      "Alle 3 Templates",
      "Google Review Routing",
      "QR-Code Download",
      "Dashboard mit Trends & Kategorien",
      "E-Mail-Alerts",
      "Praxis-Branding (Logo & Farben)",
      "Freier Zeitraum-Filter",
    ],
    missingFeatures: [],
  },
  {
    id: "professional" as PlanId,
    name: "Professional",
    price: "99 €",
    period: "/ Monat",
    features: [
      "Unbegrenzte Antworten",
      "Alle 3 Templates",
      "Google Review Routing",
      "QR-Code Download",
      "Dashboard mit Trends & Kategorien",
      "E-Mail-Alerts",
      "Praxis-Branding (Logo & Farben)",
      "Freier Zeitraum-Filter",
      "Prioritäts-Support",
    ],
    missingFeatures: [],
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<PlanId>("free");
  const [hasStripeCustomer, setHasStripeCustomer] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Array<{
    id: string;
    number: string | null;
    date: number;
    amount: number;
    currency: string;
    status: string | null;
    pdfUrl: string | null;
    hostedUrl: string | null;
  }>>([]);

  useEffect(() => {
    fetch("/api/practice")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) setCurrentPlan(data.plan as PlanId);
        if (data.stripeCustomerId) {
          setHasStripeCustomer(true);
          // Load invoices
          fetch("/api/billing/invoices")
            .then((r) => r.json())
            .then((d) => {
              if (d.invoices) setInvoices(d.invoices);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  async function handleCheckout(plan: "starter" | "professional") {
    setLoading(plan);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Fehler beim Erstellen der Checkout-Session.");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Fehler beim Öffnen des Kundenportals.");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(null);
    }
  }

  const planIcon = (id: PlanId) => {
    if (id === "professional") return Crown;
    if (id === "starter") return Zap;
    return CreditCard;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Abrechnung</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Abonnement und Ihre Rechnungen.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isActive = currentPlan === plan.id;
          const Icon = planIcon(plan.id);

          return (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-md"
                  : ""
              } ${isActive ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
                  Beliebt
                </div>
              )}
              <CardHeader className="text-center">
                <Icon className="mx-auto h-8 w-8 text-primary" />
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      {feature}
                    </li>
                  ))}
                  {plan.missingFeatures.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-muted-foreground line-through"
                    >
                      <span className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="pt-2">
                  {isActive ? (
                    <div className="text-center">
                      <span className="inline-flex items-center rounded-md bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary">
                        Aktueller Plan
                      </span>
                    </div>
                  ) : plan.id === "free" ? (
                    // No downgrade button for free – use Stripe Portal
                    hasStripeCustomer ? (
                      <button
                        onClick={handlePortal}
                        disabled={loading !== null}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                        {loading === "portal" ? "Wird geladen…" : "Abo verwalten"}
                      </button>
                    ) : null
                  ) : (
                    <button
                      onClick={() => handleCheckout(plan.id as "starter" | "professional")}
                      disabled={loading !== null}
                      className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                    >
                      {loading === plan.id
                        ? "Wird geladen…"
                        : currentPlan === "free"
                        ? `Auf ${plan.name} upgraden`
                        : `Zu ${plan.name} wechseln`}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Invoices list */}
      {hasStripeCustomer && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Rechnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {inv.number || inv.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(inv.date * 1000).toLocaleDateString("de-DE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        inv.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {inv.status === "paid" ? "Bezahlt" : inv.status}
                    </span>
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stripe Portal link for existing customers */}
      {hasStripeCustomer && (
        <Card>
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <h3 className="font-semibold">Zahlungsmethode & Abo verwalten</h3>
              <p className="text-sm text-muted-foreground">
                Zahlungsdaten ändern, Abo kündigen oder Plan wechseln.
              </p>
            </div>
            <button
              onClick={handlePortal}
              disabled={loading !== null}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {loading === "portal" ? "Wird geladen…" : "Abo & Zahlung verwalten"}
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
