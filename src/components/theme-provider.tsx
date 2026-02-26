"use client";

import { createContext, useEffect, type ReactNode } from "react";
import { type ThemeId, type ThemeConfig, getThemeConfig } from "@/lib/themes";

type ThemeContextValue = {
  themeId: ThemeId;
  config: ThemeConfig;
};

const ThemeContext = createContext<ThemeContextValue>({
  themeId: "standard",
  config: getThemeConfig("standard"),
});

export function ThemeProvider({
  themeId,
  children,
}: {
  themeId: ThemeId;
  children: ReactNode;
}) {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeId);
    return () => {
      // Reset to default theme on unmount (prevents stale theme on navigation)
      document.documentElement.setAttribute("data-theme", "vertrauen");
    };
  }, [themeId]);

  const config = getThemeConfig(themeId);

  return (
    <ThemeContext.Provider value={{ themeId, config }}>
      {children}
    </ThemeContext.Provider>
  );
}
