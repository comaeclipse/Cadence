"use client";

import { usePathname } from "next/navigation";
import { AppHeader } from "./app-header";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (isHomePage) {
    return <>{children}</>;
  }

  return (
    <>
      <AppHeader />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </>
  );
}
