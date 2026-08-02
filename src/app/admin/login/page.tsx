"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAdminToken } from "@/lib/adminClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Помилка входу");
        return;
      }
      setAdminToken(data.token);
      router.replace("/admin");
    } catch {
      setError("Помилка мережі");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl bg-tg-secondary-bg p-8 shadow-card"
      >
        <div className="mb-6 text-center">
          <h1 className="font-display text-2xl font-extrabold text-tg-text">
            Tovarka<span className="text-duck-gold">Duck</span>
          </h1>
          <p className="mt-1 text-sm text-tg-hint">Вхід в адмін-панель</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логін"
            className="rounded-xl bg-tg-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-duck-gold/60"
            autoFocus
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Пароль"
            className="rounded-xl bg-tg-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-duck-gold/60"
          />
          {error && <p className="text-sm text-duck-coral">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-xl bg-duck-gold py-3 text-sm font-bold text-duck-ink transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "Вхід..." : "Увійти"}
          </button>
        </div>
      </form>
    </div>
  );
}
