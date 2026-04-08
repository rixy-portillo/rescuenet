"use client";

import { createAnimal, deleteAnimal, updateAnimal } from "@/actions/animals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateAnimalInput, createAnimalSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";

type Shelter = { id: string; name: string };

type Props = {
  shelters: Shelter[];
  animal?: CreateAnimalInput & { id: string };
};

export function AnimalForm({ shelters, animal }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!animal;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateAnimalInput>({
    resolver: zodResolver(createAnimalSchema) as unknown as Resolver<CreateAnimalInput>,
    defaultValues: animal,
    mode: "onChange",
  });

  async function onSubmit(data: CreateAnimalInput) {
    try {
      setError(null);
      if (isEditing) {
        await updateAnimal(animal.id, data);
      } else {
        await createAnimal(data);
      }
      router.push("/admin/animals");
    } catch {
      setError("Failed to save animal. Please try again.");
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this animal? This cannot be undone.")) return;
    try {
      await deleteAnimal(animal!.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete animal.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
      <div className="space-y-1">
        <Label>Shelter *</Label>
        <Select
          defaultValue={animal?.shelterId}
          onValueChange={(v) => setValue("shelterId", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select shelter" />
          </SelectTrigger>
          <SelectContent>
            {shelters.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.shelterId && (
          <p className="text-sm text-red-600">{errors.shelterId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register("name")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="externalId">External ID</Label>
          <Input id="externalId" {...register("externalId")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Species *</Label>
          <Select
            defaultValue={animal?.species}
            onValueChange={(v) => setValue("species", v as "DOG" | "CAT")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DOG">Dog</SelectItem>
              <SelectItem value="CAT">Cat</SelectItem>
            </SelectContent>
          </Select>
          {errors.species && (
            <p className="text-sm text-red-600">{errors.species.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label>Gender *</Label>
          <Select
            defaultValue={animal?.gender}
            onValueChange={(v) => setValue("gender", v as "MALE" | "FEMALE" | "UNKNOWN")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
              <SelectItem value="UNKNOWN">Unknown</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-red-600">{errors.gender.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="breed">Breed</Label>
          <Input id="breed" {...register("breed")} />
        </div>
        <div className="space-y-1">
          <Label>Size *</Label>
          <Select
            defaultValue={animal?.size ?? undefined}
            onValueChange={(v) =>
              setValue("size", v as "SMALL" | "MEDIUM" | "LARGE" | "XLARGE")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SMALL">Small</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LARGE">Large</SelectItem>
              <SelectItem value="XLARGE">X-Large</SelectItem>
            </SelectContent>
          </Select>
          {errors.size && (
            <p className="text-sm text-red-600">{errors.size.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="ageYears">Age (years)</Label>
          <Input id="ageYears" type="number" min={0} {...register("ageYears")} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="ageMonths">Age (months)</Label>
          <Input id="ageMonths" type="number" min={0} max={11} {...register("ageMonths")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="color">Color *</Label>
          <Input id="color" {...register("color")} />
          {errors.color && (
            <p className="text-sm text-red-600">{errors.color.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="weightLbs">Weight (lbs) *</Label>
          <Input id="weightLbs" type="number" step="0.1" min={0} {...register("weightLbs")} />
          {errors.weightLbs && (
            <p className="text-sm text-red-600">{errors.weightLbs.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register("description")} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="medicalNotes">Medical Notes</Label>
        <Textarea id="medicalNotes" rows={2} {...register("medicalNotes")} />
      </div>

      <div className="space-y-1">
        <Label htmlFor="behavioralNotes">Behavioral Notes</Label>
        <Textarea id="behavioralNotes" rows={2} {...register("behavioralNotes")} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting} className={isEditing ? "bg-blue-600 text-white hover:bg-blue-700" : ""}>
          {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Animal"}
        </Button>
        {isEditing && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Delete Animal
          </Button>
        )}
      </div>
    </form>
  );
}
