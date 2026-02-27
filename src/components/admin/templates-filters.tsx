"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

export function TemplatesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === "" || value === "all") {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      }

      newParams.delete("page");
      return newParams.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        const qs = createQueryString({ search: search || null });
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search, createQueryString, pathname, router]);

  const handleFilterChange = (key: string, value: string) => {
    startTransition(() => {
      const qs = createQueryString({ [key]: value === "all" ? null : value });
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Template suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get("category") ?? "all"}
        onValueChange={(v) => handleFilterChange("category", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Kategorie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Kategorien</SelectItem>
          <SelectItem value="customer">Kunden</SelectItem>
          <SelectItem value="employee">Mitarbeiter</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("industry") ?? "all"}
        onValueChange={(v) => handleFilterChange("industry", v)}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Branche" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Branchen</SelectItem>
          <SelectItem value="gesundheit">Gesundheit</SelectItem>
          <SelectItem value="handwerk">Handwerk</SelectItem>
          <SelectItem value="beauty">Beauty</SelectItem>
          <SelectItem value="gastronomie">Gastronomie</SelectItem>
          <SelectItem value="fitness">Fitness</SelectItem>
          <SelectItem value="einzelhandel">Einzelhandel</SelectItem>
          <SelectItem value="bildung">Bildung</SelectItem>
          <SelectItem value="vereine">Vereine</SelectItem>
          <SelectItem value="beratung">Beratung</SelectItem>
          <SelectItem value="individuell">Individuell</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("system") ?? "all"}
        onValueChange={(v) => handleFilterChange("system", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Typ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Typen</SelectItem>
          <SelectItem value="yes">System</SelectItem>
          <SelectItem value="no">Custom</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
