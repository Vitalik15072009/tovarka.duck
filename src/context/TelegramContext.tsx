"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

type ThemeParams = Record<string, string>;

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: { user?: TelegramUser; [key: string]: unknown };
  themeParams: ThemeParams;
  colorScheme: "light" | "dark";
  isExpanded: boolean;
  viewportHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  onEvent: (event: string, cb: () => void) => void;
  offEvent: (event: string, cb: () => void) => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp: TelegramWebApp };
  }
}

interface TelegramContextValue {
  webApp: TelegramWebApp | null;
  user: TelegramUser | null;
  colorScheme: "light" | "dark";
  isReady: boolean;
  initData: string;
  haptic: (style?: "light" | "medium" | "heavy") => void;
  notify: (type: "error" | "success" | "warning") => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
}

const TelegramContext = createContext<TelegramContextValue | null>(null);

function applyThemeToDocument(webApp: TelegramWebApp) {
  const root = document.documentElement;
  const t = webApp.themeParams || {};
  const map: Record<string, string> = {
    "--tg-bg": t.bg_color,
    "--tg-secondary-bg": t.secondary_bg_color,
    "--tg-text": t.text_color,
    "--tg-hint": t.hint_color,
    "--tg-link": t.link_color,
    "--tg-button": t.button_color,
    "--tg-button-text": t.button_text_color,
    "--tg-section-bg": t.section_bg_color,
  };
  Object.entries(map).forEach(([cssVar, value]) => {
    if (value) root.style.setProperty(cssVar, `#${value.replace("#", "")}`);
  });
  root.classList.toggle("dark", webApp.colorScheme === "dark");
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const w = window.Telegram?.WebApp;
    if (!w) {
      // Running outside Telegram (e.g. plain browser during development)
      setIsReady(true);
      return;
    }
    w.ready();
    w.expand();
    applyThemeToDocument(w);
    setColorScheme(w.colorScheme);
    setWebApp(w);
    setIsReady(true);

    const onThemeChanged = () => {
      applyThemeToDocument(w);
      setColorScheme(w.colorScheme);
    };
    w.onEvent("themeChanged", onThemeChanged);
    return () => w.offEvent("themeChanged", onThemeChanged);
  }, []);

  const haptic = useCallback(
    (style: "light" | "medium" | "heavy" = "light") => {
      webApp?.HapticFeedback.impactOccurred(style);
    },
    [webApp]
  );

  const notify = useCallback(
    (type: "error" | "success" | "warning") => {
      webApp?.HapticFeedback.notificationOccurred(type);
    },
    [webApp]
  );

  const showMainButton = useCallback(
    (text: string, onClick: () => void) => {
      if (!webApp) return;
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
      webApp.MainButton.enable();
    },
    [webApp]
  );

  const hideMainButton = useCallback(() => {
    webApp?.MainButton.hide();
  }, [webApp]);

  const showBackButton = useCallback(
    (onClick: () => void) => {
      if (!webApp) return;
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    },
    [webApp]
  );

  const hideBackButton = useCallback(() => {
    webApp?.BackButton.hide();
  }, [webApp]);

  const value = useMemo<TelegramContextValue>(
    () => ({
      webApp,
      user: webApp?.initDataUnsafe?.user ?? null,
      colorScheme,
      isReady,
      initData: webApp?.initData ?? "",
      haptic,
      notify,
      showMainButton,
      hideMainButton,
      showBackButton,
      hideBackButton,
    }),
    [webApp, colorScheme, isReady, haptic, notify, showMainButton, hideMainButton, showBackButton, hideBackButton]
  );

  return <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>;
}

export function useTelegram(): TelegramContextValue {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error("useTelegram must be used within TelegramProvider");
  return ctx;
}
