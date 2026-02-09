import { jsPDF } from "jspdf";

// Brand color for PraxisPuls accents
const BRAND_COLOR: [number, number, number] = [59, 130, 246]; // blue-500
const TEXT_DARK: [number, number, number] = [31, 41, 55]; // gray-800
const TEXT_MUTED: [number, number, number] = [107, 114, 128]; // gray-500

/**
 * Helper: center text horizontally on the page.
 * Returns the x position for centered text at the given font size.
 */
function getCenteredX(
  doc: jsPDF,
  text: string,
  pageWidth: number
): number {
  const textWidth = doc.getTextWidth(text);
  return (pageWidth - textWidth) / 2;
}

/**
 * Helper: wrap text to fit within a max width and render centered lines.
 */
function renderCenteredWrappedText(
  doc: jsPDF,
  text: string,
  y: number,
  pageWidth: number,
  maxWidth: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth) as string[];
  let currentY = y;
  for (const line of lines) {
    const x = getCenteredX(doc, line, pageWidth);
    doc.text(line, x, currentY);
    currentY += doc.getLineHeight() / doc.internal.scaleFactor;
  }
  return currentY;
}

/**
 * Generate an A4 portrait poster (210x297mm) with a large QR code.
 *
 * Layout:
 * - Heading: "Ihre Meinung ist uns wichtig!"
 * - Subheading with practice name
 * - Large QR code (120x120mm), centered
 * - Survey URL below QR
 * - Thank-you text and PraxisPuls branding at the bottom
 */
export async function generateA4Poster(
  qrDataUrl: string,
  practiceName: string,
  surveyUrl: string
): Promise<Blob> {
  const pageWidth = 210;
  const pageHeight = 297;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // -- Decorative top bar --
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 4, "F");

  // -- Main heading --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...TEXT_DARK);

  const heading = "Ihre Meinung ist uns wichtig!";
  const headingX = getCenteredX(doc, heading, pageWidth);
  doc.text(heading, headingX, 35);

  // -- Subheading with practice name --
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(...TEXT_MUTED);

  const subheading = `Scannen Sie den QR-Code und bewerten Sie Ihren Besuch bei ${practiceName}`;
  const subMaxWidth = pageWidth - 40; // 20mm margin each side
  const subY = renderCenteredWrappedText(doc, subheading, 50, pageWidth, subMaxWidth);

  // -- QR code (120x120mm, centered) --
  const qrSize = 120;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = subY + 10;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // -- Survey URL below QR --
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT_MUTED);

  const urlY = qrY + qrSize + 8;
  const urlX = getCenteredX(doc, surveyUrl, pageWidth);
  doc.text(surveyUrl, urlX, urlY);

  // -- Thank-you text --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...TEXT_DARK);

  const thanks = "Vielen Dank f\u00FCr Ihr Feedback!";
  const thanksX = getCenteredX(doc, thanks, pageWidth);
  doc.text(thanks, thanksX, urlY + 18);

  // -- Decorative bottom bar --
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, pageHeight - 12, pageWidth, 12, "F");

  // -- PraxisPuls branding (bottom) --
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);

  const branding = "Erstellt mit PraxisPuls \u2013 www.praxispuls.de";
  const brandX = getCenteredX(doc, branding, pageWidth);
  doc.text(branding, brandX, pageHeight - 4);

  return doc.output("blob");
}

/**
 * Generate an A6 table tent card (105x148mm) with a compact QR code layout.
 *
 * Layout:
 * - Heading: "Wie war Ihr Besuch?"
 * - QR code centered (60x60mm)
 * - Practice name below QR
 * - "powered by PraxisPuls" branding at the bottom
 */
export async function generateA6Card(
  qrDataUrl: string,
  practiceName: string,
  surveyUrl: string
): Promise<Blob> {
  const pageWidth = 105;
  const pageHeight = 148;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [pageWidth, pageHeight],
  });

  // -- Decorative top bar --
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageWidth, 2.5, "F");

  // -- Heading --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...TEXT_DARK);

  const heading = "Wie war Ihr Besuch?";
  const headingX = getCenteredX(doc, heading, pageWidth);
  doc.text(heading, headingX, 20);

  // -- QR code (60x60mm, centered) --
  const qrSize = 60;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = 30;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // -- Practice name below QR --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT_DARK);

  const nameY = qrY + qrSize + 8;
  const nameMaxWidth = pageWidth - 16; // 8mm margin each side
  renderCenteredWrappedText(doc, practiceName, nameY, pageWidth, nameMaxWidth);

  // -- Survey URL (small, below practice name) --
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);

  const urlY = nameY + 10;
  const urlX = getCenteredX(doc, surveyUrl, pageWidth);
  doc.text(surveyUrl, urlX, urlY);

  // -- Decorative bottom bar --
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, pageHeight - 8, pageWidth, 8, "F");

  // -- Branding at the bottom --
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);

  const branding = "powered by PraxisPuls";
  const brandX = getCenteredX(doc, branding, pageWidth);
  doc.text(branding, brandX, pageHeight - 2.5);

  return doc.output("blob");
}
