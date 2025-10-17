"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/log", label: "Log" },
  { href: "/timeline", label: "Timeline" },
  { href: "/reports", label: "Reports" },
  { href: "/children", label: "Children" },
  { href: "/catalogs", label: "Catalogs" },
  { href: "/settings", label: "Settings" },
];

export function AppHeader() {
  const pathname = usePathname();
  return (
    <header className="border-b-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl text-primary">
            BehaviorTracker
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  pathname === l.href
                    ? "font-semibold text-foreground border-b-2 border-primary pb-1"
                    : "text-muted-foreground hover:text-foreground transition-colors"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="default">
            <Link href="/log">Log Incident</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

