import jwt, { SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

if (!JWT_SECRET) {
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
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET!) as AdminTokenPayload;
  } catch {
    return null;
  }
}