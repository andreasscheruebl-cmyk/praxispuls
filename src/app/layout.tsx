import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
