import Link from "next/link";
import { getUser, getAdminEmails } from "@/lib/auth";
import { getActivePractice, getPractices } from "@/actions/practice";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MobileBottomTabs } from "@/components/dashboard/mobile-bottom-tabs";
import { PracticeSwitcher } from "@/components/dashboard/practice-switcher";
import { BuildBadge } from "@/components/shared/build-badge";
import { getEffectivePlan } from "@/lib/plans";
import { PLAN_LIMITS } from "@/types";
import {
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Settings,
  CreditCard,
  Bell,
  UserCircle,
  Shield,
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

  // Load practices + active practice for switcher
  const [allPractices, practice] = await Promise.all([
    getPractices(),
    getActivePractice(),
  ]);
  const effectivePlan = practice ? getEffectivePlan(practice) : "free";
  const maxLocations = PLAN_LIMITS[effectivePlan].maxLocations;
  const isAdmin = getAdminEmails().includes(user.email?.toLowerCase() || "");
  const isSuspended = !!practice?.suspendedAt;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar – desktop only */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              PraxisPuls
            </Link>
          </div>

          {/* Practice switcher */}
          {allPractices.length > 0 && (
            <div className="border-b px-3 py-3">
              <PracticeSwitcher
                practices={allPractices.map((p) => ({
                  id: p.id,
                  name: p.name,
                  postalCode: p.postalCode,
                }))}
                activePracticeId={practice?.id || allPractices[0]!.id}
                maxLocations={maxLocations}
              />
            </div>
          )}

          {isSuspended ? (
            <div className="flex-1 flex items-center justify-center px-3 py-4">
              <p className="text-sm text-muted-foreground text-center">
                Konto gesperrt
              </p>
            </div>
          ) : (
            <>
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

              {isAdmin && (
                <div className="border-t px-3 py-2">
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Shield className="h-4 w-4" />
                    Admin-Board
                  </Link>
                </div>
              )}
            </>
          )}

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
        <header className="border-b bg-white md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/dashboard" className="text-lg font-bold text-primary">
              PraxisPuls
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/profile" className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {user.email?.charAt(0).toUpperCase()}
              </Link>
              <LogoutButton variant="icon" />
            </div>
          </div>
          {/* Mobile practice switcher */}
          {allPractices.length > 1 && (
            <div className="border-t px-4 py-2">
              <PracticeSwitcher
                practices={allPractices.map((p) => ({
                  id: p.id,
                  name: p.name,
                  postalCode: p.postalCode,
                }))}
                activePracticeId={practice?.id || allPractices[0]!.id}
                maxLocations={maxLocations}
              />
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 pb-24 md:p-8">
          {isSuspended ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <div className="max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
                <Shield className="mx-auto mb-4 h-12 w-12 text-destructive" />
                <h2 className="mb-2 text-xl font-semibold">Konto gesperrt</h2>
                <p className="text-muted-foreground">
                  Ihr Konto wurde gesperrt. Bitte kontaktieren Sie den Support
                  unter{" "}
                  <a
                    href="mailto:support@praxispuls.de"
                    className="text-primary underline"
                  >
                    support@praxispuls.de
                  </a>
                  .
                </p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>

        {/* Bottom tabs (mobile) */}
        <MobileBottomTabs navItems={navItems.map(i => ({ href: i.href, label: i.label, icon: i.icon }))} />
      </div>
    </div>
  );
}
