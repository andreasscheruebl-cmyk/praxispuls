export const metadata = {
  title: "Datenschutzerklärung – PraxisPuls",
  description: "Datenschutzerklärung von PraxisPuls – DSGVO-konform.",
};

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>
      <div className="mt-8 space-y-8 text-muted-foreground">

        {/* 1. Verantwortlicher */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">1. Verantwortlicher</h2>
          <p className="mt-2">
            {/* TODO: Eigene Daten einsetzen */}
            [Vor- und Nachname]<br />
            [Straße Hausnummer]<br />
            [PLZ Ort]<br />
            E-Mail: info@praxispuls.de
          </p>
        </section>

        {/* 2. Überblick */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">2. Überblick der Verarbeitungen</h2>
          <p className="mt-2">
            PraxisPuls ist ein SaaS-Dienst für Zahnarztpraxen zur Durchführung von
            Patientenumfragen und zur Verwaltung von Google-Bewertungen. Wir verarbeiten
            personenbezogene Daten ausschließlich im Rahmen der Bereitstellung unserer
            Dienstleistungen und auf Grundlage der DSGVO.
          </p>
        </section>

        {/* 3. Patientenumfrage */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">3. Patientenumfrage (Anonyme Erhebung)</h2>
          <p className="mt-2">
            Die Patientenumfrage ist <strong>vollständig anonym</strong>. Es werden keine
            personenbezogenen Daten erhoben:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Kein Name, keine E-Mail-Adresse</li>
            <li>Keine IP-Adresse wird gespeichert</li>
            <li>Kein Tracking durch Cookies (außer optionaler Session-Hash zur Deduplizierung)</li>
          </ul>
          <p className="mt-2">
            Gespeichert werden ausschließlich: NPS-Score (0-10), Kategorie-Bewertungen (1-5 Sterne),
            optionaler Freitext, Gerätetyp und Antwortkanal. Diese Daten lassen keinen Rückschluss
            auf einzelne Personen zu.
          </p>
          <p className="mt-2">
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse
            der Praxis an Qualitätssicherung).
          </p>
        </section>

        {/* 4. Praxis-Accounts */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">4. Praxis-Accounts (Registrierung)</h2>
          <p className="mt-2">
            Bei der Registrierung als Praxisinhaber verarbeiten wir:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>E-Mail-Adresse (zur Authentifizierung und Kommunikation)</li>
            <li>Praxisname und PLZ</li>
            <li>Passwort (verschlüsselt gespeichert, niemals im Klartext)</li>
          </ul>
          <p className="mt-2">
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        {/* 5. Zahlungsdaten */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">5. Zahlungsdaten</h2>
          <p className="mt-2">
            Die Zahlungsabwicklung erfolgt über <strong>Stripe, Inc.</strong> (USA).
            Kreditkartendaten und Bankverbindungen werden ausschließlich von Stripe verarbeitet
            und niemals auf unseren Servern gespeichert. Stripe ist nach PCI DSS Level 1
            zertifiziert.
          </p>
          <p className="mt-2">
            Datenschutzhinweise von Stripe:{" "}
            <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              stripe.com/de/privacy
            </a>
          </p>
          <p className="mt-2">
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        {/* 6. E-Mail */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">6. E-Mail-Versand</h2>
          <p className="mt-2">
            Transaktionale E-Mails (Registrierungsbestätigung, Detractor-Alerts, Upgrade-Hinweise)
            werden über <strong>Resend</strong> versendet. Es werden nur die E-Mail-Adresse des
            Empfängers und der Nachrichteninhalt übermittelt.
          </p>
          <p className="mt-2">
            <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
          </p>
        </section>

        {/* 7. Google */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">7. Google-Integration</h2>
          <p className="mt-2">
            Wir nutzen die <strong>Google Places API</strong> ausschließlich zur Suche und
            Verknüpfung der Praxis mit ihrem Google-Business-Profil. Es werden keine Daten
            von Patienten an Google übermittelt. Wenn ein Patient auf den Google-Review-Link
            klickt, verlässt er PraxisPuls und interagiert direkt mit Google.
          </p>
        </section>

        {/* 8. Hosting */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">8. Hosting und Speicherung</h2>
          <p className="mt-2">
            Unsere Anwendung wird auf <strong>Vercel</strong> (Edge Network) gehostet.
            Die Datenbank läuft auf <strong>Supabase</strong> in der Region{" "}
            <strong>Frankfurt am Main (eu-central-1)</strong>. Alle Daten verbleiben in
            der Europäischen Union. Supabase ist SOC 2 Type II und HIPAA-compliant.
          </p>
        </section>

        {/* 9. Cookies */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
          <p className="mt-2">
            PraxisPuls verwendet ausschließlich <strong>technisch notwendige Cookies</strong>
            für die Authentifizierung (Session-Cookie). Wir verwenden keine Tracking-,
            Marketing- oder Analytics-Cookies. Ein Cookie-Banner ist daher nicht erforderlich.
          </p>
        </section>

        {/* 10. Rechte */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">10. Ihre Rechte</h2>
          <p className="mt-2">Sie haben folgende Rechte:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Auskunft</strong> (Art. 15 DSGVO)</li>
            <li><strong>Berichtigung</strong> (Art. 16 DSGVO)</li>
            <li><strong>Löschung</strong> (Art. 17 DSGVO)</li>
            <li><strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
            <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
            <li><strong>Widerspruch</strong> (Art. 21 DSGVO)</li>
          </ul>
          <p className="mt-2">
            Zur Ausübung Ihrer Rechte wenden Sie sich bitte an: info@praxispuls.de
          </p>
          <p className="mt-2">
            Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren, z. B. beim
            Bayerischen Landesamt für Datenschutzaufsicht (BayLDA).
          </p>
        </section>

        {/* 11. Auftragsverarbeitung */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">11. Auftragsverarbeitung</h2>
          <p className="mt-2">
            Zwischen PraxisPuls und den nutzenden Praxen besteht ein Auftragsverarbeitungsvertrag
            (AVV) gemäß Art. 28 DSGVO. Dieser regelt die Verantwortlichkeiten bei der Verarbeitung
            von Umfragedaten. PraxisPuls handelt ausschließlich im Auftrag der jeweiligen Praxis.
          </p>
        </section>

        {/* 12. Änderungen */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">12. Änderungen dieser Datenschutzerklärung</h2>
          <p className="mt-2">
            Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren,
            um sie an geänderte Rechtslagen oder Änderungen unseres Dienstes anzupassen.
            Die aktuelle Version finden Sie stets auf dieser Seite.
          </p>
          <p className="mt-4 text-sm">Stand: Februar 2026</p>
        </section>
      </div>
    </div>
  );
}
