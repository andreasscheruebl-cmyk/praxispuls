import Link from "next/link";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "@/components/dashboard/logout-button";
import {
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  CreditCard,
  Bell,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Übersicht", icon: LayoutDashboard },
  { href: "/dashboard/responses", label: "Antworten", icon: MessageSquare },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/qr-codes", label: "QR-Codes", icon: QrCode },
  { href: "/dashboard/settings", label: "Einstellungen", icon: Settings },
  { href: "/dashboard/billing", label: "Abrechnung", icon: CreditCard },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This will redirect to /login if not authenticated
  const user = await getUser();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="text-xl font-bold text-brand-500">
              PraxisPuls
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User info + logout */}
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
          <div className="flex items-center gap-2">
            <Link href="/dashboard/profile" className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-muted-foreground hover:text-foreground">
              <span className="max-w-[120px] truncate">{user.email}</span>
            </Link>
            <LogoutButton variant="icon" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
