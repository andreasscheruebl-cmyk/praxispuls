import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Anmelden",
  description: "Melden Sie sich bei PraxisPuls an – Ihr Dashboard für Patientenfeedback und Google-Bewertungen.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <LoginForm />
    </div>
  );
}
