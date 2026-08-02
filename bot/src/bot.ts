const TELEGRAM_API = "https://api.telegram.org";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getBotToken(): string {
  return requireEnv("TELEGRAM_BOT_TOKEN");
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    chat: { id: number };
    text?: string;
    from?: { id: number; username?: string; first_name?: string };
  };
}

/**
 * Handles a single Telegram update (called from the webhook route).
 * Currently supports:
 *   /start  -> replies with a button that opens the Mini App
 */
export async function handleUpdate(update: TelegramUpdate): Promise<void> {
  const message = update.message;
  if (!message?.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === "/start" || text.startsWith("/start ")) {
    await sendWelcomeMessage(chatId);
  }
}

async function sendWelcomeMessage(chatId: number): Promise<void> {
  const token = getBotToken();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.example.com";

  const body = {
    chat_id: chatId,
    text:
      "🦆 <b>Ласкаво просимо до TovarkaDuck!</b>\n\n" +
      "Тут ти знайдеш преміальний одяг, взуття та аксесуари. " +
      "Натисни кнопку нижче, щоб відкрити магазин прямо в Telegram.",
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: "🛍 Відкрити магазин", web_app: { url: appUrl } }]],
    },
  };

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.error("[bot] sendMessage failed:", res.status, await res.text());
  }
}

/**
 * Registers the webhook URL with Telegram. Call once during deployment,
 * e.g. via `npm run set-webhook` or a one-off script — never automatically
 * on every server start, to avoid hitting Telegram's rate limits.
 */
export async function setWebhook(publicUrl: string): Promise<void> {
  const token = getBotToken();
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const res = await fetch(`${TELEGRAM_API}/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: `${publicUrl}/webhook/telegram`,
      secret_token: secret,
    }),
  });
  const data = await res.json();
  console.log("[bot] setWebhook response:", data);
}
