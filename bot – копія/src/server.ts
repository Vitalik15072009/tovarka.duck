import express, { Request, Response, NextFunction } from "express";
import { handleUpdate } from "./bot";

const app = express();
app.use(express.json());

const PORT = Number(process.env.BOT_SERVICE_PORT) || 4000;

// --- Security: verify Telegram's secret token header on every webhook call ---
function verifyTelegramSecret(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected) {
    // Misconfiguration — fail closed rather than accepting unverified traffic.
    console.error("[bot] TELEGRAM_WEBHOOK_SECRET is not set; rejecting request.");
    return res.status(500).json({ error: "Server misconfigured" });
  }
  const received = req.header("x-telegram-bot-api-secret-token");
  if (received !== expected) {
    return res.status(401).json({ error: "Invalid secret token" });
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "tovarkaduck-bot" });
});

app.post("/webhook/telegram", verifyTelegramSecret, async (req, res) => {
  try {
    await handleUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[bot] Error handling update:", err);
    // Telegram retries on non-2xx, so still return 200 to avoid a retry storm
    // once we've logged the failure.
    res.status(200).json({ ok: false });
  }
});

app.listen(PORT, () => {
  console.log(`🦆 TovarkaDuck bot service listening on port ${PORT}`);
});
