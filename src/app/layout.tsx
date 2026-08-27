import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { TelegramProvider } from "@/context/TelegramContext";
import { CartProvider } from "@/context/CartContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "TovarkaDuck — оригінальний одяг та аксесуари",
  description:
    "TovarkaDuck (@tovarka_duck) — оригінальний одяг, взуття та аксесуари під замовлення. Магазин прямо в Telegram.",
  applicationName: "TovarkaDuck",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#000000",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className="dark">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen bg-tg-bg font-body text-tg-text antialiased">
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
