import { Building2, BarChart3, ScrollText, LogIn, Shield, FileText } from "lucide-react";
import Link from "next/link";

const adminLinks = [
  {
    href: "/admin/practices",
    icon: Building2,
    title: "Praxen",
    description: "Alle Praxen verwalten, Plans überschreiben.",
  },
  {
    href: "/admin/stats",
    icon: BarChart3,
    title: "Statistiken",
    description: "Plattform-Metriken, Plan-Verteilung, Trends.",
  },
  {
    href: "/admin/audit",
    icon: ScrollText,
    title: "Audit-Log",
    description: "Änderungen nachverfolgen, Before/After einsehen.",
  },
  {
    href: "/admin/logins",
    icon: LogIn,
    title: "Login-History",
    description: "Login-Events, IP-Adressen, Browser.",
  },
  {
    href: "/admin/templates",
    icon: FileText,
    title: "Templates",
    description: "Survey-Templates verwalten, Branchen-Templates einsehen.",
  },
];

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          PraxisPuls Verwaltung – internes Admin-Panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <link.icon className="h-8 w-8 text-primary mb-3" />
            <h2 className="font-semibold">{link.title}</h2>
            <p className="text-sm text-muted-foreground">{link.description}</p>
          </Link>
        ))}

        <div className="rounded-lg border bg-white p-6 shadow-sm opacity-60">
          <Shield className="h-8 w-8 text-muted-foreground mb-3" />
          <h2 className="font-semibold text-muted-foreground">Security</h2>
          <p className="text-sm text-muted-foreground">Kommt in v0.2.</p>
        </div>
      </div>
    </div>
  );
}
