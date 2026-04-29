import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getListingById } from "@/data/listings";
import { UrgencyTierBadge } from "@/components/listings/urgency-tier-badge";
import { DeadlineCountdown } from "@/components/listings/deadline-countdown";
import { CopyLinkButton } from "@/components/listings/copy-link-button";

const genderLabels: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  UNKNOWN: "Unknown",
};

const sizeLabels: Record<string, string> = {
  SMALL: "Small",
  MEDIUM: "Medium",
  LARGE: "Large",
  XLARGE: "Extra Large",
};

function formatAge(ageYears: number | null, ageMonths: number | null): string | null {
  if (!ageYears && !ageMonths) return null;
  const parts: string[] = [];
  if (ageYears) parts.push(`${ageYears} year${ageYears !== 1 ? "s" : ""}`);
  if (ageMonths) parts.push(`${ageMonths} month${ageMonths !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing || listing.status !== "ACTIVE" || !listing.animal.shelter.isActive) {
    return { title: "RescueNet" };
  }
  const name = listing.animal.name ?? "An animal";
  const description =
    listing.notes?.trim().slice(0, 155) ??
    "Help save an animal's life. View the listing on RescueNet.";
  return {
    title: `${name} needs your help — RescueNet`,
    description,
    openGraph: {
      title: `${name} needs your help — RescueNet`,
      description,
    },
  };
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);

  if (!listing || listing.status !== "ACTIVE" || !listing.animal.shelter.isActive) {
    notFound();
  }

  const animal = listing.animal;
  const shelter = animal.shelter;
  const age = formatAge(animal.ageYears, animal.ageMonths);
  const speciesLabel = animal.species.charAt(0) + animal.species.slice(1).toLowerCase();

  const profileFields = [
    { label: "Age", value: age },
    { label: "Gender", value: animal.gender ? (genderLabels[animal.gender] ?? animal.gender) : null },
    { label: "Size", value: animal.size ? (sizeLabels[animal.size] ?? animal.size) : null },
    { label: "Weight", value: animal.weightLbs ? `${Number(animal.weightLbs)} lbs` : null },
    { label: "Color", value: animal.color },
  ].filter((f): f is { label: string; value: string } => !!f.value);

  const boolTraits = [
    { label: "Good with kids", value: animal.goodWithKids },
    { label: "Good with dogs", value: animal.goodWithDogs },
    { label: "Good with cats", value: animal.goodWithCats },
    { label: "House trained", value: animal.houseTrained },
    { label: "Spayed/Neutered", value: animal.spayedNeutered },
    { label: "Vaccinated", value: animal.vaccinated },
  ].filter((t): t is { label: string; value: boolean } => t.value !== null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <article className="space-y-8">
        {/* Photo placeholder */}
        <div className="bg-gray-100 rounded-xl h-64 w-full" />

        {/* Header */}
        <section>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold">{animal.name ?? "Unnamed"}</h1>
              <p className="text-muted-foreground mt-1">
                {speciesLabel}
                {animal.breed ? ` · ${animal.breed}` : ""}
                {animal.breedSecondary ? ` / ${animal.breedSecondary}` : ""}
              </p>
            </div>
            <UrgencyTierBadge tier={listing.urgency} />
          </div>
          <div className="mt-3">
            <DeadlineCountdown deadlineAt={listing.deadlineAt} />
          </div>
        </section>

        {/* Reason for at Risk */}
        {listing.notes && (
          <section>
            <h2 className="text-lg font-semibold mb-2">Reason for at Risk</h2>
            <p className="text-muted-foreground whitespace-pre-line">{listing.notes}</p>
          </section>
        )}

        {/* Animal Profile */}
        {(profileFields.length > 0 || boolTraits.length > 0 || animal.description) && (
          <section>
            <h2 className="text-lg font-semibold mb-3">About</h2>

            {profileFields.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                {profileFields.map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="font-medium">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {boolTraits.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {boolTraits.map(({ label, value }) => (
                  <span
                    key={label}
                    className={`text-xs rounded-full px-3 py-1 border ${
                      value
                        ? "bg-green-50 text-green-800 border-green-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {value ? "✓" : "✗"} {label}
                  </span>
                ))}
              </div>
            )}

            {animal.description && (
              <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
                {animal.description}
              </p>
            )}
          </section>
        )}

        {/* Shelter Info */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Shelter</h2>
          <div className="text-sm space-y-1">
            <p className="font-medium">{shelter.name}</p>
            <p className="text-muted-foreground">
              {shelter.city}, {shelter.state}
            </p>
            {shelter.phone && (
              <p>
                <a href={`tel:${shelter.phone}`} className="text-blue-600 hover:underline">
                  {shelter.phone}
                </a>
              </p>
            )}
            {shelter.email && (
              <p>
                <a href={`mailto:${shelter.email}`} className="text-blue-600 hover:underline">
                  {shelter.email}
                </a>
              </p>
            )}
            {shelter.website && (
              <p>
                <a
                  href={shelter.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Website
                </a>
              </p>
            )}
          </div>
        </section>

        {/* How to Help */}
        <section className="rounded-xl border bg-muted/40 p-6">
          <h2 className="text-lg font-semibold mb-3">How to Help</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${shelter.phone}`}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Call {shelter.name}
            </a>
            <CopyLinkButton />
          </div>
        </section>

        {/* Source link */}
        {listing.sourceUrl && (
          <p className="text-sm text-muted-foreground">
            <a
              href={listing.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              View original source →
            </a>
          </p>
        )}
      </article>
    </div>
  );
}
