import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "PraxisPuls – Patientenfeedback & Google-Bewertungen für Zahnarztpraxen",
    template: "%s | PraxisPuls",
  },
  description:
    "Patientenfeedback sammeln, Google-Bewertungen steigern, QM-Pflicht erfüllen – in 5 Minuten eingerichtet.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "PraxisPuls",
    title: "PraxisPuls – Patientenfeedback & Google-Bewertungen für Zahnarztpraxen",
    description:
      "QM-konforme Patientenumfrage mit automatischem Google-Review-Routing – ab 49 €/Monat.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PraxisPuls – Patientenfeedback für Zahnarztpraxen",
    description:
      "Patientenfeedback sammeln, Google-Bewertungen steigern, QM-Pflicht erfüllen.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>
        {children}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
