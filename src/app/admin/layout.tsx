"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { getAdminToken } from "@/lib/adminClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setChecked(true);
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-duck-ink">{children}</div>;
  }

  if (!checked) return null;

  return (
    <div className="flex min-h-screen bg-duck-ink text-tg-text">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
