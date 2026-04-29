export const SPECIES_OPTIONS = [
  { value: "DOG", label: "Dogs" },
  { value: "CAT", label: "Cats" },
] as const;

export type SpeciesValue = (typeof SPECIES_OPTIONS)[number]["value"];
