import { z } from "zod";

// ──────────────────────────────────────
// Shelter
// ──────────────────────────────────────

export const createShelterSchema = z.object({
  name: z.string().min(1, "Shelter name is required"),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "Use 2-letter state code"),
  zipCode: z.string().optional(),
});

export type CreateShelterInput = z.infer<typeof createShelterSchema>;

// ──────────────────────────────────────
// Animal
// ──────────────────────────────────────

export const createAnimalSchema = z.object({
  shelterId: z.string().min(1, "Shelter is required"),
  name: z.string().optional(),
  externalId: z.string().optional(),
  species: z.enum(["DOG", "CAT"]),
  breed: z.string().optional(),
  breedSecondary: z.string().optional(),
  ageYears: z.coerce.number().int().min(0).optional(),
  ageMonths: z.coerce.number().int().min(0).max(11).optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]).optional(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"]).optional(),
  weightLbs: z.coerce.number().min(0).optional(),
  color: z.string().optional(),
  description: z.string().optional(),
  medicalNotes: z.string().optional(),
  behavioralNotes: z.string().optional(),
  goodWithKids: z.boolean().optional(),
  goodWithDogs: z.boolean().optional(),
  goodWithCats: z.boolean().optional(),
  houseTrained: z.boolean().optional(),
  spayedNeutered: z.boolean().optional(),
  vaccinated: z.boolean().optional(),
  specialNeeds: z.string().optional(),
  intakeDate: z.coerce.date().optional(),
});

export type CreateAnimalInput = z.infer<typeof createAnimalSchema>;

// ──────────────────────────────────────
// Listing
// ──────────────────────────────────────

export const createListingSchema = z.object({
  animalId: z.string().min(1, "Animal is required"),
  urgency: z.enum(["LOW", "MED", "HIGH", "LAST_CALL"]),
  deadlineAt: z.coerce.date().optional(),
  riskReason: z.enum(["TIME_LIMIT", "SPACE", "MEDICAL", "BEHAVIORAL", "OTHER"]),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
  sourceUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  sourceNotes: z.string().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;

export const updateListingStatusSchema = z.object({
  status: z.enum([
    "ACTIVE",
    "RESCUED",
    "ADOPTED",
    "TRANSFERRED",
    "EUTHANIZED",
    "REMOVED",
  ]),
  reason: z.string().optional(),
});

export type UpdateListingStatusInput = z.infer<
  typeof updateListingStatusSchema
>;
