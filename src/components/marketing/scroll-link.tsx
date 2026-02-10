"use client";

import { Button } from "@/components/ui/button";

export function ScrollLink({
  targetId,
  children,
}: {
  targetId: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", window.location.pathname);
        }
      }}
    >
      {children}
    </Button>
  );
}
