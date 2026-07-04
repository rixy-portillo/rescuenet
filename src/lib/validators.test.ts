import { describe, expect, it } from "vitest";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_BYTES,
  confirmPhotoUploadSchema,
  createAnimalSchema,
  createListingSchema,
  createShelterSchema,
  requestPhotoUploadSchema,
  updateListingStatusSchema,
} from "./validators";

describe("createShelterSchema", () => {
  const valid = {
    name: "Happy Paws",
    phone: "5551234567",
    addressLine1: "123 Main St",
    city: "Springfield",
    state: "CA",
    zipCode: "90210",
  };

  it("accepts a valid minimal shelter", () => {
    expect(createShelterSchema.safeParse(valid).success).toBe(true);
  });

  it.each(["name", "phone", "addressLine1", "city", "state", "zipCode"])(
    "rejects when %s is missing",
    (field) => {
      const rest: Record<string, unknown> = { ...valid };
      delete rest[field];
      expect(createShelterSchema.safeParse(rest).success).toBe(false);
    }
  );

  it("rejects a phone number containing non-digit characters", () => {
    expect(createShelterSchema.safeParse({ ...valid, phone: "555-123-4567" }).success).toBe(false);
  });

  it("rejects a state code that isn't exactly 2 letters", () => {
    expect(createShelterSchema.safeParse({ ...valid, state: "California" }).success).toBe(false);
  });

  it("treats email as optional but validates it when present", () => {
    expect(createShelterSchema.safeParse({ ...valid, email: undefined }).success).toBe(true);
    expect(createShelterSchema.safeParse({ ...valid, email: "" }).success).toBe(true);
    expect(createShelterSchema.safeParse({ ...valid, email: "contact@shelter.org" }).success).toBe(true);
    expect(createShelterSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });

  it("treats website as optional but validates it when present", () => {
    expect(createShelterSchema.safeParse({ ...valid, website: "" }).success).toBe(true);
    expect(createShelterSchema.safeParse({ ...valid, website: "https://shelter.org" }).success).toBe(true);
    expect(createShelterSchema.safeParse({ ...valid, website: "not-a-url" }).success).toBe(false);
  });
});

describe("createAnimalSchema", () => {
  const valid = {
    shelterId: "shelter_123",
    species: "DOG",
    gender: "MALE",
    size: "MEDIUM",
    weightLbs: 42,
    color: "brown",
  };

  it("accepts a valid minimal animal", () => {
    expect(createAnimalSchema.safeParse(valid).success).toBe(true);
  });

  it.each(["shelterId", "species", "gender", "size", "weightLbs", "color"])(
    "rejects when %s is missing",
    (field) => {
      const rest: Record<string, unknown> = { ...valid };
      delete rest[field];
      expect(createAnimalSchema.safeParse(rest).success).toBe(false);
    }
  );

  it("only accepts DOG or CAT for species", () => {
    expect(createAnimalSchema.safeParse({ ...valid, species: "CAT" }).success).toBe(true);
    expect(createAnimalSchema.safeParse({ ...valid, species: "BIRD" }).success).toBe(false);
  });

  it("bounds ageMonths to 0-11", () => {
    expect(createAnimalSchema.safeParse({ ...valid, ageMonths: 0 }).success).toBe(true);
    expect(createAnimalSchema.safeParse({ ...valid, ageMonths: 11 }).success).toBe(true);
    expect(createAnimalSchema.safeParse({ ...valid, ageMonths: 12 }).success).toBe(false);
    expect(createAnimalSchema.safeParse({ ...valid, ageMonths: -1 }).success).toBe(false);
  });

  it("coerces weightLbs from a numeric string", () => {
    const result = createAnimalSchema.safeParse({ ...valid, weightLbs: "12.5" });
    expect(result.success).toBe(true);
    expect(result.success && result.data.weightLbs).toBe(12.5);
  });

  it("rejects a weight of zero", () => {
    expect(createAnimalSchema.safeParse({ ...valid, weightLbs: 0 }).success).toBe(false);
  });
});

describe("createListingSchema", () => {
  const valid = {
    animalId: "animal_123",
    urgency: "HIGH",
    riskReason: "TIME_LIMIT",
    notes: "Space is limited at this shelter.",
  };

  it("accepts a valid minimal listing", () => {
    expect(createListingSchema.safeParse(valid).success).toBe(true);
  });

  it.each(["animalId", "urgency", "riskReason", "notes"])("rejects when %s is missing", (field) => {
    const rest: Record<string, unknown> = { ...valid };
    delete rest[field];
    expect(createListingSchema.safeParse(rest).success).toBe(false);
  });

  it("only accepts known urgency tiers", () => {
    expect(createListingSchema.safeParse({ ...valid, urgency: "LAST_CALL" }).success).toBe(true);
    expect(createListingSchema.safeParse({ ...valid, urgency: "CRITICAL" }).success).toBe(false);
  });

  it("treats sourceUrl as optional but validates it when present", () => {
    expect(createListingSchema.safeParse({ ...valid, sourceUrl: "" }).success).toBe(true);
    expect(createListingSchema.safeParse({ ...valid, sourceUrl: "https://example.com" }).success).toBe(true);
    expect(createListingSchema.safeParse({ ...valid, sourceUrl: "not-a-url" }).success).toBe(false);
  });
});

describe("updateListingStatusSchema", () => {
  it.each(["ACTIVE", "RESCUED", "ADOPTED", "TRANSFERRED", "EUTHANIZED", "REMOVED"])(
    "accepts status %s",
    (status) => {
      expect(updateListingStatusSchema.safeParse({ status }).success).toBe(true);
    }
  );

  it("rejects an unknown status", () => {
    expect(updateListingStatusSchema.safeParse({ status: "PENDING" }).success).toBe(false);
  });

  it("treats reason as optional", () => {
    expect(updateListingStatusSchema.safeParse({ status: "ADOPTED" }).success).toBe(true);
  });
});

describe("requestPhotoUploadSchema", () => {
  const valid = { animalId: "animal_123", contentType: "image/jpeg", fileSize: 1024 };

  it("accepts a valid request", () => {
    expect(requestPhotoUploadSchema.safeParse(valid).success).toBe(true);
  });

  it.each(ALLOWED_PHOTO_TYPES)("accepts content type %s", (contentType) => {
    expect(requestPhotoUploadSchema.safeParse({ ...valid, contentType }).success).toBe(true);
  });

  it("rejects a content type outside the allow-list", () => {
    expect(requestPhotoUploadSchema.safeParse({ ...valid, contentType: "image/gif" }).success).toBe(false);
  });

  it("accepts a fileSize exactly at the max", () => {
    expect(requestPhotoUploadSchema.safeParse({ ...valid, fileSize: MAX_PHOTO_SIZE_BYTES }).success).toBe(true);
  });

  it("rejects a fileSize one byte over the max", () => {
    expect(requestPhotoUploadSchema.safeParse({ ...valid, fileSize: MAX_PHOTO_SIZE_BYTES + 1 }).success).toBe(
      false
    );
  });

  it("rejects a zero or negative fileSize", () => {
    expect(requestPhotoUploadSchema.safeParse({ ...valid, fileSize: 0 }).success).toBe(false);
    expect(requestPhotoUploadSchema.safeParse({ ...valid, fileSize: -100 }).success).toBe(false);
  });

  it("rejects a non-integer fileSize", () => {
    expect(requestPhotoUploadSchema.safeParse({ ...valid, fileSize: 100.5 }).success).toBe(false);
  });
});

describe("confirmPhotoUploadSchema", () => {
  it("accepts a valid confirmation without altText", () => {
    expect(
      confirmPhotoUploadSchema.safeParse({ animalId: "animal_123", r2Key: "animals/animal_123/x.jpg" }).success
    ).toBe(true);
  });

  it("accepts an optional altText", () => {
    expect(
      confirmPhotoUploadSchema.safeParse({
        animalId: "animal_123",
        r2Key: "animals/animal_123/x.jpg",
        altText: "A good boy",
      }).success
    ).toBe(true);
  });

  it("rejects a missing r2Key", () => {
    expect(confirmPhotoUploadSchema.safeParse({ animalId: "animal_123" }).success).toBe(false);
  });
});
