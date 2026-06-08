import { NextRequest, NextResponse } from "next/server";
import { USERS_DB, PASSWORDS_DB } from "@/lib/db";
import { signToken, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Find user
    const user = USERS_DB.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "account_disabled" }, { status: 403 });
    }

    // Get stored hash - must exist
    const storedHash = PASSWORDS_DB[user.email];
    if (!storedHash) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    // Verify password
    const isValid = verifyPassword(password, storedHash);
    if (!isValid) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const token = await signToken({ userId: user.id, role: user.role });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
