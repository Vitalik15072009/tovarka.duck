"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar({
  initialValue = "",
  placeholder = "Пошук товарів...",
}: {
  initialValue?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const router = useRouter();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/catalog?q=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={submit} className="relative w-full">
      <Search
        size={17}
        strokeWidth={2}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-tg-hint"
      />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/[0.07] bg-tg-secondary-bg py-3.5 pl-11 pr-4 text-[13.5px] text-tg-text placeholder:text-tg-hint"
      />
    </form>
  );
}
