import { describe, it, expect } from "vitest";
import { routeByNps } from "../review-router";

describe("routeByNps", () => {
  const placeId = "ChIJ123abc";

  describe("promoter with Google Place ID", () => {
    it("routes NPS 10 to Google", () => {
      const result = routeByNps(10, placeId);
      expect(result.category).toBe("promoter");
      expect(result.routedTo).toBe("google");
      expect(result.showGooglePrompt).toBe(true);
      expect(result.googleReviewUrl).toContain(placeId);
      expect(result.alertRequired).toBe(false);
    });

    it("routes NPS 9 to Google (default threshold)", () => {
      const result = routeByNps(9, placeId);
      expect(result.routedTo).toBe("google");
      expect(result.showGooglePrompt).toBe(true);
    });
  });

  describe("promoter without Google Place ID", () => {
    it("does not route to Google when placeId is null", () => {
      const result = routeByNps(10, null);
      expect(result.category).toBe("promoter");
      expect(result.routedTo).toBeNull();
      expect(result.showGooglePrompt).toBe(false);
      expect(result.googleReviewUrl).toBeNull();
    });
  });

  describe("promoter with Google disabled", () => {
    it("does not route to Google when disabled", () => {
      const result = routeByNps(10, placeId, 9, false);
      expect(result.category).toBe("promoter");
      expect(result.routedTo).toBeNull();
      expect(result.showGooglePrompt).toBe(false);
    });
  });

  describe("custom threshold", () => {
    it("routes NPS 8 to Google with threshold 8", () => {
      const result = routeByNps(8, placeId, 8);
      expect(result.routedTo).toBe("google");
      expect(result.showGooglePrompt).toBe(true);
    });

    it("does not route NPS 8 to Google with threshold 9", () => {
      const result = routeByNps(8, placeId, 9);
      expect(result.routedTo).toBeNull();
    });

    it("routes NPS 7 to Google with threshold 7", () => {
      const result = routeByNps(7, placeId, 7);
      expect(result.routedTo).toBe("google");
    });
  });

  describe("passive", () => {
    it("returns passive for NPS 8 (no Google)", () => {
      const result = routeByNps(8, placeId);
      expect(result.category).toBe("passive");
      expect(result.routedTo).toBeNull();
      expect(result.alertRequired).toBe(false);
    });

    it("returns passive for NPS 7", () => {
      const result = routeByNps(7, placeId);
      expect(result.category).toBe("passive");
      expect(result.routedTo).toBeNull();
    });
  });

  describe("detractor", () => {
    it("returns detractor for NPS 6 with alert", () => {
      const result = routeByNps(6, placeId);
      expect(result.category).toBe("detractor");
      expect(result.routedTo).toBe("internal");
      expect(result.alertRequired).toBe(true);
      expect(result.showGooglePrompt).toBe(false);
      expect(result.googleReviewUrl).toBeNull();
    });

    it("returns detractor for NPS 0", () => {
      const result = routeByNps(0, placeId);
      expect(result.category).toBe("detractor");
      expect(result.alertRequired).toBe(true);
    });

    it("returns detractor for NPS 3 without placeId", () => {
      const result = routeByNps(3, null);
      expect(result.category).toBe("detractor");
      expect(result.routedTo).toBe("internal");
      expect(result.alertRequired).toBe(true);
    });
  });

  describe("Google Review URL format", () => {
    it("generates correct Google Review URL", () => {
      const result = routeByNps(10, "ChIJN1t_tDeuEmsRUsoyG83frY4");
      expect(result.googleReviewUrl).toBe(
        "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4"
      );
    });
  });
});
