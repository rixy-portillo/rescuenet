import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <p className="text-sm font-semibold">RescueNet</p>
            <p className="text-xs text-muted-foreground">
              Giving at-risk shelter animals a chance.
            </p>
          </div>
          <nav className="flex gap-6">
            <Link
              href="/about"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              About
            </Link>
            <Link
              href="/listings"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Urgent Listings
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
