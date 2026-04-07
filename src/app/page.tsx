import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-red-50 to-white py-24 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Every hour counts.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Shelter animals face euthanasia every day. RescueNet surfaces the
            most urgent cases so you can help — share, foster, or adopt before
            time runs out.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/listings">Browse Urgent Listings</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">How It Works</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Placeholder for urgent listings grid — Phase 2 */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-8">
          Most Urgent Listings
        </h2>
        <p className="text-center text-muted-foreground">
          Urgent listings will appear here once shelters and animals are added.
        </p>
      </section>
    </div>
  );
}
