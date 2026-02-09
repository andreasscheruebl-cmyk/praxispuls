export const metadata = { title: "AGB" };

export default function AGBPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <p className="text-sm italic">
          [AGB werden vor Go-Live von einem Rechtsanwalt erstellt.]
        </p>
      </div>
    </div>
  );
}
