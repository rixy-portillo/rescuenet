import { cn } from "@/lib/utils";

type UrgencyTier = "LOW" | "MED" | "HIGH" | "LAST_CALL";

const styles: Record<UrgencyTier, string> = {
  LAST_CALL: "bg-red-100 text-red-800 animate-pulse border border-red-300",
  HIGH: "bg-orange-100 text-orange-800 border border-orange-300",
  MED: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  LOW: "bg-gray-100 text-gray-700 border border-gray-300",
};

const labels: Record<UrgencyTier, string> = {
  LAST_CALL: "Last Call",
  HIGH: "High",
  MED: "Medium",
  LOW: "Low",
};

export function UrgencyTierBadge({ tier }: { tier: UrgencyTier }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles[tier]
      )}
    >
      {labels[tier]}
    </span>
  );
}
