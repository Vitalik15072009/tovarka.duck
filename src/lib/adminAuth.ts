import { NextRequest } from "next/server";
import { verifyAdminToken, AdminTokenPayload } from "./jwt";

/**
 * Reads the admin JWT from the Authorization header (Bearer <token>)
 * and returns the decoded payload, or null if missing/invalid.
 * Use this at the top of every admin-only API route.
 */
export function requireAdmin(req: NextRequest): AdminTokenPayload | null {
  const authHeader = req.headers.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return verifyAdminToken(token);
}
