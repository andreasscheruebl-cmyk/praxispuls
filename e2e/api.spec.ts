import { test, expect } from "@playwright/test";

test.describe("API Endpoints", () => {
  test("POST /api/public/responses validates input", async ({ request }) => {
    const response = await request.post("/api/public/responses", {
      data: { surveyId: "not-a-uuid", npsScore: 5 },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  test("POST /api/public/responses returns 404 for unknown survey", async ({ request }) => {
    const response = await request.post("/api/public/responses", {
      data: { surveyId: "00000000-0000-0000-0000-000000000001", npsScore: 8 },
    });
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.code).toBe("SURVEY_NOT_FOUND");
  });

  test("POST /api/public/responses rejects invalid NPS score", async ({ request }) => {
    const response = await request.post("/api/public/responses", {
      data: { surveyId: "00000000-0000-0000-0000-000000000001", npsScore: 15 },
    });
    expect(response.status()).toBe(400);
  });
});
