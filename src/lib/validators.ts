import { z } from "zod";

// ──────────────────────────────────────
// Shelter
// ──────────────────────────────────────

export const createShelterSchema = z.object({
  name: z.string().min(1, "Shelter name is required"),
  description: z.string().optional(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required").length(2, "Use 2-letter state code"),
  zipCode: z.string().min(1, "ZIP code is required"),
});

export type CreateShelterInput = z.infer<typeof createShelterSchema>;

// ──────────────────────────────────────
// Animal
// ──────────────────────────────────────

export const createAnimalSchema = z.object({
  shelterId: z.string({ error: "Shelter is required" }).min(1, "Shelter is required"),
  name: z.string().optional(),
  externalId: z.string().optional(),
  species: z.enum(["DOG", "CAT"], { error: "Species is required" }),
  breed: z.string().optional(),
  breedSecondary: z.string().optional(),
  ageYears: z.coerce.number().int().min(0).optional(),
  ageMonths: z.coerce.number().int().min(0).max(11).optional(),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"], { error: "Gender is required" }),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "XLARGE"], { error: "Size is required" }),
  weightLbs: z.coerce.number({ error: "Weight is required" }).min(0.1, "Weight is required"),
  color: z.string().min(1, "Color is required"),
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
  animalId: z.string({ error: "Animal is required" }).min(1, "Animal is required"),
  urgency: z.enum(["LOW", "MED", "HIGH", "LAST_CALL"], { error: "Urgency is required" }),
  deadlineAt: z.coerce.date().optional(),
  riskReason: z.enum(["TIME_LIMIT", "SPACE", "MEDICAL", "BEHAVIORAL", "OTHER"], { error: "Risk reason is required" }),
  notes: z.string().min(1, "Reason for at risk is required"),
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

// ──────────────────────────────────────
// Photo
// ──────────────────────────────────────

export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;

export const requestPhotoUploadSchema = z.object({
  animalId: z.string().min(1),
  contentType: z.enum(ALLOWED_PHOTO_TYPES, { error: "Unsupported image type" }),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_PHOTO_SIZE_BYTES, "Image must be under 8MB"),
});

export type RequestPhotoUploadInput = z.infer<typeof requestPhotoUploadSchema>;

export const confirmPhotoUploadSchema = z.object({
  animalId: z.string().min(1),
  r2Key: z.string().min(1),
  altText: z.string().optional(),
});

export type ConfirmPhotoUploadInput = z.infer<typeof confirmPhotoUploadSchema>;
