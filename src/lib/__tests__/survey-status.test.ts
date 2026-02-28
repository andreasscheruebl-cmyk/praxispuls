import { describe, it, expect } from "vitest";
import {
  canTransition,
  getAvailableTransitions,
  getComputedState,
  getAvailableActions,
  STATUS_BADGE_CONFIG,
} from "../survey-status";
import type { SurveyStatus } from "@/lib/db/schema";

describe("canTransition", () => {
  const validTransitions: [SurveyStatus, SurveyStatus][] = [
    ["draft", "active"],
    ["active", "paused"],
    ["active", "archived"],
    ["paused", "active"],
    ["paused", "archived"],
    ["archived", "paused"],
  ];

  it.each(validTransitions)("allows %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  const invalidTransitions: [SurveyStatus, SurveyStatus][] = [
    ["draft", "paused"],
    ["draft", "archived"],
    ["draft", "draft"],
    ["active", "draft"],
    ["active", "active"],
    ["paused", "draft"],
    ["paused", "paused"],
    ["archived", "draft"],
    ["archived", "active"],
    ["archived", "archived"],
  ];

  it.each(invalidTransitions)("rejects %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });
});

describe("getAvailableTransitions", () => {
  it("returns [active] for draft", () => {
    expect(getAvailableTransitions("draft")).toEqual(["active"]);
  });

  it("returns [paused, archived] for active", () => {
    expect(getAvailableTransitions("active")).toEqual(["paused", "archived"]);
  });

  it("returns [active, archived] for paused", () => {
    expect(getAvailableTransitions("paused")).toEqual(["active", "archived"]);
  });

  it("returns [paused] for archived", () => {
    expect(getAvailableTransitions("archived")).toEqual(["paused"]);
  });
});

describe("getComputedState", () => {
  const now = new Date("2026-03-01T12:00:00Z");

  it("returns status directly for non-active states", () => {
    expect(getComputedState("draft", null, null, now)).toBe("draft");
    expect(getComputedState("paused", null, null, now)).toBe("paused");
    expect(getComputedState("archived", null, null, now)).toBe("archived");
  });

  it("returns 'active' when no dates set", () => {
    expect(getComputedState("active", null, null, now)).toBe("active");
  });

  it("returns 'scheduled' when startsAt is in the future", () => {
    expect(
      getComputedState("active", "2026-04-01T00:00:00Z", null, now)
    ).toBe("scheduled");
  });

  it("returns 'ended' when endsAt is in the past", () => {
    expect(
      getComputedState("active", null, "2026-02-01T00:00:00Z", now)
    ).toBe("ended");
  });

  it("returns 'active' when within date range", () => {
    expect(
      getComputedState(
        "active",
        "2026-02-01T00:00:00Z",
        "2026-04-01T00:00:00Z",
        now
      )
    ).toBe("active");
  });

  it("returns 'scheduled' even when endsAt is set (startsAt takes priority)", () => {
    expect(
      getComputedState(
        "active",
        "2026-04-01T00:00:00Z",
        "2026-05-01T00:00:00Z",
        now
      )
    ).toBe("scheduled");
  });

  it("accepts Date objects for startsAt/endsAt", () => {
    expect(
      getComputedState("active", new Date("2026-04-01"), null, now)
    ).toBe("scheduled");
  });

  it("ignores dates for non-active status", () => {
    expect(
      getComputedState("paused", "2026-04-01T00:00:00Z", null, now)
    ).toBe("paused");
  });
});

describe("getAvailableActions", () => {
  it("returns correct actions for draft", () => {
    const actions = getAvailableActions("draft");
    expect(actions).toContain("activate");
    expect(actions).toContain("edit");
    expect(actions).toContain("delete");
    expect(actions).not.toContain("pause");
    expect(actions).not.toContain("archive");
  });

  it("returns correct actions for active", () => {
    const actions = getAvailableActions("active");
    expect(actions).toContain("pause");
    expect(actions).toContain("archive");
    expect(actions).toContain("show-qr");
    expect(actions).toContain("delete-responses");
    expect(actions).not.toContain("activate");
    expect(actions).not.toContain("delete");
  });

  it("returns correct actions for paused", () => {
    const actions = getAvailableActions("paused");
    expect(actions).toContain("activate");
    expect(actions).toContain("archive");
    expect(actions).not.toContain("pause");
  });

  it("returns correct actions for archived", () => {
    const actions = getAvailableActions("archived");
    expect(actions).toContain("unarchive");
    expect(actions).toContain("delete");
    expect(actions).toContain("delete-responses");
    expect(actions).not.toContain("activate");
    expect(actions).not.toContain("pause");
  });
});

describe("STATUS_BADGE_CONFIG", () => {
  const allStates = [
    "draft",
    "active",
    "paused",
    "archived",
    "scheduled",
    "ended",
  ] as const;

  it("has config for all computed states", () => {
    for (const state of allStates) {
      expect(STATUS_BADGE_CONFIG[state]).toBeDefined();
      expect(STATUS_BADGE_CONFIG[state].label).toBeTruthy();
      expect(STATUS_BADGE_CONFIG[state].className).toBeTruthy();
    }
  });

  it("uses German labels", () => {
    expect(STATUS_BADGE_CONFIG.draft.label).toBe("Entwurf");
    expect(STATUS_BADGE_CONFIG.active.label).toBe("Aktiv");
    expect(STATUS_BADGE_CONFIG.scheduled.label).toBe("Geplant");
    expect(STATUS_BADGE_CONFIG.ended.label).toBe("Beendet");
  });
});
