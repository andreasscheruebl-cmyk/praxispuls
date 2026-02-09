"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "./logout-button";

type MobileNavProps = {
  email: string;
  navItems: { href: string; label: string }[];
};

export function MobileNav({ email, navItems }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label={open ? "Menü schließen" : "Menü öffnen"}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setOpen(false)}
          />

          {/* Slide-in menu */}
          <div className="fixed inset-y-0 right-0 z-50 w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <span className="text-lg font-bold text-brand-500">Menü</span>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-muted-foreground hover:bg-accent"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="space-y-1 px-3 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-brand-50 text-brand-600"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 border-t p-4 space-y-3">
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-md px-1 py-1 hover:bg-accent transition-colors"
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-medium text-brand-600">
                  {email.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 truncate text-sm font-medium">{email}</span>
              </Link>
              <LogoutButton />
            </div>
          </div>
        </>
      )}
    </>
  );
}
