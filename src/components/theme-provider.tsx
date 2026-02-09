"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
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
  }, [themeId]);

  const config = getThemeConfig(themeId);

  return (
    <ThemeContext.Provider value={{ themeId, config }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
