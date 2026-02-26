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

export function PracticesFilters() {
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

      // Reset to page 1 when filters change
      newParams.delete("page");

      return newParams.toString();
    },
    [searchParams]
  );

  // Debounced search
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
          placeholder="Name oder E-Mail suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select
        value={searchParams.get("plan") ?? "all"}
        onValueChange={(v) => handleFilterChange("plan", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle Pläne</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="starter">Starter</SelectItem>
          <SelectItem value="professional">Professional</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("google") ?? "all"}
        onValueChange={(v) => handleFilterChange("google", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Google" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Google: Alle</SelectItem>
          <SelectItem value="yes">Verbunden</SelectItem>
          <SelectItem value="no">Nicht verbunden</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("override") ?? "all"}
        onValueChange={(v) => handleFilterChange("override", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Override" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Override: Alle</SelectItem>
          <SelectItem value="yes">Mit Override</SelectItem>
          <SelectItem value="no">Ohne Override</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={searchParams.get("suspended") ?? "all"}
        onValueChange={(v) => handleFilterChange("suspended", v)}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Status: Alle</SelectItem>
          <SelectItem value="yes">Gesperrt</SelectItem>
          <SelectItem value="no">Aktiv</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
