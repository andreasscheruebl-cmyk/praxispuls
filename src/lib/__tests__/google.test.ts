import { describe, it, expect } from "vitest";
import { getGoogleReviewLink } from "../google";

describe("getGoogleReviewLink", () => {
  it("returns correct Google review URL", () => {
    const url = getGoogleReviewLink("ChIJ123abc");
    expect(url).toBe(
      "https://search.google.com/local/writereview?placeid=ChIJ123abc"
    );
  });
});
