import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { UrgencyTier } from "@/generated/prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(deadlineAt: Date | null): string | null {
  if (!deadlineAt) return null;

  const now = new Date();
  const diff = deadlineAt.getTime() - now.getTime();

  if (diff <= 0) return "OVERDUE";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h left`;
  return `${hours}h left`;
}

export const urgencyConfig: Record<
  UrgencyTier,
  { label: string; className: string }
> = {
  LAST_CALL: {
    label: "LAST CALL",
    className: "bg-red-600 text-white animate-pulse",
  },
  HIGH: { label: "HIGH", className: "bg-orange-500 text-white" },
  MED: { label: "MED", className: "bg-yellow-500 text-black" },
  LOW: { label: "LOW", className: "bg-gray-400 text-white" },
};
