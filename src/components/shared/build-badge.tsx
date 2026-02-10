"use client";

import { useState } from "react";

export function BuildBadge() {
  const [expanded, setExpanded] = useState(false);

  const version = process.env.NEXT_PUBLIC_APP_VERSION || "0.0.0";
  const hash = process.env.NEXT_PUBLIC_BUILD_HASH || "dev";
  const date = process.env.NEXT_PUBLIC_BUILD_DATE || "";
  const env = process.env.NEXT_PUBLIC_BUILD_ENV || "development";

  const dateStr = date ? new Date(date).toLocaleDateString("de-DE") : "";
  const isProduction = env === "production";

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="text-[10px] text-muted-foreground transition-colors hover:text-foreground"
      title="Build-Info anzeigen"
    >
      {expanded ? (
        <span>
          v{version}+{hash} · {dateStr}
          {!isProduction && (
            <span className="ml-1 rounded bg-amber-100 px-1 py-0.5 text-[9px] text-amber-700">
              {env}
            </span>
          )}
        </span>
      ) : (
        <span>v{version}</span>
      )}
    </button>
  );
}
