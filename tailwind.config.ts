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
        // Telegram theme-adaptive colors (fed by CSS variables set from
        // window.Telegram.WebApp.themeParams — see TelegramContext.tsx)
        tg: {
          bg: "var(--tg-bg, #0e1116)",
          "secondary-bg": "var(--tg-secondary-bg, #161a21)",
          text: "var(--tg-text, #f5f6f7)",
          hint: "var(--tg-hint, #8a95a3)",
          link: "var(--tg-link, #f5b301)",
          button: "var(--tg-button, #f5b301)",
          "button-text": "var(--tg-button-text, #14161a)",
          section: "var(--tg-section-bg, #1b1f27)",
        },
        // TovarkaDuck brand palette — premium dark base + "duck-gold" signature
        duck: {
          gold: "#f5b301",
          "gold-light": "#ffd35c",
          "gold-dark": "#c98c00",
          ink: "#0e1116",
          charcoal: "#161a21",
          slate: "#1b1f27",
          mist: "#8a95a3",
          cream: "#f7f4ee",
          teal: "#1fae8e",
          coral: "#ff5c5c",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        gold: "0 8px 30px -8px rgba(245, 179, 1, 0.45)",
        card: "0 4px 24px -6px rgba(0,0,0,0.35)",
        "card-light": "0 4px 20px -8px rgba(20,20,20,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
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
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.16,1,0.3,1) both",
        "scale-in": "scale-in 0.3s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.6s infinite linear",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
