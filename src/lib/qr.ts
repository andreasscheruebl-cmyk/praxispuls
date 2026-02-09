import QRCode from "qrcode";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Generate QR code as data URL (PNG base64)
 */
export async function generateQrCodeDataUrl(
  surveySlug: string,
  options?: {
    width?: number;
    color?: string;
  }
): Promise<string> {
  const url = `${APP_URL}/s/${surveySlug}`;

  return QRCode.toDataURL(url, {
    width: options?.width || 512,
    margin: 2,
    color: {
      dark: options?.color || "#000000",
      light: "#FFFFFF",
    },
    errorCorrectionLevel: "M",
  });
}


/**
 * Get the survey URL for a given slug
 */
export function getSurveyUrl(slug: string): string {
  return `${APP_URL}/s/${slug}`;
}
