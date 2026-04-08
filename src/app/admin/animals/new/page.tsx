import { getShelters } from "@/data/shelters";
import { AnimalForm } from "@/components/forms/animal-form";

export default async function NewAnimalPage() {
  const shelters = await getShelters();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Animal</h1>
      {shelters.length === 0 ? (
        <p className="text-muted-foreground">
          You need to add a shelter before adding animals.
        </p>
      ) : (
        <AnimalForm shelters={shelters} />
      )}
    </div>
  );
}
