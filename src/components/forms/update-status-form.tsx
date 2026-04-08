"use client";

import { useState } from "react";
import { updateListingStatus } from "@/actions/listings";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ListingStatus = "ACTIVE" | "RESCUED" | "ADOPTED" | "TRANSFERRED" | "EUTHANIZED" | "REMOVED";

export function UpdateStatusForm({
  listingId,
  currentStatus,
}: {
  listingId: string;
  currentStatus: ListingStatus;
}) {
  const [status, setStatus] = useState<ListingStatus>(currentStatus);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === currentStatus) return;
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await updateListingStatus(listingId, { status, reason: reason || undefined });
      setSuccess(true);
    } catch {
      setError("Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label>Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as ListingStatus)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="RESCUED">Rescued</SelectItem>
            <SelectItem value="ADOPTED">Adopted</SelectItem>
            <SelectItem value="TRANSFERRED">Transferred</SelectItem>
            <SelectItem value="EUTHANIZED">Euthanized</SelectItem>
            <SelectItem value="REMOVED">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor="reason">Reason (optional)</Label>
        <Textarea
          id="reason"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add context about this status change..."
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Status updated.</p>}

      <Button type="submit" disabled={saving || status === currentStatus} className="bg-blue-600 text-white hover:bg-blue-700">
        {saving ? "Saving..." : "Update Status"}
      </Button>
    </form>
  );
}
