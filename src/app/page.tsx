import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getUrgentListings } from "@/data/listings";
import { ListingCard } from "@/components/listings/listing-card";

export const metadata: Metadata = {
  title: "RescueNet — Every hour counts",
  description:
    "Browse urgent shelter listings. Help at-risk animals find fosters, rescues, and adopters before time runs out.",
};

export default async function HomePage() {
  const [listingCount, shelterCount, urgentListings] = await Promise.all([
    prisma.listing.count({
      where: { status: "ACTIVE", animal: { shelter: { isActive: true } } },
    }),
    prisma.shelter.count({ where: { isActive: true } }),
    getUrgentListings(6),
  ]);

  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-red-50 to-white py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Every hour counts.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Shelter animals face euthanasia every day. RescueNet surfaces the most
            urgent cases so you can help — share, foster, or adopt before time runs
            out.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/listings">Browse Urgent Listings</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">How It Works</Link>
            </Button>
          </div>
          {listingCount > 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              {listingCount} active listing{listingCount !== 1 ? "s" : ""} across{" "}
              {shelterCount} shelter{shelterCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </section>

      {/* Most Urgent */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">Most Urgent Listings</h2>
        {urgentListings.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No urgent listings right now. Check back soon.
          </p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {urgentListings.map((listing) => (
                <ListingCard key={listing.id} {...listing} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button asChild variant="outline">
                <Link href="/listings">View All Listings</Link>
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
