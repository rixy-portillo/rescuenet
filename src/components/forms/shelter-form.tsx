"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createShelterSchema, CreateShelterInput } from "@/lib/validators";
import { createShelter, updateShelter, deactivateShelter } from "@/actions/shelters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  shelter?: CreateShelterInput & { id: string };
};

export function ShelterForm({ shelter }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!shelter;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateShelterInput>({
    resolver: zodResolver(createShelterSchema),
    defaultValues: shelter,
    mode: "onChange",
  });

  async function onSubmit(data: CreateShelterInput) {
    try {
      setError(null);
      if (isEditing) {
        await updateShelter(shelter.id, data);
      } else {
        await createShelter(data);
      }
      router.push("/admin/shelters");
    } catch {
      setError("Failed to save shelter. Please try again.");
    }
  }

  async function handleDelete() {
    if (!confirm("Deactivate this shelter? Their active listings will be closed. Animals and history are kept and can be restored by reactivating.")) return;
    await deactivateShelter(shelter!.id);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div className="space-y-1">
        <Label htmlFor="name">Shelter Name *</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" {...register("description")} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="addressLine1">Address *</Label>
        <Input id="addressLine1" {...register("addressLine1")} />
        {errors.addressLine1 && (
          <p className="text-sm text-red-600">{errors.addressLine1.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="addressLine2">Address Line 2</Label>
        <Input id="addressLine2" {...register("addressLine2")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="city">City *</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="state">State *</Label>
          <Input id="state" maxLength={2} {...register("state")} />
          {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="zipCode">ZIP Code *</Label>
        <Input id="zipCode" {...register("zipCode")} />
        {errors.zipCode && (
          <p className="text-sm text-red-600">{errors.zipCode.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Phone *</Label>
        <Input id="phone" inputMode="numeric" {...register("phone")} />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="website">Website</Label>
        <Input id="website" placeholder="https://" {...register("website")} />
        {errors.website && (
          <p className="text-sm text-red-600">{errors.website.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting} className={isEditing ? "bg-blue-600 text-white hover:bg-blue-700" : ""}>
          {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Shelter"}
        </Button>
        {isEditing && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Deactivate Shelter
          </Button>
        )}
      </div>
    </form>
  );
}
