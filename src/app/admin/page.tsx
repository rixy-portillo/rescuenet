import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const [shelterCount, animalCount, activeListings, recentChanges] =
    await Promise.all([
      prisma.shelter.count({ where: { isActive: true } }),
      prisma.animal.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.statusHistory.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            include: { animal: { select: { name: true } } },
          },
        },
      }),
    ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {session.user?.name ?? "Admin"}.
      </p>

      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Shelters</p>
          <p className="text-3xl font-bold mt-1">{shelterCount}</p>
          <Button variant="link" className="px-0 mt-2" asChild>
            <Link href="/admin/shelters">Manage →</Link>
          </Button>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Animals</p>
          <p className="text-3xl font-bold mt-1">{animalCount}</p>
          <Button variant="link" className="px-0 mt-2" asChild>
            <Link href="/admin/animals">Manage →</Link>
          </Button>
        </div>
        <div className="rounded-lg border p-6">
          <p className="text-sm text-muted-foreground">Active Listings</p>
          <p className="text-3xl font-bold mt-1">{activeListings}</p>
          <Button variant="link" className="px-0 mt-2" asChild>
            <Link href="/admin/listings">Manage →</Link>
          </Button>
        </div>
      </div>

      {recentChanges.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Recent Status Changes</h2>
          <div className="border rounded-lg divide-y">
            {recentChanges.map((h) => (
              <div key={h.id} className="px-4 py-3 text-sm flex justify-between">
                <span>
                  <span className="font-medium">
                    {h.listing.animal.name ?? "Unnamed"}
                  </span>{" "}
                  → {h.toStatus.toLowerCase()}
                </span>
                <span className="text-muted-foreground">
                  {new Date(h.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
