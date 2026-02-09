"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="de">
      <body>
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>Ein unerwarteter Fehler ist aufgetreten.</h2>
          <p style={{ color: "#666", marginTop: "0.5rem" }}>
            Bitte versuchen Sie es erneut.
          </p>
          <button
            onClick={() => reset()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              borderRadius: "0.375rem",
              backgroundColor: "#2563EB",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Erneut versuchen
          </button>
        </div>
      </body>
    </html>
  );
}
