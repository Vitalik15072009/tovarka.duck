import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Токени лишаються сумісними з усіма наявними сторінками,
           але тепер дають глибокий чорний «дроп-стор» вигляд. */
        tg: {
          bg: "var(--tg-bg, #000000)",
          "secondary-bg": "var(--tg-secondary-bg, #0d0e10)",
          text: "var(--tg-text, #ffffff)",
          hint: "var(--tg-hint, #8b8e95)",
          link: "var(--tg-link, #ffc93c)",
          button: "var(--tg-button, #ffffff)",
          "button-text": "var(--tg-button-text, #0a0a0b)",
          section: "var(--tg-section-bg, #16171a)",
        },

        /* TovarkaDuck — фірмова палітра персонажа */
        duck: {
          gold: "#ffc93c",
          "gold-light": "#ffd766",
          "gold-dark": "#f0980a",
          amber: "#ffb300",
          beak: "#f4511e",
          ink: "#000000",
          charcoal: "#0d0e10",
          slate: "#16171a",
          line: "rgba(255,255,255,0.07)",
          mist: "#8b8e95",
          cream: "#f7f4ee",
          teal: "#3ddc97",
          coral: "#ff5c5c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        gold: "0 10px 40px -12px rgba(255, 201, 60, 0.45)",
        card: "0 8px 30px -14px rgba(0,0,0,0.9)",
        sheet: "0 -12px 40px -20px rgba(0,0,0,0.95)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        "duck-bob": {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-6px) rotate(-3deg)" },
        },
        "duck-glow": {
          "0%, 100%": { opacity: "0.35" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.6s infinite linear",
        "duck-bob": "duck-bob 3.5s ease-in-out infinite",
        "duck-glow": "duck-glow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
