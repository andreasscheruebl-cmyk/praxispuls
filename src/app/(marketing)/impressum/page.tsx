export const metadata = { title: "Impressum" };

export default function ImpressumPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Impressum</h1>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>Angaben gemäß § 5 TMG:</p>
        <p>
          [Name]<br />
          [Adresse]<br />
          [PLZ Ort]
        </p>
        <p>
          <strong>Kontakt:</strong><br />
          E-Mail: info@praxispuls.de
        </p>
        <p>
          <strong>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</strong><br />
          [Name, Adresse]
        </p>
      </div>
    </div>
  );
}
