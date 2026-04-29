import Link from "next/link";
import { UrgencyTierBadge } from "./urgency-tier-badge";

type ListingCardProps = {
  id: string;
  urgency: "LOW" | "MED" | "HIGH" | "LAST_CALL";
  deadlineAt: Date | null;
  notes: string | null;
  animal: {
    name: string | null;
    species: string;
    breed: string | null;
    shelter: { name: string; city: string; state: string };
  };
};

function deadlineDisplay(
  deadlineAt: Date | null
): { text: string; className: string } | null {
  if (!deadlineAt) return null;
  const now = new Date();
  if (deadlineAt < now) {
    return { text: "Deadline passed", className: "text-red-600" };
  }
  const daysLeft = (deadlineAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  const dateStr = deadlineAt.toLocaleDateString();
  if (daysLeft < 1) return { text: `Due ${dateStr}`, className: "text-red-600" };
  if (daysLeft <= 3) return { text: `Due ${dateStr}`, className: "text-orange-600" };
  return { text: `Due ${dateStr}`, className: "text-muted-foreground" };
}

export function ListingCard({ id, urgency, deadlineAt, notes, animal }: ListingCardProps) {
  const deadline = deadlineDisplay(deadlineAt);
  const speciesLabel =
    animal.species.charAt(0) + animal.species.slice(1).toLowerCase();

  return (
    <Link href={`/listings/${id}`} className="block h-full">
      <article className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        <div className="bg-gray-100 h-40 w-full flex-shrink-0" />

        <div className="p-4 space-y-3 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold">
                {animal.name ?? "Unnamed"}{" "}
                <span className="text-muted-foreground font-normal text-sm">
                  ({speciesLabel})
                </span>
              </p>
              {animal.breed && (
                <p className="text-sm text-muted-foreground">{animal.breed}</p>
              )}
            </div>
            <UrgencyTierBadge tier={urgency} />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>{animal.shelter.name}</p>
            <p>
              {animal.shelter.city}, {animal.shelter.state}
            </p>
          </div>

          {deadline && (
            <p className={`text-sm font-medium ${deadline.className}`}>
              {deadline.text}
            </p>
          )}

          {notes && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-auto">
              {notes}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
