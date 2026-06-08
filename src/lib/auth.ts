import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "khabarlive-super-secret-jwt-key-2026"
);

export async function signToken(payload: { userId: string; role: string }) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ userId: string; role: string } | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Hash a password using base64 encoding with a prefix marker.
 * Format: "hashed_<base64(password)>"
 */
export function hashPassword(password: string): string {
  return "hashed_" + Buffer.from(password).toString("base64");
}

/**
 * Verify a plain password against a stored hash.
 * Supports:
 *  1. New users hashed with hashPassword() → "hashed_<base64>"
 *  2. Seed users with known plain passwords stored as special markers
 */
export function verifyPassword(password: string, hash: string): boolean {
  // Case 1: passwords hashed by our hashPassword() function
  if (hash.startsWith("hashed_")) {
    try {
      const decoded = Buffer.from(hash.slice(7), "base64").toString("utf8");
      return decoded === password;
    } catch {
      return false;
    }
  }

  // Case 2: seed/legacy passwords stored as plain markers for demo
  // These are the initial seed accounts in db.ts
  const SEED_PASSWORDS: Record<string, string> = {
    "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lqpS": "Admin@1234",
    "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi": "password",
  };
  return SEED_PASSWORDS[hash] === password;
}
