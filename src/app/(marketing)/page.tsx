import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="flex min-h-[60vh] items-center py-20 md:min-h-[80vh] md:py-32">
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
      <section id="so-funktionierts" className="border-t bg-muted/50 py-20">
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

      {/* Trust & DSGVO */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            Datenschutz ist bei uns Pflicht, nicht Option
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Als Gesundheitsdienstleister wissen Sie: Patientendaten sind sensibel. Deshalb haben wir PraxisPuls von Grund auf datenschutzkonform gebaut.
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Privacy by Design",
                description:
                  "Datenschutz ist kein Nachgedanke, sondern Architekturprinzip. Wir erheben nur, was nötig ist – und nichts darüber hinaus.",
              },
              {
                title: "Keine personenbezogenen Daten",
                description:
                  "Umfragen sind komplett anonym. Wir speichern weder Patientennamen, E-Mail-Adressen noch IP-Adressen.",
              },
              {
                title: "Hosting in Deutschland",
                description:
                  "Alle Daten liegen auf Servern in Frankfurt am Main (Supabase EU). Kein Transfer in Drittländer.",
              },
              {
                title: "DSGVO & AVV inklusive",
                description:
                  "Auftragsverarbeitungsvertrag direkt in unseren AGB integriert. Keine Extra-Verhandlungen nötig.",
              },
              {
                title: "Verschlüsselt & geschützt",
                description:
                  "TLS-Verschlüsselung, Row Level Security in der Datenbank, und regelmäßige Backups. Ihre Daten gehören Ihnen.",
              },
              {
                title: "Audit-transparent",
                description:
                  "Vollständige Dokumentation aller Datenverarbeitungen. Unterauftragsverarbeiter (Supabase, Vercel, Stripe) sind in den AGB offengelegt.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border bg-card p-6 text-center">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QM Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            QM-konforme Patientenbefragung
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Die G-BA-Richtlinie fordert regelmäßige Patientenbefragungen als Teil des
            Qualitätsmanagements. PraxisPuls macht das einfach.
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Validierte Fragebögen",
                description:
                  "Vorkonfigurierte Umfragen angelehnt an G-BA- und ÄZQ-Standards. Empfehlungsfrage + Kategoriebewertungen – vergleichbar und nachvollziehbar.",
              },
              {
                title: "Automatische Auswertung",
                description:
                  "Ergebnisse in Echtzeit im Dashboard. Trends über Wochen und Monate erkennen, ohne manuelles Auszählen.",
              },
              {
                title: "QM-Berichte als PDF",
                description:
                  "Automatisch generierte Berichte für Praxis-Audits. Alle Daten aufbereitet und exportierbar – bereit für die nächste QM-Prüfung.",
              },
              {
                title: "Lückenlose Archivierung",
                description:
                  "Alle Umfrageergebnisse digital gespeichert. Keine Papierberge, keine verlorenen Bögen – alles auf Knopfdruck.",
              },
              {
                title: "Sofort-Alerts bei Kritik",
                description:
                  "Negative Rückmeldungen lösen automatisch eine E-Mail an Sie aus – damit Sie schnell reagieren können.",
              },
              {
                title: "Anonyme Teilnahme",
                description:
                  "Patienten antworten anonym per Smartphone. Keine App, kein Login – das senkt die Hemmschwelle und erhöht die Rücklaufquote.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border bg-card p-5">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
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
          <div className="mx-auto mt-4 w-fit rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-center text-sm font-semibold text-primary">
            Weniger als eine PZR-Behandlung pro Monat
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-3">
            {/* Free */}
            <div className="flex flex-col rounded-lg border p-6">
              <h3 className="text-lg font-semibold">Free</h3>
              <p className="mt-2 text-3xl font-bold">0 €</p>
              <p className="text-sm text-muted-foreground">Zum Testen</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                <li>✓ 30 Antworten/Monat</li>
                <li>✓ Google Review-Routing</li>
                <li>✓ QR-Code Download</li>
                <li>✓ Dashboard (30-Tage-Ansicht)</li>
              </ul>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href="/register">Kostenlos starten</Link>
              </Button>
            </div>
            {/* Starter */}
            <div className="relative flex flex-col rounded-lg border-2 border-primary p-6 shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">Beliebt</div>
              <h3 className="text-lg font-semibold">Starter</h3>
              <p className="mt-2 text-3xl font-bold">49 €<span className="text-base font-normal text-muted-foreground">/Monat</span></p>
              <p className="text-sm text-muted-foreground">Für Einzelpraxen</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
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
            <div className="flex flex-col rounded-lg border p-6">
              <h3 className="text-lg font-semibold">Professional</h3>
              <p className="mt-2 text-3xl font-bold">99 €<span className="text-base font-normal text-muted-foreground">/Monat</span></p>
              <p className="text-sm text-muted-foreground">Für Gemeinschaftspraxen</p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
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

      {/* FAQ */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            Häufig gestellte Fragen
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Offene Antworten auf die Fragen, die wir am häufigsten hören.
          </p>
          <div className="mx-auto mt-12 max-w-3xl space-y-4">
            {[
              {
                question: "Fühlen sich Patienten durch die Umfrage gestört?",
                answer:
                  "Erfahrungsgemäß nicht. 85 % der Patienten geben gerne Feedback, wenn man sie freundlich fragt. Die Umfrage dauert nur 60 Sekunden und ist komplett freiwillig. Viele Patienten schätzen es, dass ihre Meinung zählt.",
              },
              {
                question: "Wie wichtig sind Google-Bewertungen wirklich?",
                answer:
                  "Studien zeigen: Rund 42 % der Patienten lesen Bewertungen vor dem ersten Besuch, und über 73 % besuchen die Praxis-Website. Gute Bewertungen sind heute ein wichtiger Faktor, wie Patienten ihre Praxis finden.",
              },
              {
                question: "Wie viel Zeit muss ich investieren?",
                answer:
                  "Das Einrichten dauert ca. 15 Minuten. Danach läuft alles automatisch: QR-Code aufstellen, Patienten scannen, Ergebnisse erscheinen im Dashboard. Sie entscheiden selbst, wie oft Sie reinschauen.",
              },
              {
                question: "Ist das für QM-Zwecke geeignet?",
                answer:
                  "Ja. Die G-BA fordert regelmäßige Patientenbefragungen. PraxisPuls wertet die Ergebnisse automatisch aus und archiviert sie digital. Bei einer QM-Prüfung haben Sie alle Daten auf Knopfdruck parat.",
              },
              {
                question: "Lohnt sich das finanziell?",
                answer:
                  "Der Starter-Plan kostet 49 €/Monat – weniger als eine PZR-Behandlung. Schon ein einzelner Neupatient, der Sie über bessere Google-Bewertungen findet, macht die Investition mehr als wett.",
              },
              {
                question: "Wie steht es um den Datenschutz?",
                answer:
                  "Alle Umfragen sind anonym – wir speichern weder Patientennamen noch Kontaktdaten. Server stehen in Frankfurt, AVV ist inklusive, und die gesamte Übertragung ist TLS-verschlüsselt.",
              },
            ].map((item) => (
              <div
                key={item.question}
                className="rounded-xl border bg-card p-6"
              >
                <p className="font-semibold text-foreground">
                  {item.question}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Calculation */}
      <section className="border-t py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-3xl font-bold">
            Rechnet sich das?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
            Ein transparentes Rechenbeispiel – bewusst konservativ geschätzt.
          </p>
          <div className="mx-auto mt-12 max-w-3xl">
            {/* ROI Example */}
            <div className="rounded-xl border bg-card p-6 md:p-8">
              <h3 className="text-lg font-semibold">Rechenbeispiel: Einzelpraxis</h3>
              <div className="mt-6 space-y-6">
                {/* Before/After */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vorher</p>
                    <p className="mt-2 text-2xl font-bold">3,8 Sterne</p>
                    <p className="text-sm text-muted-foreground">45 Google-Bewertungen</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary">Nach 6 Monaten</p>
                    <p className="mt-2 text-2xl font-bold text-primary">4,6 Sterne</p>
                    <p className="text-sm text-muted-foreground">120 Google-Bewertungen</p>
                  </div>
                </div>

                {/* Calculation */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Zusätzliche Neupatienten/Monat (konservativ)</span>
                    <span className="font-semibold">+2</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Wert pro Neupatient (1. Jahr)</span>
                    <span className="font-semibold">1.500 €</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Zusatzeinnahmen pro Jahr</span>
                    <span className="font-semibold text-primary">36.000 €</span>
                  </div>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-muted-foreground">Kosten PraxisPuls (Starter)</span>
                    <span className="font-semibold">588 €/Jahr</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                    <span className="font-semibold">Return on Investment</span>
                    <span className="text-xl font-bold text-primary">61:1</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Noch konservativer gerechnet (1 Neupatient/Monat): 18.000 € Zusatzeinnahmen = ROI von 30:1.
                  Das Tool kostet weniger als eine einzelne PZR-Behandlung pro Monat.
                </p>
              </div>
            </div>

            {/* QM Comparison */}
            <div className="mt-8 rounded-xl border bg-card p-6 md:p-8">
              <h3 className="text-lg font-semibold">QM-Vergleich: Papier vs. PraxisPuls</h3>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Papier-Befragung</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Druckkosten</span>
                      <span>~200 €/Jahr</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Arbeitszeit (8h/Jahr)</span>
                      <span>~400 €/Jahr</span>
                    </li>
                    <li className="flex justify-between border-t pt-2">
                      <span className="font-medium">Gesamt</span>
                      <span className="font-semibold">~600 €/Jahr</span>
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Keine Insights, keine Trends, keine Automatisierung, kein Google-Routing.
                  </p>
                </div>
                <div className="rounded-lg bg-primary/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-primary">PraxisPuls Starter</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Monatlich</span>
                      <span>49 €/Monat</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-muted-foreground">Arbeitszeit</span>
                      <span>0 h (automatisch)</span>
                    </li>
                    <li className="flex justify-between border-t pt-2">
                      <span className="font-medium">Gesamt</span>
                      <span className="font-semibold text-primary">588 €/Jahr</span>
                    </li>
                  </ul>
                  <p className="mt-3 text-xs text-muted-foreground">
                    + Trends, Alerts, Google-Routing, QM-Archivierung auf Knopfdruck.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t bg-gradient-to-br from-primary to-primary/80 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Bereit für bessere Google-Bewertungen?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
            In 5 Minuten eingerichtet. Kostenlos testen. Keine Kreditkarte nötig.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-primary-foreground/60">
            <span>DSGVO-konform</span>
            <span aria-hidden>·</span>
            <span>Server in Deutschland</span>
            <span aria-hidden>·</span>
            <span>Keine Bindung</span>
          </div>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-white text-primary shadow-lg hover:bg-white/90"
          >
            <Link href="/register">Kostenlos starten</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
