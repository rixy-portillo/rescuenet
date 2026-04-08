"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/shelters", label: "Shelters", exact: false },
  { href: "/admin/animals", label: "Animals", exact: false },
  { href: "/admin/listings", label: "Listings", exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r min-h-screen p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground mb-4 tracking-wider">
        Admin
      </p>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
