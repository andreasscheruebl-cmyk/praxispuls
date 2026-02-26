import { getAuditEvents, getAuditActionTypes, getAllPractices } from "@/lib/db/queries/admin";
import { AuditFilters } from "@/components/admin/audit-filters";
import { AuditDetail } from "@/components/admin/audit-detail";
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
  action?: string;
  practiceId?: string;
  from?: string;
  to?: string;
  page?: string;
}>;

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));

  const [result, actionTypes, practices] = await Promise.all([
    getAuditEvents({
      action: params.action,
      practiceId: params.practiceId,
      from: params.from,
      to: params.to,
      page,
      pageSize: 20,
    }),
    getAuditActionTypes(),
    getAllPractices(),
  ]);

  const totalPages = Math.ceil(result.total / result.pageSize);

  function buildPageUrl(p: number) {
    const sp = new URLSearchParams();
    if (params.action) sp.set("action", params.action);
    if (params.practiceId) sp.set("practiceId", params.practiceId);
    if (params.from) sp.set("from", params.from);
    if (params.to) sp.set("to", params.to);
    sp.set("page", String(p));
    return `/admin/audit?${sp.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit-Log</h1>
        <p className="text-muted-foreground">
          {result.total} {result.total === 1 ? "Eintrag" : "Einträge"} gesamt.
        </p>
      </div>

      <AuditFilters
        actionTypes={actionTypes}
        practices={practices.map((p) => ({ id: p.id, name: p.name }))}
      />

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Zeitpunkt</TableHead>
              <TableHead>Aktion</TableHead>
              <TableHead className="hidden md:table-cell">Praxis</TableHead>
              <TableHead className="hidden lg:table-cell">Entity</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Keine Audit-Einträge gefunden.
                </TableCell>
              </TableRow>
            ) : (
              result.events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {formatDateTimeDE(event.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {event.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {event.practice?.name ?? (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm">
                    {event.entity ? (
                      <span className="font-mono text-xs">
                        {event.entity}
                        {event.entityId && (
                          <span className="text-muted-foreground ml-1">
                            #{event.entityId.slice(0, 8)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <AuditDetail before={event.before} after={event.after} />
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
