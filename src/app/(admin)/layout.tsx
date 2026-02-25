import Link from "next/link";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { BuildBadge } from "@/components/shared/build-badge";
import {
  LayoutDashboard,
  Building2,
  ScrollText,
  LogIn,
  Shield,
} from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard" as const },
  { href: "/admin/practices", label: "Praxen", icon: "Building2" as const },
  { href: "/admin/audit", label: "Audit Log", icon: "ScrollText" as const },
  { href: "/admin/logins", label: "Logins", icon: "LogIn" as const },
];

const iconMap = { LayoutDashboard, Building2, ScrollText, LogIn };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar – desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Shield className="h-5 w-5 text-red-600" />
            <Link href="/admin" className="text-xl font-bold text-red-600">
              Admin
            </Link>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {adminNavItems.map((item) => {
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
            <Link
              href="/dashboard"
              className="block rounded-md border px-3 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              Zum Dashboard
            </Link>
            <div className="flex items-center gap-3 px-1 py-1">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-medium text-red-600">
                {user.email?.charAt(0).toUpperCase() || "?"}
              </div>
              <p className="flex-1 truncate text-xs text-muted-foreground">
                {user.email}
              </p>
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
          <Link href="/admin" className="flex items-center gap-2 text-lg font-bold text-red-600">
            <Shield className="h-5 w-5" />
            Admin
          </Link>
          <LogoutButton variant="icon" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
