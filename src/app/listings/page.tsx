import { getActiveListings } from "@/data/listings";
import { UrgencyTierBadge } from "@/components/listings/urgency-tier-badge";

export default async function ListingsPage() {
  const listings = await getActiveListings();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Urgent Listings</h1>
      <p className="mt-2 text-muted-foreground">
        Browse animals that need help now. No account needed.
      </p>

      <div className="mt-8">
        {listings.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No active listings right now. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const animal = listing.animal;
              const shelter = animal.shelter;
              return (
                <div key={listing.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {animal.name ?? "Unnamed"}{" "}
                        <span className="text-muted-foreground font-normal text-sm">
                          ({animal.species.toLowerCase()})
                        </span>
                      </p>
                      {animal.breed && (
                        <p className="text-sm text-muted-foreground">{animal.breed}</p>
                      )}
                    </div>
                    <UrgencyTierBadge tier={listing.urgency} />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>{shelter.name}</p>
                    <p>
                      {shelter.city}, {shelter.state}
                    </p>
                  </div>

                  {listing.deadlineAt && (
                    <p className="text-sm font-medium text-red-600">
                      Deadline: {new Date(listing.deadlineAt).toLocaleDateString()}
                    </p>
                  )}

                  {listing.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
