import Link from "next/link";
import { getTemplates } from "@/lib/db/queries/templates";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, FileText, Plus } from "lucide-react";
import { TemplatesFilters } from "@/components/admin/templates-filters";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const CATEGORY_LABELS: Record<string, string> = {
  customer: "Kunden",
  employee: "Mitarbeiter",
};

export default async function AdminTemplatesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const search = typeof params.search === "string" ? params.search : undefined;
  const category = typeof params.category === "string" ? params.category as "customer" | "employee" : undefined;
  const industryCategory = typeof params.industry === "string" ? params.industry : undefined;
  const systemParam = typeof params.system === "string" ? params.system : undefined;
  const isSystem = systemParam === "yes" ? true : systemParam === "no" ? false : undefined;
  const page = typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10) || 1) : 1;

  const result = await getTemplates({
    search,
    category,
    industryCategory,
    isSystem,
    page,
    pageSize: 20,
  });

  const totalPages = Math.ceil(result.total / result.pageSize);

  function buildPageUrl(targetPage: number) {
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);
    if (category) sp.set("category", category);
    if (industryCategory) sp.set("industry", industryCategory);
    if (systemParam) sp.set("system", systemParam);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return `/admin/templates${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">
            {result.total} Template{result.total !== 1 && "s"} verwalten.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            Neues Template
          </Link>
        </Button>
      </div>

      <TemplatesFilters />

      <div className="rounded-lg border bg-white">
        {result.templates.length === 0 ? (
          <div className="flex items-center justify-center gap-2 px-6 py-12 text-muted-foreground">
            <FileText className="h-5 w-5" />
            Keine Templates gefunden.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead className="hidden md:table-cell">Branche</TableHead>
                <TableHead className="hidden sm:table-cell">Fragen</TableHead>
                <TableHead className="hidden lg:table-cell">Typ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Link
                      href={`/admin/templates/${template.id}`}
                      className="block hover:underline"
                    >
                      <p className="font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {template.description}
                      </p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORY_LABELS[template.category] ?? template.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {template.industryCategory}
                      {template.industrySubCategory && (
                        <> / {template.industrySubCategory}</>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className="text-sm">
                      {Array.isArray(template.questions)
                        ? template.questions.length
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {template.isSystem ? (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        System
                      </Badge>
                    ) : (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                        Custom
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Seite {result.page} von {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildPageUrl(page - 1)}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Zurück
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Zurück
                </Button>
              )}
              {page < totalPages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildPageUrl(page + 1)}>
                    Weiter
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Weiter
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
