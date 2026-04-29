import { notFound } from "next/navigation";
import { getShelterById } from "@/data/shelters";
import { ShelterForm } from "@/components/forms/shelter-form";

export default async function EditShelterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shelter = await getShelterById(id);
  if (!shelter) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Shelter</h1>
      <ShelterForm
        shelter={{
          id: shelter.id,
          name: shelter.name,
          description: shelter.description ?? undefined,
          phone: shelter.phone,
          email: shelter.email ?? undefined,
          website: shelter.website ?? undefined,
          addressLine1: shelter.addressLine1,
          addressLine2: shelter.addressLine2 ?? undefined,
          city: shelter.city,
          state: shelter.state,
          zipCode: shelter.zipCode,
        }}
      />
    </div>
  );
}
