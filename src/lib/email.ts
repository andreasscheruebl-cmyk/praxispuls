import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "PraxisPuls <noreply@praxispuls.de>";

/**
 * Send detractor alert email to practice owner
 */
export async function sendDetractorAlert(params: {
  to: string;
  practiceName: string;
  npsScore: number;
  freeText?: string | null;
  responseDate: Date;
}) {
  const { to, practiceName, npsScore, freeText, responseDate } = params;

  const dateStr = responseDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⚠️ Kritisches Patientenfeedback – NPS ${npsScore}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #dc2626;">⚠️ Kritisches Feedback eingegangen</h2>
        <p><strong>Praxis:</strong> ${practiceName}</p>
        <p><strong>NPS-Score:</strong> ${npsScore}/10</p>
        <p><strong>Zeitpunkt:</strong> ${dateStr}</p>
        ${freeText ? `
          <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-left: 4px solid #dc2626; border-radius: 4px;">
            <p style="margin: 0; font-style: italic;">"${freeText}"</p>
          </div>
        ` : ""}
        <p style="margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            Im Dashboard ansehen
          </a>
        </p>
        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
          Diese E-Mail wurde automatisch von PraxisPuls versendet.
        </p>
      </div>
    `,
  });
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(params: {
  to: string;
  practiceName: string;
}) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Willkommen bei PraxisPuls! 🎉",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Willkommen bei PraxisPuls!</h2>
        <p>Hallo ${params.practiceName},</p>
        <p>vielen Dank für Ihre Registrierung. In wenigen Schritten ist Ihre Patientenumfrage startklar:</p>
        <ol>
          <li>Praxisdaten vervollständigen</li>
          <li>Google-Praxis verknüpfen</li>
          <li>QR-Code herunterladen und aufstellen</li>
        </ol>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/onboarding"
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            Jetzt einrichten
          </a>
        </p>
        <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
          Bei Fragen erreichen Sie uns unter info@praxispuls.de
        </p>
      </div>
    `,
  });
}

/**
 * Send upgrade reminder when free limit reached
 */
export async function sendUpgradeReminder(params: {
  to: string;
  practiceName: string;
  currentCount: number;
  limit: number;
}) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "📊 Ihr Antwort-Limit ist fast erreicht",
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Antwort-Limit fast erreicht</h2>
        <p>Hallo ${params.practiceName},</p>
        <p>Sie haben bereits <strong>${params.currentCount} von ${params.limit}</strong> Antworten diesen Monat erhalten. Das zeigt, dass Ihre Patienten aktiv Feedback geben!</p>
        <p>Mit dem Starter-Plan für 49 €/Monat erhalten Sie:</p>
        <ul>
          <li>200 Antworten pro Monat</li>
          <li>E-Mail-Alerts bei kritischem Feedback</li>
          <li>Praxis-Branding (Logo & Farben)</li>
          <li>Alle 3 Umfrage-Templates</li>
        </ul>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
            Jetzt upgraden
          </a>
        </p>
      </div>
    `,
  });
}
