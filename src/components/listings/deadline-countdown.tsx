"use client";

import { useEffect, useState } from "react";

function computeRemaining(deadlineAt: Date): { text: string; className: string } {
  const msLeft = deadlineAt.getTime() - Date.now();
  if (msLeft <= 0) {
    return { text: "Deadline passed", className: "text-red-600 font-medium" };
  }
  const totalMinutes = Math.floor(msLeft / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);

  const text =
    days > 0
      ? `${days} day${days !== 1 ? "s" : ""}, ${hours} hour${hours !== 1 ? "s" : ""} left`
      : `${hours} hour${hours !== 1 ? "s" : ""} left`;

  const className =
    days < 1
      ? "text-red-600 font-medium"
      : days <= 3
        ? "text-orange-600 font-medium"
        : "text-muted-foreground font-medium";

  return { text, className };
}

export function DeadlineCountdown({ deadlineAt }: { deadlineAt: Date | null }) {
  const [display, setDisplay] = useState<{ text: string; className: string } | null>(null);

  useEffect(() => {
    if (!deadlineAt) return;
    const update = () => setDisplay(computeRemaining(deadlineAt));
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [deadlineAt]);

  if (!deadlineAt || !display) return null;

  return <p className={display.className}>{display.text}</p>;
}
