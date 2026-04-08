import { notFound } from "next/navigation";
import { getAnimalById } from "@/data/animals";
import { getShelters } from "@/data/shelters";
import { AnimalForm } from "@/components/forms/animal-form";

export default async function EditAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [animal, shelters] = await Promise.all([getAnimalById(id), getShelters()]);
  if (!animal) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Animal</h1>
      <AnimalForm
        shelters={shelters}
        animal={{
          id: animal.id,
          shelterId: animal.shelterId,
          name: animal.name ?? undefined,
          externalId: animal.externalId ?? undefined,
          species: animal.species,
          breed: animal.breed ?? undefined,
          breedSecondary: animal.breedSecondary ?? undefined,
          ageYears: animal.ageYears ?? undefined,
          ageMonths: animal.ageMonths ?? undefined,
          gender: animal.gender!,
          size: animal.size!,
          weightLbs: animal.weightLbs!,
          color: animal.color!,
          description: animal.description ?? undefined,
          medicalNotes: animal.medicalNotes ?? undefined,
          behavioralNotes: animal.behavioralNotes ?? undefined,
          goodWithKids: animal.goodWithKids ?? undefined,
          goodWithDogs: animal.goodWithDogs ?? undefined,
          goodWithCats: animal.goodWithCats ?? undefined,
          houseTrained: animal.houseTrained ?? undefined,
          spayedNeutered: animal.spayedNeutered ?? undefined,
          vaccinated: animal.vaccinated ?? undefined,
          specialNeeds: animal.specialNeeds ?? undefined,
          intakeDate: animal.intakeDate ?? undefined,
        }}
      />
    </div>
  );
}
