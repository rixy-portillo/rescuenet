import { getAnimals } from "@/data/animals";
import { ListingForm } from "@/components/forms/listing-form";

export default async function NewListingPage() {
  const animals = await getAnimals();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Listing</h1>
      {animals.length === 0 ? (
        <p className="text-muted-foreground">
          You need to add an animal before creating a listing.
        </p>
      ) : (
        <ListingForm animals={animals} />
      )}
    </div>
  );
}
