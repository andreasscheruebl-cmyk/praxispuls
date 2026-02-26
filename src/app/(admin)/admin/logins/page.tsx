import { getLoginEvents, getAllPractices } from "@/lib/db/queries/admin";
import { LoginFilters } from "@/components/admin/login-filters";
import { formatDateTimeDE } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SearchParams = Promise<{
  practiceId?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

export default async function AdminLoginsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const [result, practices] = await Promise.all([
    getLoginEvents({
      practiceId: params.practiceId,
      from: params.from,
      to: params.to,
      page,
      pageSize: 20,
    }),
    getAllPractices(),
  ]);

  const totalPages = Math.ceil(result.total / result.pageSize);

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (params.practiceId) sp.set("practiceId", params.practiceId);
    if (params.from) sp.set("from", params.from);
    if (params.to) sp.set("to", params.to);
    sp.set("page", String(p));
    return `/admin/logins?${sp.toString()}`;
  }

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return "Unbekannt";
    if (ua.includes("Mobile")) return "Mobil";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return ua.slice(0, 30);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Login-History</h1>
        <p className="text-muted-foreground">
          {result.total} {result.total === 1 ? "Login" : "Logins"} gesamt.
        </p>
      </div>

      <LoginFilters
        practices={practices.map((p) => ({ id: p.id, name: p.name }))}
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zeitpunkt</TableHead>
              <TableHead>Praxis</TableHead>
              <TableHead className="hidden md:table-cell">Methode</TableHead>
              <TableHead className="hidden lg:table-cell">Browser</TableHead>
              <TableHead className="hidden lg:table-cell">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Keine Login-Einträge gefunden.
                </TableCell>
              </TableRow>
            ) : (
              result.events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDateTimeDE(event.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <p className="font-medium">{event.practice?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.practice?.email ?? ""}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {event.method ?? "password"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {parseUserAgent(event.userAgent)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm font-mono text-muted-foreground">
                    {event.ipAddress ?? "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Seite {page} von {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildPageUrl(page - 1)}
                className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildPageUrl(page + 1)}
                className="inline-flex items-center gap-1 rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Weiter
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
