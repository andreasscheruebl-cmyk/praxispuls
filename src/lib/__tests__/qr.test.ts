import { describe, it, expect } from "vitest";
import { generateQrCodeDataUrl, getSurveyUrl } from "../qr";

describe("getSurveyUrl", () => {
  it("returns correct URL with slug", () => {
    const url = getSurveyUrl("zahnarzt-mueller");
    expect(url).toContain("/s/zahnarzt-mueller");
  });

  it("starts with http", () => {
    const url = getSurveyUrl("test");
    expect(url).toMatch(/^https?:\/\//);
  });
});

describe("generateQrCodeDataUrl", () => {
  it("generates a data URL", async () => {
    const dataUrl = await generateQrCodeDataUrl("test-praxis");
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("generates different data URLs for different slugs", async () => {
    const url1 = await generateQrCodeDataUrl("praxis-a");
    const url2 = await generateQrCodeDataUrl("praxis-b");
    expect(url1).not.toBe(url2);
  });

  it("accepts custom width", async () => {
    const dataUrl = await generateQrCodeDataUrl("test", { width: 256 });
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("accepts custom color", async () => {
    const dataUrl = await generateQrCodeDataUrl("test", { color: "#FF0000" });
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
