"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar({ initialValue = "" }: { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/catalog?q=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className="relative w-full">
      <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-tg-hint" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Пошук товарів TovarkaDuck..."
        className="w-full rounded-2xl border border-white/5 bg-tg-secondary-bg py-3 pl-10 pr-4 text-sm text-tg-text placeholder:text-tg-hint focus:outline-none focus:ring-2 focus:ring-duck-gold/60"
      />
    </form>
  );
}
