import { Resend } from "resend";

const FROM_EMAIL = "PraxisPuls <noreply@praxispuls.de>";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

/** Shared email layout wrapper for consistent branding */
function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="de">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background: #ffffff; border-radius: 8px; overflow: hidden;">
        <!-- Header -->
        <tr><td style="padding: 32px 32px 0; text-align: center;">
          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0D9488;">PraxisPuls</h1>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding: 24px 32px 32px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding: 16px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            PraxisPuls — Patientenfeedback für Zahnarztpraxen
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Shared CTA button style */
function emailButton(text: string, href: string): string {
  return `<a href="${href}" style="display: inline-block; padding: 12px 24px; background: #0D9488; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;">${text}</a>`;
}

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

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `⚠️ Kritisches Patientenfeedback – NPS ${npsScore}`,
    html: emailLayout(`
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #dc2626;">⚠️ Kritisches Feedback eingegangen</h2>
      <p><strong>Praxis:</strong> ${escapeHtml(practiceName)}</p>
      <p><strong>NPS-Score:</strong> ${npsScore}/10</p>
      <p><strong>Zeitpunkt:</strong> ${dateStr}</p>
      ${freeText ? `
        <div style="margin-top: 16px; padding: 16px; background: #f9fafb; border-left: 4px solid #dc2626; border-radius: 4px;">
          <p style="margin: 0; font-style: italic;">&ldquo;${escapeHtml(freeText)}&rdquo;</p>
        </div>
      ` : ""}
      <p style="margin-top: 24px;">
        ${emailButton("Im Dashboard ansehen", `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`)}
      </p>
    `),
  });
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(params: {
  to: string;
  practiceName: string;
}) {
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "Willkommen bei PraxisPuls! 🎉",
    html: emailLayout(`
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #111827;">Willkommen bei PraxisPuls!</h2>
      <p>Hallo ${escapeHtml(params.practiceName)},</p>
      <p>vielen Dank für Ihre Registrierung. In wenigen Schritten ist Ihre Patientenumfrage startklar:</p>
      <ol>
        <li>Praxisdaten vervollständigen</li>
        <li>Google-Praxis verknüpfen</li>
        <li>QR-Code herunterladen und aufstellen</li>
      </ol>
      <p>
        ${emailButton("Jetzt einrichten", `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`)}
      </p>
      <p style="margin-top: 24px; font-size: 13px; color: #6b7280;">
        Bei Fragen erreichen Sie uns unter info@praxispuls.de
      </p>
    `),
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
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: "📊 Ihr Antwort-Limit ist fast erreicht",
    html: emailLayout(`
      <h2 style="margin: 0 0 16px; font-size: 18px; color: #111827;">Antwort-Limit fast erreicht</h2>
      <p>Hallo ${escapeHtml(params.practiceName)},</p>
      <p>Sie haben bereits <strong>${params.currentCount} von ${params.limit}</strong> Antworten diesen Monat erhalten. Das zeigt, dass Ihre Patienten aktiv Feedback geben!</p>
      <p>Mit dem Starter-Plan für 49&nbsp;€/Monat erhalten Sie:</p>
      <ul>
        <li>200 Antworten pro Monat</li>
        <li>E-Mail-Alerts bei kritischem Feedback</li>
        <li>Praxis-Branding (Logo &amp; Farben)</li>
        <li>Alle 3 Umfrage-Templates</li>
      </ul>
      <p>
        ${emailButton("Jetzt upgraden", `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`)}
      </p>
    `),
  });
}
