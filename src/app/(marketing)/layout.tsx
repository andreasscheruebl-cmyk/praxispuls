import Link from "next/link";
import { ThemeProvider } from "@/components/theme-provider";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider themeId="vertrauen">
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">PraxisPuls</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
            >
              Kostenlos testen
            </Link>
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} PraxisPuls. Alle Rechte vorbehalten.
            </p>
            <nav className="flex space-x-6">
              <Link
                href="/impressum"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Impressum
              </Link>
              <Link
                href="/datenschutz"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Datenschutz
              </Link>
              <Link
                href="/agb"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                AGB
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
    </ThemeProvider>
  );
}
