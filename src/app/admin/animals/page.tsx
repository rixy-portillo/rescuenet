import Link from "next/link";
import { getAnimals } from "@/data/animals";
import { Button } from "@/components/ui/button";

export default async function AnimalsPage() {
  const animals = await getAnimals();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Animals</h1>
        <Button asChild>
          <Link href="/admin/animals/new">Add Animal</Link>
        </Button>
      </div>

      {animals.length === 0 ? (
        <p className="text-muted-foreground">No animals yet. Add one to get started.</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {animals.map((animal) => (
            <div key={animal.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">
                  {animal.name ?? "Unnamed"}{" "}
                  <span className="text-muted-foreground font-normal text-sm">
                    ({animal.species.toLowerCase()})
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {animal.shelter.name}
                  {animal.breed ? ` · ${animal.breed}` : ""}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/animals/${animal.id}`}>Edit</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
