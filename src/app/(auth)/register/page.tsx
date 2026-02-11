import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Kostenlos registrieren",
  description: "Erstellen Sie Ihr kostenloses PraxisPuls-Konto – Patientenumfragen starten und Google-Bewertungen steigern.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <RegisterForm />
    </div>
  );
}
