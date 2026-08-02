import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  // Fail loudly at startup rather than silently signing with `undefined`
  throw new Error(
    "JWT_SECRET is not set. Add it to your .env file before starting the app."
  );
}

export interface AdminTokenPayload {
  adminId: string;
  login: string;
  role: "OWNER" | "MANAGER";
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as AdminTokenPayload;
  } catch {
    return null;
  }
}
