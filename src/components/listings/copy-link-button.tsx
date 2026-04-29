"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="outline" onClick={handleCopy}>
      {copied ? "Copied!" : "Copy Link"}
    </Button>
  );
}
