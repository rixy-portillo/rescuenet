import { cn } from "@/lib/utils";

type ListingStatus =
  | "ACTIVE"
  | "RESCUED"
  | "ADOPTED"
  | "TRANSFERRED"
  | "EUTHANIZED"
  | "REMOVED";

const styles: Record<ListingStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800 border border-green-300",
  RESCUED: "bg-blue-100 text-blue-800 border border-blue-300",
  ADOPTED: "bg-purple-100 text-purple-800 border border-purple-300",
  TRANSFERRED: "bg-cyan-100 text-cyan-800 border border-cyan-300",
  EUTHANIZED: "bg-gray-100 text-gray-600 border border-gray-300",
  REMOVED: "bg-gray-100 text-gray-500 border border-gray-200",
};

const labels: Record<ListingStatus, string> = {
  ACTIVE: "Active",
  RESCUED: "Rescued",
  ADOPTED: "Adopted",
  TRANSFERRED: "Transferred",
  EUTHANIZED: "Euthanized",
  REMOVED: "Removed",
};

export function StatusBadge({ status }: { status: ListingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
