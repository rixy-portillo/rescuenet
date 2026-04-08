import Link from "next/link";
import { getAllListings } from "@/data/listings";
import { Button } from "@/components/ui/button";
import { UrgencyTierBadge } from "@/components/listings/urgency-tier-badge";
import { StatusBadge } from "@/components/listings/status-badge";

export default async function ListingsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ showRemoved?: string }>;
}) {
  const { showRemoved } = await searchParams;
  const showRemovedBool = showRemoved === "true";
  const listings = await getAllListings({ showRemoved: showRemovedBool });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Listings</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/listings?showRemoved=${!showRemovedBool}`}>
              {showRemovedBool ? "Hide Removed" : "Show Removed"}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/listings/new">New Listing</Link>
          </Button>
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">No listings yet.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {listings.map((listing) => (
            <div key={listing.id} className="flex items-center justify-between px-4 py-3">
              <div className="space-y-1">
                <p className="font-medium">
                  {listing.animal.name ?? "Unnamed"}{" "}
                  <span className="text-sm text-muted-foreground font-normal">
                    — {listing.animal.shelter.name}
                  </span>
                </p>
                <div className="flex gap-2">
                  <UrgencyTierBadge tier={listing.urgency} />
                  <StatusBadge status={listing.status} />
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/listings/${listing.id}`}>
                  {listing.status === "REMOVED" ? "View" : "Manage"}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
