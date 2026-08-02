import crypto from "crypto";

export interface TelegramInitDataUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface ParsedInitData {
  user: TelegramInitDataUser | null;
  authDate: number;
  queryId?: string;
}

/**
 * Validates the `initData` string sent by the Telegram Mini App client.
 * See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 *
 * Returns the parsed data if the signature is valid, otherwise `null`.
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 86400
): ParsedInitData | null {
  if (!initData || !botToken) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  const dataCheckArr: string[] = [];
  // Sorted alphabetically, as required by Telegram's spec
  const keys = Array.from(params.keys()).sort();
  for (const key of keys) {
    dataCheckArr.push(`${key}=${params.get(key)}`);
  }
  const dataCheckString = dataCheckArr.join("\n");

  // secret_key = HMAC_SHA256("WebAppData", bot_token)
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    return null;
  }

  const authDate = Number(params.get("auth_date") || 0);
  if (maxAgeSeconds > 0) {
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > maxAgeSeconds) {
      return null; // stale initData, likely replayed
    }
  }

  let user: TelegramInitDataUser | null = null;
  const userRaw = params.get("user");
  if (userRaw) {
    try {
      user = JSON.parse(userRaw);
    } catch {
      user = null;
    }
  }

  return {
    user,
    authDate,
    queryId: params.get("query_id") || undefined,
  };
}
