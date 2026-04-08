"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createListingSchema, CreateListingInput } from "@/lib/validators";
import { createListing } from "@/actions/listings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Animal = { id: string; name: string | null; species: string; breed: string | null };

export function ListingForm({ animals }: { animals: Animal[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateListingInput>({
    resolver: zodResolver(createListingSchema) as unknown as Resolver<CreateListingInput>,
    mode: "onChange",
  });

  async function onSubmit(data: CreateListingInput) {
    try {
      setError(null);
      await createListing(data);
      router.push("/admin/listings");
    } catch {
      setError("Failed to create listing. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div className="space-y-1">
        <Label>Animal *</Label>
        <Select onValueChange={(v) => setValue("animalId", v, { shouldValidate: true })}>
          <SelectTrigger>
            <SelectValue placeholder="Select animal" />
          </SelectTrigger>
          <SelectContent>
            {animals.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name ?? "Unnamed"} — {a.species.toLowerCase()}
                {a.breed ? `, ${a.breed}` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.animalId && (
          <p className="text-sm text-red-600">{errors.animalId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Urgency *</Label>
          <Select
            onValueChange={(v) =>
              setValue("urgency", v as "LOW" | "MED" | "HIGH" | "LAST_CALL", { shouldValidate: true })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select urgency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LAST_CALL">Last Call</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MED">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
          {errors.urgency && (
            <p className="text-sm text-red-600">{errors.urgency.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>Risk Reason *</Label>
          <Select
            onValueChange={(v) =>
              setValue(
                "riskReason",
                v as "TIME_LIMIT" | "SPACE" | "MEDICAL" | "BEHAVIORAL" | "OTHER",
                { shouldValidate: true }
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TIME_LIMIT">Time Limit</SelectItem>
              <SelectItem value="SPACE">Space</SelectItem>
              <SelectItem value="MEDICAL">Medical</SelectItem>
              <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.riskReason && (
            <p className="text-sm text-red-600">{errors.riskReason.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="deadlineAt">Deadline</Label>
        <Input id="deadlineAt" type="datetime-local" {...register("deadlineAt")} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes">Reason for at Risk *</Label>
        <Textarea
          id="notes"
          rows={3}
          placeholder="Explain why this animal is at risk — time limit, space constraints, medical needs, etc."
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-red-600">{errors.notes.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="internalNotes">Internal Notes</Label>
        <Textarea id="internalNotes" rows={2} {...register("internalNotes")} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="sourceUrl">Source URL</Label>
        <Input id="sourceUrl" placeholder="https://" {...register("sourceUrl")} />
        {errors.sourceUrl && (
          <p className="text-sm text-red-600">{errors.sourceUrl.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Listing"}
      </Button>
    </form>
  );
}
