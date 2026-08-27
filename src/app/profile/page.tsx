"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Heart, MapPin, Settings, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import { useTelegram } from "@/context/TelegramContext";

export default function ProfilePage() {
  const { user } = useTelegram();
  const [tab, setTab] = useState<"addresses" | "settings">("addresses");

  return (
    <>
      <Header title="Профіль" />
      <div className="flex flex-col gap-5 px-4 pb-8">
        <div className="flex items-center gap-3 rounded-2xl bg-tg-section p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-duck-gold text-2xl font-bold text-duck-ink">
            {user?.first_name?.[0]?.toUpperCase() ?? "🦆"}
          </div>
          <div>
            <p className="font-display text-base font-bold text-tg-text">
              {user ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() : "Гість"}
            </p>
            <p className="text-xs text-tg-hint">{user?.username ? `@${user.username}` : "Увійдіть через Telegram"}</p>
          </div>
        </div>

        <Link
          href="/orders"
          className="flex items-center justify-between rounded-2xl bg-tg-section p-4 transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Package size={18} className="text-duck-gold" />
            <span className="text-sm font-semibold text-tg-text">Мої замовлення</span>
          </div>
          <ChevronRight size={16} className="text-tg-hint" />
        </Link>

        <Link
          href="/favorites"
          className="flex items-center justify-between rounded-2xl bg-tg-section p-4 transition-transform active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <Heart size={18} className="text-duck-coral" />
            <span className="text-sm font-semibold text-tg-text">Обране</span>
          </div>
          <ChevronRight size={16} className="text-tg-hint" />
        </Link>

        <div className="flex gap-2 rounded-2xl bg-tg-section p-1">
          {[
            { key: "addresses", label: "Адреси", icon: MapPin },
            { key: "settings", label: "Налаштування", icon: Settings },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-colors ${
                tab === t.key ? "bg-duck-gold text-duck-ink" : "text-tg-hint"
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "addresses" && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MapPin size={28} className="text-tg-hint" />
            <p className="text-sm text-tg-hint">
              Адреси зберігаються автоматично з ваших останніх замовлень (місто + відділення Нової
              Пошти).
            </p>
          </div>
        )}

        {tab === "settings" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-tg-section p-4">
              <span className="text-sm font-medium text-tg-text">Тема</span>
              <span className="text-xs text-tg-hint">Синхронізовано з Telegram</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-tg-section p-4">
              <span className="text-sm font-medium text-tg-text">Мова</span>
              <span className="text-xs text-tg-hint">Українська</span>
            </div>
            <a
              href="https://t.me/tovarkaduck"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl bg-tg-section p-4"
            >
              <span className="text-sm font-medium text-tg-text">Наш Telegram-канал</span>
              <ChevronRight size={16} className="text-tg-hint" />
            </a>
          </div>
        )}
      </div>
    </>
  );
}
