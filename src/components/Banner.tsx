"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
}

const slides: BannerSlide[] = [
  {
    id: "1",
    title: "Нова колекція вже тут",
    subtitle: "Худі, кросівки та аксесуари TovarkaDuck",
    cta: "Дивитись",
    href: "/catalog?filter=new",
    gradient: "from-[#f5b301] via-[#c98c00] to-[#161a21]",
  },
  {
    id: "2",
    title: "Знижки до −30%",
    subtitle: "На вибрані товари цього тижня",
    cta: "До акцій",
    href: "/catalog?filter=promo",
    gradient: "from-[#ff5c5c] via-[#c98c00] to-[#161a21]",
  },
  {
    id: "3",
    title: "Безкоштовна доставка",
    subtitle: "При замовленні від 2000 грн",
    cta: "Обрати товари",
    href: "/catalog",
    gradient: "from-[#1fae8e] via-[#14161a] to-[#161a21]",
  },
];

export default function Banner() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
    }, 4500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-gold">
      <div
        className="flex transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide) => (
          <a
            key={slide.id}
            href={slide.href}
            className={cn(
              "relative flex min-w-full flex-col justify-end gap-2 bg-gradient-to-br p-5",
              slide.gradient
            )}
            style={{ aspectRatio: "16 / 9" }}
          >
            <span className="absolute right-4 top-4 text-5xl opacity-20">🦆</span>
            <h2 className="font-display text-xl font-extrabold leading-tight text-white drop-shadow-sm">
              {slide.title}
            </h2>
            <p className="text-sm text-white/85">{slide.subtitle}</p>
            <span className="mt-2 inline-flex w-fit items-center rounded-full bg-white/95 px-4 py-1.5 text-xs font-bold text-duck-ink transition-transform active:scale-95">
              {slide.cta} →
            </span>
          </a>
        ))}
      </div>

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === active ? "w-5 bg-white" : "w-1.5 bg-white/40"
            )}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
