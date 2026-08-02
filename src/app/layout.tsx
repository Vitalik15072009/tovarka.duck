import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { TelegramProvider } from "@/context/TelegramContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "TovarkaDuck — Магазин",
  description: "Преміальний магазин TovarkaDuck прямо в Telegram",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0e1116",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <head>
        {/* Official Telegram Mini Apps JS SDK — required for WebApp/Main/Back button, haptics, theme */}
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-screen bg-tg-bg text-tg-text font-body antialiased">
        <TelegramProvider>
          <CartProvider>
            <FavoritesProvider>
              <AppShell>{children}</AppShell>
            </FavoritesProvider>
          </CartProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
