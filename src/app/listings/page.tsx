import { Suspense } from "react";
import Link from "next/link";
import { getFilteredListings } from "@/data/listings";
import { FilterPanel } from "@/components/listings/filter-panel";
import { ListingCard } from "@/components/listings/listing-card";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ species?: string; urgency?: string; state?: string }>;
}) {
  const params = await searchParams;

  const species = params.species?.split(",").filter(Boolean);
  const urgency = params.urgency?.split(",").filter(Boolean);
  const state = params.state;

  const listings = await getFilteredListings({ species, urgency, state });
  const hasFilters = !!(species?.length || urgency?.length || state);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Urgent Listings</h1>
      <p className="mt-2 text-muted-foreground">
        Browse animals that need help now. No account needed.
      </p>

      <Suspense>
        <FilterPanel />
      </Suspense>

      <div className="mt-8">
        {listings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No listings match your filters.</p>
            {hasFilters && (
              <Link
                href="/listings"
                className="mt-4 inline-block text-sm underline text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} {...listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
