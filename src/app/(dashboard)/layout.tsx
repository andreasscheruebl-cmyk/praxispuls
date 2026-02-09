import Link from "next/link";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import {
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  CreditCard,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Übersicht", icon: "LayoutDashboard" as const },
  { href: "/dashboard/responses", label: "Antworten", icon: "MessageSquare" as const },
  { href: "/dashboard/alerts", label: "Alerts", icon: "Bell" as const },
  { href: "/dashboard/qr-codes", label: "QR-Codes", icon: "QrCode" as const },
  { href: "/dashboard/settings", label: "Einstellungen", icon: "Settings" as const },
  { href: "/dashboard/billing", label: "Abrechnung", icon: "CreditCard" as const },
];

const iconMap = { LayoutDashboard, MessageSquare, Bell, QrCode, Settings, CreditCard };

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /login if not authenticated
  const user = await getUser();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar – desktop only */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="text-xl font-bold text-brand-500">
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

          <div className="border-t p-4 space-y-3">
            <Link href="/dashboard/profile" className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-accent transition-colors">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-600">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium">{user.email}</p>
              </div>
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
          <Link href="/dashboard" className="text-lg font-bold text-brand-500">
            PraxisPuls
          </Link>
          <MobileNav email={user.email || ""} navItems={navItems.map(i => ({ href: i.href, label: i.label }))} />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
