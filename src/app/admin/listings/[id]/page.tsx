import { notFound } from "next/navigation";
import { getListingWithHistory } from "@/data/listings";
import { UrgencyTierBadge } from "@/components/listings/urgency-tier-badge";
import { StatusBadge } from "@/components/listings/status-badge";
import { UpdateStatusForm } from "@/components/forms/update-status-form";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingWithHistory(id);
  if (!listing) notFound();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">
          {listing.animal.name ?? "Unnamed"}{" "}
          <span className="text-muted-foreground font-normal text-lg">
            — {listing.animal.shelter.name}
          </span>
        </h1>
        <div className="flex gap-2 mt-2">
          <UrgencyTierBadge tier={listing.urgency} />
          <StatusBadge status={listing.status} />
        </div>
      </div>

      {listing.notes && (
        <div>
          <h2 className="font-semibold mb-1">Reason for at Risk</h2>
          <p className="text-sm text-muted-foreground">{listing.notes}</p>
        </div>
      )}

      {listing.status === "REMOVED" ? (
        <div className="rounded-md border border-muted bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          This listing has been removed and can no longer be updated.
        </div>
      ) : (
        <div>
          <h2 className="font-semibold mb-3">Update Status</h2>
          <UpdateStatusForm listingId={listing.id} currentStatus={listing.status} />
        </div>
      )}

      {listing.statusHistory.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Status History</h2>
          <div className="space-y-2">
            {listing.statusHistory.map((h) => (
              <div key={h.id} className="text-sm border rounded-md px-3 py-2">
                <div className="flex items-center gap-2">
                  {h.fromStatus && (
                    <>
                      <StatusBadge status={h.fromStatus} />
                      <span className="text-muted-foreground">→</span>
                    </>
                  )}
                  <StatusBadge status={h.toStatus} />
                  <span className="text-muted-foreground ml-auto">
                    {new Date(h.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {h.reason && (
                  <p className="text-muted-foreground mt-1">{h.reason}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
