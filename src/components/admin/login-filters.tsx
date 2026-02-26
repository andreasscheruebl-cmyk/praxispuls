"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function LoginFilters({
  practices,
}: {
  practices: { id: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/admin/logins?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition]
  );

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <select
        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={searchParams.get("practiceId") ?? ""}
        onChange={(e) => updateParams("practiceId", e.target.value)}
        disabled={isPending}
      >
        <option value="">Alle Praxen</option>
        {practices.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => updateParams("from", e.target.value)}
        disabled={isPending}
        placeholder="Von"
      />

      <input
        type="date"
        className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => updateParams("to", e.target.value)}
        disabled={isPending}
        placeholder="Bis"
      />

      {isPending && (
        <span className="text-xs text-muted-foreground">Laden...</span>
      )}
    </div>
  );
}
