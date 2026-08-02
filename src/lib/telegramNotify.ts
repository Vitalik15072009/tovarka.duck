/**
 * Sends a message to the admin chat via the Telegram Bot API whenever
 * a new order is placed. Uses TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_CHAT_ID
 * from environment variables — never hard-code the token.
 */

interface OrderNotificationItem {
  title: string;
  quantity: number;
  price: number;
  size?: string | null;
  color?: string | null;
}

interface OrderNotificationPayload {
  orderNumber: string;
  fullName: string;
  phone: string;
  telegramUsername?: string | null;
  city: string;
  novaPoshta: string;
  comment?: string | null;
  total: number;
  items: OrderNotificationItem[];
}

export async function notifyAdminOfNewOrder(order: OrderNotificationPayload): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!token || !chatId) {
    console.warn(
      "[telegramNotify] TELEGRAM_BOT_TOKEN or TELEGRAM_ADMIN_CHAT_ID missing — skipping admin notification."
    );
    return;
  }

  const itemsText = order.items
    .map(
      (i) =>
        `• ${i.title} × ${i.quantity}${i.size ? ` (розмір ${i.size})` : ""}${
          i.color ? ` (${i.color})` : ""
        } — ${i.price * i.quantity} грн`
    )
    .join("\n");

  const text = [
    `🦆 <b>Нове замовлення #${order.orderNumber}</b>`,
    ``,
    `👤 ${escapeHtml(order.fullName)}`,
    `📞 ${escapeHtml(order.phone)}`,
    order.telegramUsername ? `💬 @${escapeHtml(order.telegramUsername)}` : null,
    `🏙 ${escapeHtml(order.city)}, ${escapeHtml(order.novaPoshta)}`,
    order.comment ? `📝 ${escapeHtml(order.comment)}` : null,
    ``,
    `<b>Товари:</b>`,
    itemsText,
    ``,
    `💰 <b>Разом: ${order.total} грн</b>`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[telegramNotify] Telegram API error:", res.status, body);
    }
  } catch (err) {
    console.error("[telegramNotify] Failed to reach Telegram API:", err);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
