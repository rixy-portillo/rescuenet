import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cn, formatDeadline, photoAltText, speciesLabel, urgencyConfig } from "./utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("merges conflicting Tailwind utility classes, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});

describe("speciesLabel", () => {
  it("title-cases an uppercase species value", () => {
    expect(speciesLabel("DOG")).toBe("Dog");
    expect(speciesLabel("CAT")).toBe("Cat");
  });
});

describe("photoAltText", () => {
  it("uses the animal's name and breed when both are present", () => {
    expect(photoAltText({ name: "Buddy", species: "DOG", breed: "Labrador Retriever" })).toBe(
      "Buddy, a Labrador Retriever"
    );
  });

  it("falls back to just the name when there is no breed", () => {
    expect(photoAltText({ name: "Buddy", species: "DOG", breed: null })).toBe("Buddy");
  });

  it("describes an unnamed animal by species when there is no name", () => {
    expect(photoAltText({ name: null, species: "DOG", breed: null })).toBe("An unnamed dog");
  });

  it("describes an unnamed animal by species and breed when both are known", () => {
    expect(photoAltText({ name: null, species: "CAT", breed: "Siamese" })).toBe(
      "An unnamed cat, a Siamese"
    );
  });
});

describe("formatDeadline", () => {
  const NOW = new Date("2026-01-01T00:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when there is no deadline", () => {
    expect(formatDeadline(null)).toBeNull();
  });

  it("returns OVERDUE for a deadline in the past", () => {
    expect(formatDeadline(new Date(NOW.getTime() - 1000))).toBe("OVERDUE");
  });

  it("returns OVERDUE for a deadline exactly now", () => {
    expect(formatDeadline(new Date(NOW.getTime()))).toBe("OVERDUE");
  });

  it("shows hours left when under a day remains", () => {
    expect(formatDeadline(new Date(NOW.getTime() + 5 * 60 * 60 * 1000))).toBe("5h left");
  });

  it("shows days and hours left when more than a day remains", () => {
    expect(formatDeadline(new Date(NOW.getTime() + (2 * 24 + 3) * 60 * 60 * 1000))).toBe("2d 3h left");
  });
});

describe("urgencyConfig", () => {
  it("defines exactly the four urgency tiers", () => {
    expect(Object.keys(urgencyConfig).sort()).toEqual(["HIGH", "LAST_CALL", "LOW", "MED"].sort());
  });

  it("gives every tier a non-empty label and className", () => {
    for (const tier of Object.values(urgencyConfig)) {
      expect(tier.label.length).toBeGreaterThan(0);
      expect(tier.className.length).toBeGreaterThan(0);
    }
  });
});
