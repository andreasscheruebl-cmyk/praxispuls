"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Bell,
  QrCode,
  Settings,
  CreditCard,
  UserCircle,
} from "lucide-react";

const iconMap: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Bell,
  QrCode,
  Settings,
  CreditCard,
  UserCircle,
};

// Show max 5 tabs on mobile bottom bar
const PRIMARY_TABS = [
  "LayoutDashboard",
  "ClipboardList",
  "MessageSquare",
  "Settings",
  "UserCircle",
];

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

export function MobileBottomTabs({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();

  const visibleItems = navItems.filter((item) =>
    PRIMARY_TABS.includes(item.icon)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <div className="flex items-stretch justify-around">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className={isActive ? "font-medium" : ""}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
