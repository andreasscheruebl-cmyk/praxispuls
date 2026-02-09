import { Card, CardContent } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

export const metadata = {
  title: "Abrechnung",
};

export default function BillingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Abrechnung</h1>
        <p className="text-muted-foreground">
          Verwalten Sie Ihr Abonnement und Ihre Rechnungen.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <CreditCard className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">
            Free-Plan aktiv
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Sie nutzen aktuell den kostenlosen Plan mit 30 Antworten pro Monat.
            Upgraden Sie für mehr Funktionen.
          </p>
          <button className="mt-6 inline-flex h-10 items-center justify-center rounded-md bg-brand-500 px-6 text-sm font-medium text-white hover:bg-brand-600">
            Auf Starter upgraden
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
