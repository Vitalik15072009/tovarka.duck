"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Admin panel manages its own full-width layout (see /admin/layout.tsx)
    return <>{children}</>;
  }

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-md flex-col pb-20">{children}</div>
      <BottomNav />
    </>
  );
}
