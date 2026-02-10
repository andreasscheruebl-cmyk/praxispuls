import { jsPDF } from "jspdf";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PdfConfig = {
  qrDataUrl: string;
  practiceName: string;
  surveyUrl?: string;
  brandColor: [number, number, number];
  headline?: string;
  logoDataUrl?: string;
};

// ---------------------------------------------------------------------------
// Color constants
// ---------------------------------------------------------------------------

const TEXT_DARK: [number, number, number] = [31, 41, 55];
const TEXT_MUTED: [number, number, number] = [107, 114, 128];
const DARK_BG: [number, number, number] = [15, 23, 42]; // #0f172a
const DARK_BG_LIGHTER: [number, number, number] = [30, 41, 59]; // #1e293b
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN_BADGE: [number, number, number] = [34, 197, 94]; // #22c55e

// ---------------------------------------------------------------------------
// Helper: center text
// ---------------------------------------------------------------------------

function getCenteredX(doc: jsPDF, text: string, pageWidth: number): number {
  return (pageWidth - doc.getTextWidth(text)) / 2;
}

/** Vertical baseline offset to visually center text in a shape */
function getBaselineOffset(doc: jsPDF): number {
  return doc.getFontSize() / doc.internal.scaleFactor * 0.35;
}

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
    doc.text(line, getCenteredX(doc, line, pageWidth), currentY);
    currentY += doc.getLineHeight() / doc.internal.scaleFactor;
  }
  return currentY;
}

// ---------------------------------------------------------------------------
// Helper: interpolate two RGB colors
// ---------------------------------------------------------------------------

function lerpColor(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// ---------------------------------------------------------------------------
// Helper: tint a color towards white
// ---------------------------------------------------------------------------

function tintColor(
  color: [number, number, number],
  amount: number
): [number, number, number] {
  return lerpColor(color, WHITE, amount);
}

// ---------------------------------------------------------------------------
// Draw helpers
// ---------------------------------------------------------------------------

function drawGradientRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  colorFrom: [number, number, number],
  colorTo: [number, number, number],
  direction: "vertical" | "horizontal" = "vertical"
) {
  const steps = Math.max(Math.round(h), 50);
  const stripH = h / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const c = lerpColor(colorFrom, colorTo, t);
    doc.setFillColor(...c);
    if (direction === "vertical") {
      doc.rect(x, y + i * stripH, w, stripH + 0.2, "F");
    } else {
      const stripW = w / steps;
      doc.rect(x + i * stripW, y, stripW + 0.2, h, "F");
    }
  }
}

function drawGlowEffect(
  doc: jsPDF,
  centerX: number,
  centerY: number,
  size: number,
  color: [number, number, number],
  rings: number = 3
) {
  for (let i = rings; i >= 0; i--) {
    const expand = i * 4;
    const opacity = 0.08 * (rings - i + 1);
    const gState = doc.GState({ opacity });
    doc.saveGraphicsState();
    doc.setGState(gState);
    doc.setFillColor(...color);
    const r = 3;
    doc.roundedRect(
      centerX - size / 2 - expand,
      centerY - size / 2 - expand,
      size + expand * 2,
      size + expand * 2,
      r,
      r,
      "F"
    );
    doc.restoreGraphicsState();
  }
}

function drawGlassCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  cornerRadius: number = 3
) {
  // Semi-transparent white fill
  const gState = doc.GState({ opacity: 0.15 });
  doc.saveGraphicsState();
  doc.setGState(gState);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, cornerRadius, cornerRadius, "F");
  doc.restoreGraphicsState();

  // Thin white border
  const borderState = doc.GState({ opacity: 0.3 });
  doc.saveGraphicsState();
  doc.setGState(borderState);
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, cornerRadius, cornerRadius, "S");
  doc.restoreGraphicsState();
}

function drawPill(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: [number, number, number] | null,
  textColor: [number, number, number],
  text: string,
  outline: boolean = false
) {
  const r = h / 2;
  if (fillColor) {
    doc.setFillColor(...fillColor);
    doc.roundedRect(x, y, w, h, r, r, "F");
  }
  if (outline) {
    doc.setDrawColor(...textColor);
    doc.setLineWidth(0.4);
    doc.roundedRect(x, y, w, h, r, r, "S");
  }
  doc.setTextColor(...textColor);
  const textW = doc.getTextWidth(text);
  doc.text(text, x + (w - textW) / 2, y + h / 2 + getBaselineOffset(doc));
}

function drawDashedLine(
  doc: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: [number, number, number] = [156, 163, 175]
) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  const dashLen = 2;
  const gapLen = 1.5;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const totalLen = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / totalLen;
  const ny = dy / totalLen;
  let pos = 0;
  while (pos < totalLen) {
    const startX = x1 + nx * pos;
    const startY = y1 + ny * pos;
    const endPos = Math.min(pos + dashLen, totalLen);
    const endX = x1 + nx * endPos;
    const endY = y1 + ny * endPos;
    doc.line(startX, startY, endX, endY);
    pos += dashLen + gapLen;
  }
}

function drawCutMarks(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const markLen = 5;
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.2);

  // Top-left
  doc.line(x - markLen, y, x - 1, y);
  doc.line(x, y - markLen, x, y - 1);
  // Top-right
  doc.line(x + w + 1, y, x + w + markLen, y);
  doc.line(x + w, y - markLen, x + w, y - 1);
  // Bottom-left
  doc.line(x - markLen, y + h, x - 1, y + h);
  doc.line(x, y + h + 1, x, y + h + markLen);
  // Bottom-right
  doc.line(x + w + 1, y + h, x + w + markLen, y + h);
  doc.line(x + w, y + h + 1, x + w, y + h + markLen);
}

function drawStarIcon(
  doc: jsPDF,
  cx: number,
  cy: number,
  size: number,
  color: [number, number, number]
) {
  doc.setFillColor(...color);
  // Approximate star with a filled circle + small triangles
  doc.circle(cx, cy, size / 2, "F");
}

// ---------------------------------------------------------------------------
// Privacy badge helper – "Anonym · DSGVO-konform" hint
// ---------------------------------------------------------------------------

function drawPrivacyBadge(
  doc: jsPDF,
  centerX: number,
  y: number,
  variant: "light" | "dark" = "light"
) {
  const text = "100 % anonym \u00B7 DSGVO-konform";
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const tw = doc.getTextWidth(text);
  const padX = 6;
  const padY = 3;
  const bw = tw + padX * 2;
  const bh = 7 + padY;
  const bx = centerX - bw / 2;

  if (variant === "dark") {
    // Subtle glass-style on dark backgrounds
    const gs = doc.GState({ opacity: 0.15 });
    doc.saveGraphicsState();
    doc.setGState(gs);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(bx, y, bw, bh, bh / 2, bh / 2, "F");
    doc.restoreGraphicsState();
    doc.setTextColor(200, 210, 225);
  } else {
    // Light muted pill
    doc.setFillColor(241, 245, 249); // slate-100
    doc.roundedRect(bx, y, bw, bh, bh / 2, bh / 2, "F");
    doc.setTextColor(100, 116, 139); // slate-500
  }
  doc.text(text, centerX - tw / 2, y + bh / 2 + getBaselineOffset(doc));
}

// ---------------------------------------------------------------------------
// Branding footer helper
// ---------------------------------------------------------------------------

function drawBrandingBar(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  brandColor: [number, number, number],
  barHeight: number = 10
) {
  doc.setFillColor(...brandColor);
  doc.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  const branding = "Erstellt mit PraxisPuls - www.praxispuls.de";
  doc.text(branding, getCenteredX(doc, branding, pageWidth), pageHeight - barHeight / 2 + getBaselineOffset(doc));
}

function drawBrandingBarDark(
  doc: jsPDF,
  pageWidth: number,
  pageHeight: number,
  brandColor: [number, number, number],
  barHeight: number = 10
) {
  // Subtle dark bar
  doc.setFillColor(8, 12, 22);
  doc.rect(0, pageHeight - barHeight, pageWidth, barHeight, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  const branding = "Erstellt mit PraxisPuls - www.praxispuls.de";
  doc.text(branding, getCenteredX(doc, branding, pageWidth), pageHeight - barHeight / 2 + getBaselineOffset(doc));
}

// ===========================================================================
// LIGHT DESIGNS
// ===========================================================================

/**
 * 1. A4 Poster Light – Infographic style with star decoration and CTA badge
 */
export async function generateA4Poster(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline, logoDataUrl } = config;
  const pw = 210;
  const ph = 297;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // --- Top color bar ---
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pw, 18, "F");

  // Logo or practice name in top bar
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", 10, 3, 12, 12); } catch { /* skip */ }
    doc.text(practiceName, 26, 12);
  } else {
    doc.text(practiceName, getCenteredX(doc, practiceName, pw), 12);
  }

  // --- Star decorations ---
  const starColor = tintColor(brandColor, 0.3);
  drawStarIcon(doc, 30, 38, 6, starColor);
  drawStarIcon(doc, 180, 38, 5, starColor);
  drawStarIcon(doc, 25, 50, 4, tintColor(brandColor, 0.5));
  drawStarIcon(doc, 185, 48, 3, tintColor(brandColor, 0.6));

  // --- Main headline ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(...TEXT_DARK);
  const h1 = headline || "Ihre Meinung z\u00e4hlt!";
  doc.text(h1, getCenteredX(doc, h1, pw), 55);

  // --- Subheading ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(...TEXT_MUTED);
  const sub = `Bewerten Sie Ihren Besuch bei ${practiceName}`;
  doc.text(sub, getCenteredX(doc, sub, pw), 68);

  // --- QR code (120mm) ---
  const qrSize = 120;
  const qrX = (pw - qrSize) / 2;
  const qrY = 80;

  // Light tinted background behind QR
  doc.setFillColor(...tintColor(brandColor, 0.92));
  doc.roundedRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12, 4, 4, "F");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- Green CTA badge ---
  const badgeY = qrY + qrSize + 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  const badgeText = "Nur 60 Sekunden!";
  const badgeW = doc.getTextWidth(badgeText) + 20;
  drawPill(doc, (pw - badgeW) / 2, badgeY, badgeW, 12, GREEN_BADGE, WHITE, badgeText);

  // --- 3 steps ---
  const stepsY = badgeY + 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(...TEXT_DARK);
  const steps = ["1. QR-Code scannen", "2. Feedback geben", "3. Fertig!"];
  const stepSpacing = 55;
  const stepsStartX = (pw - stepSpacing * 2) / 2 - 10;
  steps.forEach((step, i) => {
    const sx = stepsStartX + i * stepSpacing;
    doc.setFillColor(...tintColor(brandColor, 0.85));
    doc.circle(sx + 10, stepsY + 1, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...brandColor);
    doc.text(String(i + 1), sx + 10 - doc.getTextWidth(String(i + 1)) / 2, stepsY + 1 + getBaselineOffset(doc));
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_DARK);
    doc.text(step.substring(3), sx + 18, stepsY + 1 + getBaselineOffset(doc));
  });

  // --- Privacy badge ---
  drawPrivacyBadge(doc, pw / 2, stepsY + 16, "light");

  // --- Branding bar ---
  drawBrandingBar(doc, pw, ph, brandColor, 12);

  return doc.output("blob");
}

/**
 * 2. A6 Aufsteller Light – Header stripe + tinted QR background
 */
export async function generateA6Card(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 105;
  const ph = 148;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pw, ph] });

  // --- Brand color header ---
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pw, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  const h1 = headline || "Wie war Ihr Besuch?";
  doc.text(h1, getCenteredX(doc, h1, pw), 18);

  // --- Tinted QR background ---
  const qrSize = 60;
  const qrX = (pw - qrSize) / 2;
  const qrY = 38;
  doc.setFillColor(...tintColor(brandColor, 0.9));
  doc.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, "F");

  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- Practice name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...TEXT_DARK);
  const nameY = qrY + qrSize + 10;
  renderCenteredWrappedText(doc, practiceName, nameY, pw, pw - 16);

  // --- Scan hint ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...TEXT_MUTED);
  const hint = "Scannen > Bewerten > Fertig!";
  doc.text(hint, getCenteredX(doc, hint, pw), nameY + 10);

  // --- Privacy badge ---
  drawPrivacyBadge(doc, pw / 2, nameY + 14, "light");

  // --- Branding bar ---
  drawBrandingBar(doc, pw, ph, brandColor, 8);

  return doc.output("blob");
}

/**
 * 3. A5 Tischaufsteller Light – Split layout (brand left, white right)
 */
export async function generateA5TableTentLight(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 210;
  const ph = 148;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });
  const half = pw / 2;

  // --- Left panel: brand color ---
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, half, ph, "F");

  // Headline on left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  const h1 = headline || "Ihre Meinung\nz\u00e4hlt!";
  const h1Lines = h1.split("\n");
  let ly = 30;
  for (const line of h1Lines) {
    doc.text(line, 12, ly);
    ly += 10;
  }

  // 3 benefit circles
  const benefits = ["Schnell", "Anonym", "Sicher"];
  const circleY = 65;
  benefits.forEach((b, i) => {
    const cx = 22 + i * 30;
    // White circle
    doc.setFillColor(255, 255, 255);
    const gState = doc.GState({ opacity: 0.2 });
    doc.saveGraphicsState();
    doc.setGState(gState);
    doc.circle(cx, circleY, 10, "F");
    doc.restoreGraphicsState();

    // White border
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);
    doc.circle(cx, circleY, 10, "S");

    // Text in circle
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(b, cx - doc.getTextWidth(b) / 2, circleY + getBaselineOffset(doc));
  });

  // "60 Sekunden" pill
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  drawPill(doc, 15, 95, 75, 10, null, WHITE, "Nur 60 Sekunden!", true);
  doc.setDrawColor(255, 255, 255);

  // Practice name bottom left
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const gStateName = doc.GState({ opacity: 0.7 });
  doc.saveGraphicsState();
  doc.setGState(gStateName);
  doc.text(practiceName, 12, ph - 12);
  doc.restoreGraphicsState();

  // --- Right panel: white ---
  doc.setFillColor(255, 255, 255);
  doc.rect(half, 0, half, ph, "F");

  // 3 numbered steps
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  const stepLabels = ["Scannen", "Bewerten", "Fertig!"];
  const stepStartY = 18;
  stepLabels.forEach((s, i) => {
    const sy = stepStartY + i * 14;
    // Number circle
    doc.setFillColor(...brandColor);
    doc.circle(half + 16, sy, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const num = String(i + 1);
    doc.text(num, half + 16 - doc.getTextWidth(num) / 2, sy + getBaselineOffset(doc));

    // Step label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...TEXT_DARK);
    doc.text(s, half + 24, sy + getBaselineOffset(doc));

    // Connecting dashed line
    if (i < stepLabels.length - 1) {
      drawDashedLine(doc, half + 16, sy + 5, half + 16, sy + 10, tintColor(brandColor, 0.5));
    }
  });

  // QR code
  const qrSize = 55;
  const qrX = half + (half - qrSize) / 2;
  const qrY = stepStartY + 48;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- Privacy badge (left panel bottom) ---
  drawPrivacyBadge(doc, half / 2, ph - 20, "dark");

  // Branding line at bottom right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_MUTED);
  const brand = "Erstellt mit PraxisPuls";
  doc.text(brand, half + (half - doc.getTextWidth(brand)) / 2, ph - 5);

  return doc.output("blob");
}

/**
 * 4. Visitenkarte Light – Business card centered on A6 page with cut marks
 */
export async function generateBusinessCardLight(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 105;
  const ph = 148;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pw, ph] });

  const cardW = 85;
  const cardH = 55;
  const cardX = (pw - cardW) / 2;
  const cardY = (ph - cardH) / 2;

  // --- Cut marks ---
  drawCutMarks(doc, cardX, cardY, cardW, cardH);

  // --- Card background ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.3);
  doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, "FD");

  // Brand accent stripe at top
  doc.setFillColor(...brandColor);
  doc.rect(cardX, cardY, cardW, 2, "F");

  // --- Left side: practice name + headline ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);
  doc.text(practiceName, cardX + 5, cardY + 12, { maxWidth: 40 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...brandColor);
  const h1 = headline || "Ihre Meinung z\u00e4hlt!";
  doc.text(h1, cardX + 5, cardY + 22, { maxWidth: 40 });

  // Small hint
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("QR-Code scannen &", cardX + 5, cardY + 32);
  doc.text("Feedback geben", cardX + 5, cardY + 36);

  // --- Right side: QR ---
  const qrSize = 32;
  const qrX = cardX + cardW - qrSize - 6;
  const qrY = cardY + 8;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- Privacy hint below card ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...TEXT_MUTED);
  const privText = "100\u00a0% anonym \u00B7 DSGVO-konform";
  doc.text(privText, pw / 2 - doc.getTextWidth(privText) / 2, cardY + cardH + 12);

  return doc.output("blob");
}

// ===========================================================================
// DARK PREMIUM DESIGNS
// ===========================================================================

/**
 * 5. A4 Infographic Dark – Gradient background, glass cards, glow QR
 */
export async function generateA4InfographicDark(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline, logoDataUrl } = config;
  const pw = 210;
  const ph = 297;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // --- Gradient background ---
  drawGradientRect(doc, 0, 0, pw, ph, DARK_BG, DARK_BG_LIGHTER);

  // --- Practice name / logo ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  if (logoDataUrl) {
    try { doc.addImage(logoDataUrl, "PNG", 15, 12, 12, 12); } catch { /* skip */ }
    doc.text(practiceName, 32, 21);
  } else {
    doc.text(practiceName, 15, 21);
  }

  // --- Headline in brand color ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...brandColor);
  const h1 = headline || "Ihre Meinung z\u00e4hlt!";
  doc.text(h1, getCenteredX(doc, h1, pw), 52);

  // --- Subheading ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(200, 200, 210);
  const sub = "Scannen, bewerten, fertig - in nur 60 Sekunden";
  doc.text(sub, getCenteredX(doc, sub, pw), 65);

  // --- 3 Glass step cards ---
  const cardW = 50;
  const cardH = 35;
  const cardsY = 80;
  const gap = 10;
  const totalW = cardW * 3 + gap * 2;
  const startX = (pw - totalW) / 2;

  const stepTexts = [
    { num: "1", title: "Scannen", desc: "QR-Code mit\nKamera \u00f6ffnen" },
    { num: "2", title: "Bewerten", desc: "Kurzes Feedback\nin 60 Sekunden" },
    { num: "3", title: "Fertig!", desc: "Danke f\u00fcr\nIhre Hilfe" },
  ];

  stepTexts.forEach((step, i) => {
    const cx = startX + i * (cardW + gap);
    drawGlassCard(doc, cx, cardsY, cardW, cardH, 3);

    // Number
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...brandColor);
    doc.text(step.num, cx + 6, cardsY + 10);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(step.title, cx + 14, cardsY + 10);

    // Description
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(180, 185, 200);
    const descLines = step.desc.split("\n");
    descLines.forEach((line, li) => {
      doc.text(line, cx + 6, cardsY + 18 + li * 5);
    });
  });

  // --- QR code with glow ---
  const qrSize = 110;
  const qrX = (pw - qrSize) / 2;
  const qrY = cardsY + cardH + 22;

  drawGlowEffect(doc, pw / 2, qrY + qrSize / 2, qrSize, brandColor, 4);

  // White background behind QR for readability
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 3, 3, "F");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- Stats pills ---
  const pillY = qrY + qrSize + 14;
  const pills = ["60s", "Anonym", "DSGVO", "0 Kosten"];
  const pillW = 30;
  const pillH = 8;
  const pillGap = 6;
  const totalPillW = pills.length * pillW + (pills.length - 1) * pillGap;
  const pillStartX = (pw - totalPillW) / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  pills.forEach((p, i) => {
    const px = pillStartX + i * (pillW + pillGap);
    drawGlassCard(doc, px, pillY, pillW, pillH, 4);
    doc.setTextColor(220, 225, 235);
    doc.text(p, px + (pillW - doc.getTextWidth(p)) / 2, pillY + pillH / 2 + getBaselineOffset(doc));
  });

  // --- Privacy badge ---
  drawPrivacyBadge(doc, pw / 2, pillY + 18, "dark");

  // --- Branding ---
  drawBrandingBarDark(doc, pw, ph, brandColor, 10);

  return doc.output("blob");
}

/**
 * 6. A6 Bold Aufsteller Dark – Dark background, step pills, glow QR
 */
export async function generateA6BoldDark(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 105;
  const ph = 148;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pw, ph] });

  // --- Dark background ---
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, pw, ph, "F");

  // --- Practice name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text(practiceName, getCenteredX(doc, practiceName, pw), 14);

  // --- Headline in brand color ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...brandColor);
  const h1 = headline || "Wie war Ihr Besuch?";
  doc.text(h1, getCenteredX(doc, h1, pw), 28);

  // --- Step pills horizontal ---
  const pillY = 36;
  const stepPills = ["Scannen", ">", "Bewerten", ">", "Fertig!"];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  let pillCursorX = 12;
  stepPills.forEach((p) => {
    if (p === ">") {
      doc.setTextColor(...brandColor);
      doc.text(p, pillCursorX, pillY + 4);
      pillCursorX += 6;
    } else {
      const tw = doc.getTextWidth(p) + 8;
      drawPill(doc, pillCursorX, pillY, tw, 7, null, brandColor, p, true);
      pillCursorX += tw + 4;
    }
  });

  // --- QR code with glow ---
  const qrSize = 58;
  const qrX = (pw - qrSize) / 2;
  const qrY = pillY + 16;

  drawGlowEffect(doc, pw / 2, qrY + qrSize / 2, qrSize, brandColor, 3);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 1.5, qrY - 1.5, qrSize + 3, qrSize + 3, 2, 2, "F");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- CTA badge ---
  const badgeY = qrY + qrSize + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const badgeText = "Nur 60 Sekunden";
  const badgeW = doc.getTextWidth(badgeText) + 14;
  drawPill(doc, (pw - badgeW) / 2, badgeY, badgeW, 8, brandColor, WHITE, badgeText);

  // --- Privacy badge ---
  drawPrivacyBadge(doc, pw / 2, badgeY + 14, "dark");

  // --- Branding ---
  drawBrandingBarDark(doc, pw, ph, brandColor, 8);

  return doc.output("blob");
}

/**
 * 7. A5 Tisch-Infographic Dark – Split dark layout with steps + QR
 */
export async function generateA5TableTentDark(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 210;
  const ph = 148;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });
  const half = pw / 2;

  // --- Left panel: dark ---
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, half, ph, "F");

  // --- Right panel: slightly lighter dark ---
  doc.setFillColor(...DARK_BG_LIGHTER);
  doc.rect(half, 0, half, ph, "F");

  // --- Left: Headline ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  const h1 = headline || "Ihre Meinung\nz\u00e4hlt!";
  const h1Lines = h1.split("\n");
  let ly = 25;
  for (const line of h1Lines) {
    doc.text(line, 14, ly);
    ly += 11;
  }

  // --- Left: 3 steps with dashed connection ---
  const stepsLeft = [
    { num: "1", label: "Scannen" },
    { num: "2", label: "Bewerten" },
    { num: "3", label: "Fertig!" },
  ];
  const stepStartY = 55;
  stepsLeft.forEach((s, i) => {
    const sy = stepStartY + i * 18;
    // Circle with number
    doc.setFillColor(...brandColor);
    doc.circle(24, sy, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(s.num, 24 - doc.getTextWidth(s.num) / 2, sy + getBaselineOffset(doc));

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(220, 225, 235);
    doc.text(s.label, 34, sy + getBaselineOffset(doc));

    // Dashed line connecting steps
    if (i < stepsLeft.length - 1) {
      drawDashedLine(doc, 24, sy + 6, 24, sy + 13, tintColor(brandColor, 0.3));
    }
  });

  // --- Left: Stats pills ---
  const statsY = stepStartY + 60;
  const stats = ["60s", "Anonym", "DSGVO"];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  let statX = 12;
  stats.forEach((st) => {
    const tw = doc.getTextWidth(st) + 10;
    drawGlassCard(doc, statX, statsY, tw, 8, 4);
    doc.setTextColor(200, 205, 220);
    doc.text(st, statX + (tw - doc.getTextWidth(st)) / 2, statsY + 8 / 2 + getBaselineOffset(doc));
    statX += tw + 5;
  });

  // --- Privacy badge (left panel bottom) ---
  drawPrivacyBadge(doc, half / 2, statsY + 14, "dark");

  // --- Right: QR with glow ---
  const qrSize = 60;
  const qrCenterX = half + half / 2;
  const qrY = 18;

  drawGlowEffect(doc, qrCenterX, qrY + qrSize / 2, qrSize, brandColor, 3);

  doc.setFillColor(255, 255, 255);
  const qrX = qrCenterX - qrSize / 2;
  doc.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 2, "F");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- Right: Practice name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const nameX = half + (half - doc.getTextWidth(practiceName)) / 2;
  doc.text(practiceName, nameX, qrY + qrSize + 14);

  // --- Branding ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...tintColor(brandColor, 0.3));
  const brand = "Erstellt mit PraxisPuls";
  doc.text(brand, half + (half - doc.getTextWidth(brand)) / 2, ph - 6);

  return doc.output("blob");
}

/**
 * 8. Visitenkarte Dark – Business card on dark A6 with brand accent stripe
 */
export async function generateBusinessCardDark(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 105;
  const ph = 148;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pw, ph] });

  // Light gray page background
  doc.setFillColor(245, 245, 245);
  doc.rect(0, 0, pw, ph, "F");

  const cardW = 85;
  const cardH = 55;
  const cardX = (pw - cardW) / 2;
  const cardY = (ph - cardH) / 2;

  // --- Cut marks ---
  drawCutMarks(doc, cardX, cardY, cardW, cardH);

  // --- Card dark background ---
  doc.setFillColor(...DARK_BG);
  doc.roundedRect(cardX, cardY, cardW, cardH, 2, 2, "F");

  // Brand accent stripe on left edge
  doc.setFillColor(...brandColor);
  doc.rect(cardX, cardY, 2.5, cardH, "F");

  // --- Left side: steps + practice name ---
  const stepsX = cardX + 7;
  const stepY = cardY + 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);

  const cardSteps = [
    { num: "1", label: "Scannen" },
    { num: "2", label: "Bewerten" },
    { num: "3", label: "Fertig!" },
  ];
  cardSteps.forEach((s, i) => {
    const sy = stepY + i * 8;
    // Small number in brand color
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...brandColor);
    doc.text(s.num + ".", stepsX, sy);

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(200, 205, 220);
    doc.text(s.label, stepsX + 5, sy);
  });

  // Practice name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(practiceName, stepsX, cardY + cardH - 10, { maxWidth: 38 });

  // Headline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...brandColor);
  const h1 = headline || "Ihre Meinung z\u00e4hlt!";
  doc.text(h1, stepsX, cardY + cardH - 5);

  // --- Right side: QR with mini glow ---
  const qrSize = 30;
  const qrX = cardX + cardW - qrSize - 7;
  const qrY = cardY + (cardH - qrSize) / 2 - 2;

  drawGlowEffect(doc, qrX + qrSize / 2, qrY + qrSize / 2, qrSize, brandColor, 2);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 1, 1, "F");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- Privacy hint below card ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(140, 145, 160);
  const privText = "100\u00a0% anonym \u00B7 DSGVO-konform";
  doc.text(privText, pw / 2 - doc.getTextWidth(privText) / 2, cardY + cardH + 12);

  return doc.output("blob");
}

// ===========================================================================
// INFOGRAPHIC DESIGNS (fully configurable)
// ===========================================================================

/**
 * 9. A4 Magazine Infographic – Full-page editorial style
 */
export async function generateA4MagazineInfographic(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 210;
  const ph = 297;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // --- Full gradient background ---
  drawGradientRect(doc, 0, 0, pw, ph, brandColor, tintColor(brandColor, 0.15));

  // --- Top decorative circles ---
  const circleOpacity = doc.GState({ opacity: 0.08 });
  doc.saveGraphicsState();
  doc.setGState(circleOpacity);
  doc.setFillColor(255, 255, 255);
  doc.circle(30, 30, 40, "F");
  doc.circle(190, 60, 25, "F");
  doc.circle(170, 280, 35, "F");
  doc.restoreGraphicsState();

  // --- Practice name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  const nameOpacity = doc.GState({ opacity: 0.85 });
  doc.saveGraphicsState();
  doc.setGState(nameOpacity);
  doc.text(practiceName, getCenteredX(doc, practiceName, pw), 30);
  doc.restoreGraphicsState();

  // --- Large headline ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.setTextColor(255, 255, 255);
  const h1 = headline || "Ihre Meinung\nist uns wichtig!";
  const h1Lines = h1.split("\n");
  let ly = 60;
  for (const line of h1Lines) {
    doc.text(line, getCenteredX(doc, line, pw), ly);
    ly += 16;
  }

  // --- Subtitle ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  const subOpacity = doc.GState({ opacity: 0.85 });
  doc.saveGraphicsState();
  doc.setGState(subOpacity);
  doc.setTextColor(255, 255, 255);
  const sub = "Scannen, bewerten, fertig - dauert nur 60 Sekunden";
  doc.text(sub, getCenteredX(doc, sub, pw), ly + 8);
  doc.restoreGraphicsState();

  // --- Glass cards row ---
  const cardsY = ly + 24;
  const cardW = 52;
  const cardH = 40;
  const gap = 8;
  const totalW = cardW * 3 + gap * 2;
  const startX = (pw - totalW) / 2;

  const steps = [
    { icon: "1", title: "QR scannen", desc: "Kamera \u00f6ffnen\n& scannen" },
    { icon: "2", title: "Bewerten", desc: "60 Sekunden\nFeedback" },
    { icon: "3", title: "Fertig!", desc: "Vielen Dank\nf\u00fcr Ihre Hilfe" },
  ];

  steps.forEach((step, i) => {
    const cx = startX + i * (cardW + gap);
    drawGlassCard(doc, cx, cardsY, cardW, cardH, 4);

    // Icon circle
    doc.setFillColor(255, 255, 255);
    const iconOp = doc.GState({ opacity: 0.25 });
    doc.saveGraphicsState();
    doc.setGState(iconOp);
    doc.circle(cx + 12, cardsY + 12, 7, "F");
    doc.restoreGraphicsState();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(step.icon, cx + 12 - doc.getTextWidth(step.icon) / 2, cardsY + 12 + getBaselineOffset(doc));

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(step.title, cx + 22, cardsY + 12 + getBaselineOffset(doc));

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const descOp = doc.GState({ opacity: 0.8 });
    doc.saveGraphicsState();
    doc.setGState(descOp);
    doc.setTextColor(255, 255, 255);
    step.desc.split("\n").forEach((l, li) => {
      doc.text(l, cx + 8, cardsY + 24 + li * 5);
    });
    doc.restoreGraphicsState();
  });

  // --- QR Code with white card ---
  const qrSize = 100;
  const qrCardPad = 10;
  const qrCardY = cardsY + cardH + 16;
  const qrCardW = qrSize + qrCardPad * 2;
  const qrCardH = qrSize + qrCardPad * 2 + 12;
  const qrCardX = (pw - qrCardW) / 2;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrCardX, qrCardY, qrCardW, qrCardH, 5, 5, "F");
  doc.addImage(qrDataUrl, "PNG", qrCardX + qrCardPad, qrCardY + qrCardPad, qrSize, qrSize);

  // "Jetzt scannen" text inside card
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...brandColor);
  const scanText = "Jetzt scannen!";
  doc.text(scanText, qrCardX + qrCardW / 2 - doc.getTextWidth(scanText) / 2, qrCardY + qrCardPad + qrSize + 8);

  // --- Stats bar ---
  const statsY = qrCardY + qrCardH + 12;
  const statItems = ["60 Sekunden", "100% anonym", "DSGVO-konform", "Kostenlos"];
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const pillTotalW = statItems.length * 36 + (statItems.length - 1) * 4;
  let statCursor = (pw - pillTotalW) / 2;
  statItems.forEach((s) => {
    drawGlassCard(doc, statCursor, statsY, 36, 9, 4.5);
    doc.setTextColor(255, 255, 255);
    doc.text(s, statCursor + (36 - doc.getTextWidth(s)) / 2, statsY + 9 / 2 + getBaselineOffset(doc));
    statCursor += 40;
  });

  // --- Privacy badge ---
  drawPrivacyBadge(doc, pw / 2, statsY + 18, "dark");

  // --- Bottom branding ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  const brandOp = doc.GState({ opacity: 0.5 });
  doc.saveGraphicsState();
  doc.setGState(brandOp);
  const branding = "Erstellt mit PraxisPuls - www.praxispuls.de";
  doc.text(branding, getCenteredX(doc, branding, pw), ph - 8);
  doc.restoreGraphicsState();

  return doc.output("blob");
}

/**
 * 10. A4 Bold Graphic – High contrast editorial with large typography
 */
export async function generateA4BoldGraphic(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 210;
  const ph = 297;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // --- White background ---
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pw, ph, "F");

  // --- Large brand color block (top 40%) ---
  const blockH = 120;
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pw, blockH, "F");

  // Diagonal cut at bottom of block
  doc.setFillColor(255, 255, 255);
  doc.triangle(0, blockH, pw, blockH - 20, pw, blockH, "F");

  // --- Practice name top left ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const nameOp = doc.GState({ opacity: 0.8 });
  doc.saveGraphicsState();
  doc.setGState(nameOp);
  doc.text(practiceName, 15, 18);
  doc.restoreGraphicsState();

  // --- Huge headline ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(44);
  doc.setTextColor(255, 255, 255);
  const h1 = headline || "Ihre Meinung\nz\u00e4hlt!";
  const lines = h1.split("\n");
  let headY = 50;
  for (const line of lines) {
    doc.text(line, 15, headY);
    headY += 18;
  }

  // --- Subtext in block ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  const subOp = doc.GState({ opacity: 0.85 });
  doc.saveGraphicsState();
  doc.setGState(subOp);
  doc.setTextColor(255, 255, 255);
  doc.text("Feedback in nur 60 Sekunden", 15, headY + 6);
  doc.restoreGraphicsState();

  // --- QR Code centered below block ---
  const qrSize = 90;
  const qrX = (pw - qrSize) / 2;
  const qrY = blockH + 10;

  // Tinted circle behind QR
  doc.setFillColor(...tintColor(brandColor, 0.9));
  doc.circle(pw / 2, qrY + qrSize / 2, qrSize / 2 + 8, "F");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- 3 Steps horizontal ---
  const stepsY = qrY + qrSize + 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const stepTexts = ["1. Scannen", "2. Bewerten", "3. Fertig!"];
  const stepW = 50;
  const stepStart = (pw - stepW * 3) / 2;
  stepTexts.forEach((s, i) => {
    const sx = stepStart + i * stepW;
    // Number circle
    doc.setFillColor(...brandColor);
    doc.circle(sx + 12, stepsY, 5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    const num = String(i + 1);
    doc.text(num, sx + 12 - doc.getTextWidth(num) / 2, stepsY + getBaselineOffset(doc));

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...TEXT_DARK);
    doc.text(s.substring(3), sx + 20, stepsY + getBaselineOffset(doc));
  });

  // --- Privacy badge ---
  drawPrivacyBadge(doc, pw / 2, stepsY + 16, "light");

  // --- Bottom brandColor bar ---
  doc.setFillColor(...brandColor);
  doc.rect(0, ph - 10, pw, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  const branding = "Erstellt mit PraxisPuls - www.praxispuls.de";
  doc.text(branding, getCenteredX(doc, branding, pw), ph - 3.5);

  return doc.output("blob");
}

/**
 * 11. A5 Landscape Infographic – Horizontal split with timeline
 */
export async function generateA5LandscapeInfographic(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 210;
  const ph = 148;
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });

  // --- Gradient background ---
  drawGradientRect(doc, 0, 0, pw, ph, DARK_BG, [20, 30, 50]);

  // --- Accent line at top ---
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, pw, 3, "F");

  // --- Left side: headline + timeline ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  const h1 = headline || "Ihre Meinung\nist uns wichtig!";
  const h1Lines = h1.split("\n");
  let ly = 24;
  for (const line of h1Lines) {
    doc.text(line, 14, ly);
    ly += 11;
  }

  // Timeline
  const timelineX = 22;
  const timelineStartY = ly + 8;
  const timelineSteps = [
    { label: "QR-Code scannen", time: "5 Sek." },
    { label: "Feedback geben", time: "50 Sek." },
    { label: "Fertig!", time: "Danke!" },
  ];

  // Vertical line
  doc.setDrawColor(...brandColor);
  doc.setLineWidth(0.8);
  doc.line(timelineX, timelineStartY, timelineX, timelineStartY + 50);

  timelineSteps.forEach((step, i) => {
    const sy = timelineStartY + i * 20;
    // Dot on timeline
    doc.setFillColor(...brandColor);
    doc.circle(timelineX, sy, 3, "F");
    doc.setFillColor(255, 255, 255);
    doc.circle(timelineX, sy, 1.5, "F");

    // Label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(step.label, timelineX + 8, sy + 1);

    // Time badge
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...brandColor);
    doc.text(step.time, timelineX + 8, sy + 7);
  });

  // Practice name bottom left
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const nameOp = doc.GState({ opacity: 0.5 });
  doc.saveGraphicsState();
  doc.setGState(nameOp);
  doc.setTextColor(255, 255, 255);
  doc.text(practiceName, 14, ph - 10);
  doc.restoreGraphicsState();

  // --- Right side: QR with glow ---
  const rightCenter = pw * 0.72;
  const qrSize = 65;

  drawGlowEffect(doc, rightCenter, ph / 2, qrSize, brandColor, 4);

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightCenter - qrSize / 2 - 3, ph / 2 - qrSize / 2 - 3, qrSize + 6, qrSize + 6, 3, 3, "F");
  doc.addImage(qrDataUrl, "PNG", rightCenter - qrSize / 2, ph / 2 - qrSize / 2, qrSize, qrSize);

  // --- Privacy badge (left side bottom) ---
  drawPrivacyBadge(doc, pw * 0.25, ph - 16, "dark");

  // Branding bottom right
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  const brandOp = doc.GState({ opacity: 0.4 });
  doc.saveGraphicsState();
  doc.setGState(brandOp);
  doc.setTextColor(255, 255, 255);
  const branding = "PraxisPuls";
  doc.text(branding, pw - doc.getTextWidth(branding) - 10, ph - 8);
  doc.restoreGraphicsState();

  return doc.output("blob");
}

/**
 * 12. A6 Minimal Infographic – Clean, icon-driven compact card
 */
export async function generateA6MinimalInfographic(config: PdfConfig): Promise<Blob> {
  const { qrDataUrl, practiceName, brandColor, headline } = config;
  const pw = 105;
  const ph = 148;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [pw, ph] });

  // --- White background ---
  doc.setFillColor(252, 252, 252);
  doc.rect(0, 0, pw, ph, "F");

  // --- Left accent stripe ---
  doc.setFillColor(...brandColor);
  doc.rect(0, 0, 4, ph, "F");

  // --- Practice name ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...TEXT_DARK);
  doc.text(practiceName, 12, 16);

  // --- Headline ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...brandColor);
  const h1 = headline || "Ihre Meinung\nz\u00e4hlt!";
  const h1Lines = h1.split("\n");
  let ly = 32;
  for (const line of h1Lines) {
    doc.text(line, 12, ly);
    ly += 9;
  }

  // --- Horizontal line ---
  doc.setDrawColor(...tintColor(brandColor, 0.7));
  doc.setLineWidth(0.5);
  doc.line(12, ly + 2, pw - 12, ly + 2);

  // --- 3 Steps with numbered circles ---
  const stepsY = ly + 10;
  const stepsData = [
    { num: "1", label: "QR-Code scannen" },
    { num: "2", label: "Feedback geben" },
    { num: "3", label: "Fertig!" },
  ];

  stepsData.forEach((s, i) => {
    const sy = stepsY + i * 10;
    doc.setFillColor(...brandColor);
    doc.circle(18, sy, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(s.num, 18 - doc.getTextWidth(s.num) / 2, sy + getBaselineOffset(doc));

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT_DARK);
    doc.text(s.label, 25, sy + getBaselineOffset(doc));
  });

  // --- QR code ---
  const qrSize = 45;
  const qrX = (pw - qrSize) / 2;
  const qrY = stepsY + 36;

  doc.setFillColor(...tintColor(brandColor, 0.92));
  doc.roundedRect(qrX - 4, qrY - 4, qrSize + 8, qrSize + 8, 3, 3, "F");
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // --- Privacy badge ---
  drawPrivacyBadge(doc, pw / 2, qrY + qrSize + 8, "light");

  // --- Bottom branding ---
  drawBrandingBar(doc, pw, ph, brandColor, 7);

  return doc.output("blob");
}
