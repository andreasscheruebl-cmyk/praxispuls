import Link from "next/link";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { MobileBottomTabs } from "@/components/dashboard/mobile-bottom-tabs";
import { BuildBadge } from "@/components/shared/build-badge";
import { ThemeProvider } from "@/components/theme-provider";
import { db } from "@/lib/db";
import { practices } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { type ThemeId } from "@/lib/themes";
import {
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  CreditCard,
  Bell,
  UserCircle,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Übersicht", icon: "LayoutDashboard" as const },
  { href: "/dashboard/responses", label: "Antworten", icon: "MessageSquare" as const },
  { href: "/dashboard/alerts", label: "Alerts", icon: "Bell" as const },
  { href: "/dashboard/qr-codes", label: "QR-Codes", icon: "QrCode" as const },
  { href: "/dashboard/settings", label: "Einstellungen", icon: "Settings" as const },
  { href: "/dashboard/billing", label: "Abrechnung", icon: "CreditCard" as const },
  { href: "/dashboard/profile", label: "Profil", icon: "UserCircle" as const },
];

const iconMap = { LayoutDashboard, MessageSquare, Bell, QrCode, Settings, CreditCard, UserCircle };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /login if not authenticated
  const user = await getUser();

  // Load theme from practice
  const practice = await db.query.practices.findFirst({
    where: eq(practices.email, user.email!),
    columns: { theme: true },
  });
  const themeId = (practice?.theme as ThemeId) || "vertrauen";

  return (
    <ThemeProvider themeId={themeId}>
    <div className="flex min-h-screen">
      {/* Sidebar – desktop only */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              PraxisPuls
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t p-4 space-y-2">
            <div className="flex items-center gap-3 px-1 py-1">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <p className="flex-1 truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <LogoutButton />
            <div className="px-1 pt-1">
              <BuildBadge />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            PraxisPuls
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
              {user.email?.charAt(0).toUpperCase()}
            </Link>
            <LogoutButton variant="icon" />
            {themeId !== "vertrauen" && (
              <MobileNav email={user.email || ""} navItems={navItems.map(i => ({ href: i.href, label: i.label }))} />
            )}
          </div>
        </header>

        {/* Page content */}
        <main className={`flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8 ${themeId === "vertrauen" ? "pb-24 md:pb-8" : ""}`}>
          {children}
        </main>

        {/* Bottom tabs for Vertrauen theme (mobile) */}
        {themeId === "vertrauen" && (
          <MobileBottomTabs navItems={navItems.map(i => ({ href: i.href, label: i.label, icon: i.icon }))} />
        )}
      </div>
    </div>
    </ThemeProvider>
  );
}
