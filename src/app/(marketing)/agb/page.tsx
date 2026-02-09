export const metadata = {
  title: "AGB – PraxisPuls",
  description: "Allgemeine Geschäftsbedingungen von PraxisPuls.",
};

export default function AGBPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>
      <div className="mt-8 space-y-8 text-muted-foreground">

        {/* §1 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 1 Geltungsbereich</h2>
          <p className="mt-2">
            Diese Allgemeinen Geschäftsbedingungen (AGB) gelten f&uuml;r die Nutzung des
            SaaS-Dienstes &bdquo;PraxisPuls&ldquo; (nachfolgend &bdquo;Dienst&ldquo;), betrieben von [Vor- und Nachname],
            [Adresse] (nachfolgend &bdquo;Anbieter&ldquo;), durch den Kunden (nachfolgend &bdquo;Kunde&ldquo;).
          </p>
          <p className="mt-2">
            Der Dienst richtet sich ausschlie&szlig;lich an Unternehmer im Sinne des &#167; 14 BGB,
            insbesondere an Inhaber und Betreiber von Zahnarztpraxen.
          </p>
        </section>

        {/* §2 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 2 Vertragsgegenstand</h2>
          <p className="mt-2">
            PraxisPuls stellt dem Kunden eine webbasierte Plattform zur Durchf&uuml;hrung anonymer
            Patientenumfragen, zum intelligenten Routing von Google-Bewertungen sowie zur
            Auswertung der Ergebnisse in einem Dashboard bereit.
          </p>
          <p className="mt-2">
            Der genaue Funktionsumfang richtet sich nach dem gew&auml;hlten Tarif
            (Free, Starter oder Professional).
          </p>
        </section>

        {/* §3 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 3 Vertragsschluss und Registrierung</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Der Vertrag kommt durch Registrierung auf der Website zustande.</li>
            <li>Der Kunde versichert, dass die bei der Registrierung angegebenen Daten korrekt sind.</li>
            <li>Der Zugang ist pers&ouml;nlich und darf nicht an Dritte weitergegeben werden.</li>
          </ol>
        </section>

        {/* §4 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 4 Tarife und Preise</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Der Dienst ist im Tarif &bdquo;Free&ldquo; kostenlos nutzbar (max. 30 Antworten/Monat).</li>
            <li>Kostenpflichtige Tarife (Starter: 49 &euro;/Monat, Professional: 99 &euro;/Monat) werden monatlich im Voraus abgerechnet.</li>
            <li>Alle Preise verstehen sich zzgl. gesetzlicher Mehrwertsteuer.</li>
            <li>Die Zahlungsabwicklung erfolgt &uuml;ber Stripe. Der Kunde stimmt den Nutzungsbedingungen von Stripe zu.</li>
          </ol>
        </section>

        {/* §5 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 5 Vertragslaufzeit und K&uuml;ndigung</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Kostenpflichtige Tarife verl&auml;ngern sich automatisch um jeweils einen Monat, sofern nicht gek&uuml;ndigt wird.</li>
            <li>Die K&uuml;ndigung ist jederzeit zum Ende der laufenden Abrechnungsperiode m&ouml;glich, &uuml;ber das Stripe-Kundenportal oder per E-Mail an info@praxispuls.de.</li>
            <li>Nach K&uuml;ndigung eines kostenpflichtigen Tarifs wird der Account auf den Free-Tarif herabgestuft.</li>
            <li>Der Kunde kann sein Konto und alle damit verbundenen Daten jederzeit vollst&auml;ndig l&ouml;schen lassen.</li>
          </ol>
        </section>

        {/* §6 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 6 Pflichten des Kunden</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Der Kunde ist f&uuml;r die rechtskonforme Nutzung des Dienstes verantwortlich, insbesondere im Hinblick auf Datenschutzvorschriften in seiner Praxis.</li>
            <li>Der Kunde stellt sicher, dass die Teilnahme an der Patientenumfrage freiwillig erfolgt.</li>
            <li>Der Kunde verpflichtet sich, den Dienst nicht missbr&auml;uchlich zu nutzen (z. B. durch k&uuml;nstliches Erzeugen von Bewertungen).</li>
            <li>Der Kunde h&auml;lt seine Zugangsdaten vertraulich.</li>
          </ol>
        </section>

        {/* §7 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 7 Verf&uuml;gbarkeit</h2>
          <p className="mt-2">
            Der Anbieter bem&uuml;ht sich um eine m&ouml;glichst ununterbrochene Verf&uuml;gbarkeit des Dienstes.
            Ein Anspruch auf 100 % Verf&uuml;gbarkeit besteht nicht. Wartungsarbeiten werden nach
            M&ouml;glichkeit angek&uuml;ndigt.
          </p>
        </section>

        {/* §8 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 8 Datenschutz</h2>
          <p className="mt-2">
            Die Verarbeitung personenbezogener Daten erfolgt gem&auml;&szlig; unserer{" "}
            <a href="/datenschutz" className="text-primary underline">Datenschutzerkl&auml;rung</a>.
          </p>
          <p className="mt-2">
            Soweit der Anbieter im Auftrag des Kunden personenbezogene Daten verarbeitet,
            schlie&szlig;en die Parteien einen Auftragsverarbeitungsvertrag (AVV) nach Art. 28 DSGVO.
            Die nachfolgenden Regelungen gelten als AVV im Sinne der DSGVO:
          </p>

          <h3 className="mt-4 text-lg font-semibold text-foreground">8.1 Gegenstand und Dauer der Verarbeitung</h3>
          <p className="mt-2">
            Der Anbieter verarbeitet im Auftrag des Kunden anonymisierte Umfrageantworten
            (NPS-Score, Kategorie-Bewertungen, Freitext) sowie technische Metadaten
            (Ger&auml;tetyp, Kanal, Session-Hash). Die Verarbeitung dauert f&uuml;r die Laufzeit
            des Vertragverh&auml;ltnisses. Personenbezogene Daten des Kunden (E-Mail, Praxisname)
            werden als Bestandsdaten im Rahmen des Hauptvertrages verarbeitet.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-foreground">8.2 Art und Zweck der Verarbeitung</h3>
          <p className="mt-2">
            Zweck der Datenverarbeitung ist die Bereitstellung des SaaS-Dienstes PraxisPuls,
            insbesondere die Erfassung, Speicherung und Auswertung anonymer Patientenumfragen,
            das Routing zufriedener Patienten zu Google-Bewertungen sowie die Benachrichtigung
            des Kunden bei kritischem Feedback (Detractor-Alerts).
          </p>

          <h3 className="mt-4 text-lg font-semibold text-foreground">8.3 Kategorien betroffener Personen und Daten</h3>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Betroffene Personen:</strong> Patienten des Kunden (anonym), Praxismitarbeiter (Konto-Inhaber).</li>
            <li><strong>Datenkategorien:</strong> Umfrageantworten (anonymisiert), E-Mail-Adresse und Praxisdaten des Kunden, technische Nutzungsdaten.</li>
          </ul>

          <h3 className="mt-4 text-lg font-semibold text-foreground">8.4 Pflichten des Anbieters (Auftragsverarbeiter)</h3>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Der Anbieter verarbeitet Daten ausschlie&szlig;lich auf dokumentierte Weisung des Kunden, es sei denn, eine Verarbeitung ist nach Unionsrecht oder dem Recht des betreffenden Mitgliedstaats erforderlich.</li>
            <li>Der Anbieter gew&auml;hrleistet, dass sich die zur Verarbeitung befugten Personen zur Vertraulichkeit verpflichtet haben.</li>
            <li>Der Anbieter ergreift geeignete technische und organisatorische Ma&szlig;nahmen gem. Art. 32 DSGVO, insbesondere:
              <ul className="ml-6 mt-1 list-inside list-disc space-y-1">
                <li>Verschl&uuml;sselung der Daten&uuml;bertragung (TLS/HTTPS)</li>
                <li>Hosting in der EU (Supabase, Region Frankfurt)</li>
                <li>Zugriffskontrolle und Authentifizierung</li>
                <li>Regelm&auml;&szlig;ige Sicherheitsupdates</li>
              </ul>
            </li>
            <li>Der Anbieter unterst&uuml;tzt den Kunden bei der Erf&uuml;llung seiner Pflichten aus Art. 32–36 DSGVO (Sicherheit, Datenschutz-Folgenabsch&auml;tzung, Meldepflichten).</li>
            <li>Nach Beendigung des Auftrags l&ouml;scht der Anbieter alle personenbezogenen Daten, sofern keine gesetzliche Aufbewahrungspflicht besteht.</li>
          </ol>

          <h3 className="mt-4 text-lg font-semibold text-foreground">8.5 Unterauftragsverarbeiter</h3>
          <p className="mt-2">
            Der Kunde stimmt der Beauftragung folgender Unterauftragsverarbeiter zu:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li><strong>Supabase Inc.</strong> (Hosting, Datenbank, Authentifizierung) – Rechenzentrum Frankfurt, EU</li>
            <li><strong>Vercel Inc.</strong> (Hosting der Webanwendung) – Edge Network, EU-Regionen</li>
            <li><strong>Stripe Inc.</strong> (Zahlungsabwicklung) – EU-konform, eigener AVV</li>
            <li><strong>Resend Inc.</strong> (E-Mail-Versand) – f&uuml;r transaktionale E-Mails</li>
          </ul>
          <p className="mt-2">
            Der Anbieter informiert den Kunden &uuml;ber beabsichtigte &Auml;nderungen bei Unterauftragsverarbeitern.
            Der Kunde kann innerhalb von 14 Tagen Einspruch erheben.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-foreground">8.6 Rechte der betroffenen Personen</h3>
          <p className="mt-2">
            Der Anbieter unterst&uuml;tzt den Kunden bei der Beantwortung von Anfragen betroffener
            Personen (Auskunft, L&ouml;schung, Berichtigung gem. Art. 15–22 DSGVO). Da
            Patientenumfragen anonym erfasst werden, ist eine nachtr&auml;gliche Zuordnung zu
            einzelnen Personen technisch nicht m&ouml;glich.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-foreground">8.7 Meldepflichten bei Datenpannen</h3>
          <p className="mt-2">
            Der Anbieter informiert den Kunden unverz&uuml;glich &uuml;ber Verletzungen des Schutzes
            personenbezogener Daten (Art. 33 DSGVO) und unterst&uuml;tzt bei der Erf&uuml;llung
            der Meldepflichten gegen&uuml;ber der Aufsichtsbeh&ouml;rde.
          </p>

          <h3 className="mt-4 text-lg font-semibold text-foreground">8.8 Kontrollrechte</h3>
          <p className="mt-2">
            Der Kunde hat das Recht, die Einhaltung dieses AVV zu &uuml;berpr&uuml;fen. Der Anbieter
            stellt hierf&uuml;r die erforderlichen Informationen bereit und erm&ouml;glicht auf Anfrage
            &Uuml;berpr&uuml;fungen.
          </p>
        </section>

        {/* §9 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 9 Haftung</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Der Anbieter haftet unbeschr&auml;nkt bei Vorsatz und grober Fahrl&auml;ssigkeit.</li>
            <li>Bei leichter Fahrl&auml;ssigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten, beschr&auml;nkt auf den vorhersehbaren, vertragstypischen Schaden.</li>
            <li>Der Anbieter haftet nicht f&uuml;r den Erfolg von Google-Bewertungen oder die Qualit&auml;tsverbesserung der Praxis.</li>
            <li>Der Anbieter haftet nicht f&uuml;r die Inhalte, die Patienten im Freitext der Umfrage eingeben.</li>
          </ol>
        </section>

        {/* §10 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 10 Geistiges Eigentum</h2>
          <p className="mt-2">
            Alle Rechte an der Software, dem Design und den Inhalten von PraxisPuls liegen
            beim Anbieter. Der Kunde erh&auml;lt ein einfaches, nicht &uuml;bertragbares Nutzungsrecht
            f&uuml;r die Dauer des Vertrages.
          </p>
        </section>

        {/* §11 */}
        <section>
          <h2 className="text-xl font-semibold text-foreground">&#167; 11 Schlussbestimmungen</h2>
          <ol className="mt-2 list-inside list-decimal space-y-1">
            <li>Es gilt das Recht der Bundesrepublik Deutschland.</li>
            <li>Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der &uuml;brigen Bestimmungen unber&uuml;hrt.</li>
            <li>Der Anbieter beh&auml;lt sich vor, diese AGB mit angemessener Ank&uuml;ndigungsfrist zu &auml;ndern.</li>
          </ol>
          <p className="mt-4 text-sm">Stand: Februar 2026</p>
        </section>
      </div>
    </div>
  );
}
