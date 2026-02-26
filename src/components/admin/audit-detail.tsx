"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function AuditDetail({
  before,
  after,
}: {
  before: unknown;
  after: unknown;
}) {
  const [open, setOpen] = useState(false);

  if (!before && !after) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
      >
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        {open ? "Zuklappen" : "Details"}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {before != null && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Vorher:</p>
              <pre className="max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs">
                {JSON.stringify(before, null, 2)}
              </pre>
            </div>
          )}
          {after != null && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Nachher:</p>
              <pre className="max-h-40 overflow-auto rounded bg-slate-50 p-2 text-xs">
                {JSON.stringify(after, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
