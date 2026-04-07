import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome, {session.user?.name ?? "Admin"}. Manage shelters, animals, and
        listings from here.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Shelters</h3>
          <p className="text-sm text-muted-foreground">Coming in Phase 1</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Animals</h3>
          <p className="text-sm text-muted-foreground">Coming in Phase 1</p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Listings</h3>
          <p className="text-sm text-muted-foreground">Coming in Phase 1</p>
        </div>
      </div>
    </div>
  );
}
