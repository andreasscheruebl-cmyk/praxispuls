import { test, expect } from "@playwright/test";

test.describe("Multi-Location API", () => {
  test("DELETE /api/practice/:id returns 401 without auth", async ({
    request,
  }) => {
    const response = await request.delete(
      "/api/practice/00000000-0000-0000-0000-000000000001"
    );
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Nicht angemeldet");
  });

  test("GET /api/practice returns 401 without auth", async ({ request }) => {
    const response = await request.get("/api/practice");
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Nicht angemeldet");
  });

  test("POST /api/practice returns 401 without auth", async ({ request }) => {
    const response = await request.post("/api/practice", {
      data: { name: "Test Praxis" },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Nicht angemeldet");
  });
});

test.describe("Multi-Location Dashboard UI", () => {
  test("dashboard redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });

  test("settings page redirects to login", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await page.waitForURL(/\/login/);
    expect(page.url()).toContain("/login");
  });
});
