import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Patientenfeedback sammeln.{" "}
            <span className="text-primary">Google-Bewertungen steigern.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            QM-konforme Patientenbefragung mit automatischem Google-Review-Routing
            – in 5 Minuten eingerichtet, ab 49 €/Monat.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/register">Kostenlos starten</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#so-funktionierts">So funktioniert&apos;s</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Keine Kreditkarte nötig · DSGVO-konform · Server in Deutschland
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="so-funktionierts" className="border-t bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            So funktioniert PraxisPuls
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Von der Umfrage zur Google-Bewertung – vollautomatisch.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "QR-Code aufstellen",
                description:
                  "Drucken Sie den QR-Code aus und platzieren Sie ihn im Wartezimmer oder an der Rezeption.",
              },
              {
                step: "2",
                title: "Patienten geben Feedback",
                description:
                  "60-Sekunden-Umfrage auf dem Smartphone – anonym, ohne App-Download, ohne Login.",
              },
              {
                step: "3",
                title: "Bewertungen steigen automatisch",
                description:
                  "Zufriedene Patienten werden direkt zu Google weitergeleitet. Kritik bleibt intern.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            Einfache, faire Preise
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Weniger als eine PZR-Behandlung pro Monat.
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-2 text-3xl font-bold">0 €</p>
              <p className="text-sm text-muted-foreground">Zum Testen</p>
              <ul className="mt-6 space-y-2 text-sm">
                <li>✓ 30 Antworten/Monat</li>
                <li>✓ Google Review-Routing</li>
                <li>✓ QR-Code Download</li>
                <li>✓ Basis-Dashboard</li>
              </ul>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href="/register">Kostenlos starten</Link>
              </Button>
            </div>
            {/* Starter */}
            <div className="rounded-lg border-2 border-primary p-6 shadow-lg">
              <h3 className="text-lg font-semibold">Starter</h3>
              <p className="mt-2 text-3xl font-bold">49 €<span className="text-base font-normal text-muted-foreground">/Monat</span></p>
              <p className="text-sm text-muted-foreground">Für Einzelpraxen</p>
              <ul className="mt-6 space-y-2 text-sm">
                <li>✓ 200 Antworten/Monat</li>
                <li>✓ Alle 3 Templates</li>
                <li>✓ Detractor E-Mail-Alerts</li>
                <li>✓ Praxis-Branding</li>
                <li>✓ Freie Zeitraum-Filter</li>
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href="/register">Jetzt starten</Link>
              </Button>
            </div>
            {/* Professional */}
            <div className="rounded-lg border p-6">
              <h3 className="text-lg font-semibold">Professional</h3>
              <p className="mt-2 text-3xl font-bold">99 €<span className="text-base font-normal text-muted-foreground">/Monat</span></p>
              <p className="text-sm text-muted-foreground">Für Gemeinschaftspraxen</p>
              <ul className="mt-6 space-y-2 text-sm">
                <li>✓ Unbegrenzte Antworten</li>
                <li>✓ Alle Starter-Features</li>
                <li>✓ Prioritäts-Support</li>
                <li>✓ KI-Analyse (bald)</li>
                <li>✓ QM-Reports (bald)</li>
              </ul>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href="/register">Jetzt starten</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Showcase */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            Zwei Designs – Ihr Auftritt
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Wählen Sie das Design, das zu Ihrer Praxis passt. Jederzeit umschaltbar.
          </p>
          <div className="mx-auto mt-12 grid max-w-3xl gap-8 md:grid-cols-2">
            {/* Standard */}
            <div className="overflow-hidden rounded-xl border p-6 text-center">
              <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-blue-500" />
              <h3 className="text-lg font-semibold">Standard</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Klar & professionell – Blau, modern, bewährt.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-500" />
                <span className="h-6 w-6 rounded-full bg-blue-200" />
                <span className="h-6 w-6 rounded-full bg-gray-100 border" />
              </div>
            </div>
            {/* Vertrauen */}
            <div className="overflow-hidden rounded-xl border-2 border-teal-500 bg-creme-100 p-6 text-center">
              <div className="mx-auto mb-4 h-10 w-10 rounded-full bg-teal-500" />
              <h3 className="font-heading text-lg font-semibold text-charcoal">Vertrauen</h3>
              <p className="mt-2 text-sm text-charcoal-400">
                Warm & premium – Teal, Sage, Creme, Serif-Akzente.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <span className="h-6 w-6 rounded-full bg-teal-500" />
                <span className="h-6 w-6 rounded-full bg-sage-400" />
                <span className="h-6 w-6 rounded-full bg-creme-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">
            Bereit für bessere Google-Bewertungen?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            In 5 Minuten eingerichtet. Kostenlos testen. Keine Kreditkarte nötig.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-white text-primary hover:bg-gray-100"
          >
            <Link href="/register">Kostenlos starten</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
