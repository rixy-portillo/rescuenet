"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { SPECIES_OPTIONS } from "@/lib/species";
import { cn } from "@/lib/utils";

const URGENCY_OPTIONS = [
  { value: "LAST_CALL", label: "Last Call" },
  { value: "HIGH", label: "High" },
  { value: "MED", label: "Medium" },
  { value: "LOW", label: "Low" },
] as const;

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "Washington, DC" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export function FilterPanel() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const activeSpecies = searchParams.get("species")?.split(",").filter(Boolean) ?? [];
  const activeUrgency = searchParams.get("urgency")?.split(",").filter(Boolean) ?? [];
  const activeState = searchParams.get("state") ?? "";
  const hasFilters = activeSpecies.length > 0 || activeUrgency.length > 0 || !!activeState;

  function toggleMulti(param: string, value: string, current: string[]) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set(param, next.join(","));
    } else {
      params.delete(param);
    }
    router.replace(`/listings?${params.toString()}`);
  }

  function setDropdown(param: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
    router.replace(`/listings?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 border-b">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Species:</span>
        {SPECIES_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggleMulti("species", opt.value, activeSpecies)}
            className={cn(
              "rounded-full px-3 py-1 text-sm border transition-colors",
              activeSpecies.includes(opt.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Urgency:</span>
        {URGENCY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => toggleMulti("urgency", opt.value, activeUrgency)}
            className={cn(
              "rounded-full px-3 py-1 text-sm border transition-colors",
              activeUrgency.includes(opt.value)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-primary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">State:</span>
        <select
          value={activeState}
          onChange={(e) => setDropdown("state", e.target.value)}
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="">All states</option>
          {US_STATES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <button
          onClick={() => router.replace("/listings")}
          className="text-sm text-muted-foreground hover:text-foreground underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
