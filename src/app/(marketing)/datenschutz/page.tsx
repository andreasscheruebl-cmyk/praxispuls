export const metadata = { title: "Datenschutzerklärung" };

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Verantwortlicher</h2>
          <p className="mt-2">[Name und Kontaktdaten des Verantwortlichen]</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Patientenumfrage</h2>
          <p className="mt-2">
            Die Patientenumfrage ist vollständig anonym. Es werden keine personenbezogenen
            Daten wie Name, E-Mail-Adresse oder IP-Adresse gespeichert. Zur Vermeidung
            von Mehrfach-Teilnahmen wird ein temporärer Session-Hash verwendet, der keine
            Rückschlüsse auf die Person zulässt.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Hosting</h2>
          <p className="mt-2">
            Die Daten werden auf Servern in Frankfurt am Main (Deutschland) gehostet.
            Unser Hosting-Provider ist Supabase (HIPAA-compliant).
          </p>
        </section>
        <p className="text-sm italic">
          [Vollständige Datenschutzerklärung wird vor Go-Live ergänzt.]
        </p>
      </div>
    </div>
  );
}
