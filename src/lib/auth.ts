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
 * Hash a password.
 * Format: "hashed_" + base64(password)
 * Simple but sufficient for a demo/self-hosted project.
 * Replace with bcrypt for production-grade security.
 */
export function hashPassword(password: string): string {
  return "hashed_" + Buffer.from(password, "utf8").toString("base64");
}

/**
 * Verify a password against a stored hash.
 * All passwords (including seed data) are stored in the same format.
 */
export function verifyPassword(password: string, hash: string): boolean {
  if (!hash || !password) return false;
  if (hash.startsWith("hashed_")) {
    try {
      const decoded = Buffer.from(hash.slice(7), "base64").toString("utf8");
      return decoded === password;
    } catch {
      return false;
    }
  }
  return false;
}
