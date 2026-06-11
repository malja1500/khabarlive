import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { makeHash, checkHash } from "./database";

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

// re-export از database تا بقیه فایل‌ها بتونن import کنن
export { makeHash as hashPassword, checkHash as verifyPassword };
