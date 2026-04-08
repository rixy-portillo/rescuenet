import Link from "next/link";
import { getShelters, getInactiveShelters } from "@/data/shelters";
import { reactivateShelter } from "@/actions/shelters";
import { Button } from "@/components/ui/button";

export default async function SheltersPage({
  searchParams,
}: {
  searchParams: Promise<{ showInactive?: string }>;
}) {
  const { showInactive } = await searchParams;
  const showInactiveBool = showInactive === "true";

  const shelters = showInactiveBool ? [] : await getShelters();
  const inactiveShelters = showInactiveBool ? await getInactiveShelters() : [];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Shelters</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/shelters?showInactive=${!showInactiveBool}`}>
                {showInactiveBool ? "Hide Inactive" : "Show Inactive"}
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/shelters/new">Add Shelter</Link>
            </Button>
          </div>
        </div>

        {!showInactiveBool && (
          <>
            {shelters.length === 0 ? (
              <p className="text-muted-foreground">No active shelters. Add one to get started.</p>
            ) : (
              <div className="border rounded-lg divide-y">
                {shelters.map((shelter) => (
                  <div key={shelter.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="font-medium">{shelter.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {shelter.city}, {shelter.state}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/shelters/${shelter.id}`}>Edit</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showInactiveBool && (
        <div>
          <h2 className="text-lg font-semibold text-muted-foreground mb-3">
            Inactive Shelters
          </h2>
          {inactiveShelters.length === 0 ? (
            <p className="text-muted-foreground">No inactive shelters.</p>
          ) : (
            <>
              <div className="border rounded-lg divide-y">
                {inactiveShelters.map((shelter) => (
                  <div key={shelter.id} className="flex items-center justify-between px-4 py-3">
                    <div className="opacity-60">
                      <p className="font-medium">{shelter.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {shelter.city}, {shelter.state}
                      </p>
                    </div>
                    <form
                      action={async () => {
                        "use server";
                        await reactivateShelter(shelter.id);
                      }}
                    >
                      <Button size="sm" type="submit" className="bg-green-500 text-white hover:bg-green-600">
                        Reactivate
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Reactivating a shelter restores their animals. Closed listings are not restored.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
