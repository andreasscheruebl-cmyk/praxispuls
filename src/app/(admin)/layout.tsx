import Link from "next/link";
import { getUser } from "@/lib/auth";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { BuildBadge } from "@/components/shared/build-badge";
import { AdminNav } from "@/components/admin/admin-nav";
import { ArrowLeft } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-slate-900 md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center border-b border-slate-700 px-6">
            <Link href="/admin" className="text-xl font-bold text-white">
              PraxisPuls <span className="text-xs font-normal text-slate-400">Admin</span>
            </Link>
          </div>

          <AdminNav />

          <div className="border-t border-slate-700 p-4 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Zurück zum Dashboard
            </Link>
            <div className="flex items-center gap-3 px-1 py-1">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-white">
                {user.email?.charAt(0).toUpperCase() || "?"}
              </div>
              <p className="flex-1 truncate text-xs text-slate-400">{user.email}</p>
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
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 md:hidden">
          <Link href="/admin" className="text-lg font-bold">
            Admin
          </Link>
          <LogoutButton variant="icon" />
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
