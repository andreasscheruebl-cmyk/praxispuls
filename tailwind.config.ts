import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd",
          400: "#60a5fa", 500: "#2563eb", 600: "#1d4ed8", 700: "#1e40af",
          800: "#1e3a8a", 900: "#1e3a5f",
        },
        teal: {
          50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4",
          400: "#2dd4bf", 500: "#0D9488", 600: "#0d9488", 700: "#0f766e",
          800: "#115e59", 900: "#134e4a",
        },
        sage: {
          50: "#f5f9f4", 100: "#e6f0e4", 200: "#cce1c8",
          300: "#b3d3ad", 400: "#A7C4A1", 500: "#8ab382",
          600: "#6d9a65", 700: "#517a4a", 800: "#365b31", 900: "#1c3d19",
        },
        creme: {
          50: "#FDFCFA", 100: "#FAF7F2", 200: "#F5EFE6",
          300: "#EDE4D4", 400: "#E0D3BC", 500: "#C9BA9E",
        },
        charcoal: {
          DEFAULT: "#2D3436", 50: "#f5f6f6", 100: "#e0e2e3",
          200: "#c1c5c6", 300: "#9ca2a4", 400: "#6d7577",
          500: "#525b5d", 600: "#414a4c", 700: "#363e40",
          800: "#2D3436", 900: "#1a1f20",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
      },
      fontFamily: {
        heading: ["var(--heading-font)"],
        body: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        theme: "var(--shadow-theme)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
