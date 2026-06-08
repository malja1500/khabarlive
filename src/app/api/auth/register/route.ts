import { NextRequest, NextResponse } from "next/server";
import { USERS_DB, PASSWORDS_DB } from "@/lib/db";
import { signToken, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "password_too_short" }, { status: 400 });
    }

    const existing = USERS_DB.find((u) => u.email === email);
    if (existing) {
      return NextResponse.json({ error: "email_exists" }, { status: 409 });
    }

    const newUser = {
      id: "user-" + Date.now(),
      name,
      email,
      role: "user" as const,
      avatar: `https://i.pravatar.cc/80?u=${email}`,
      createdAt: new Date().toISOString(),
      newsCount: 0,
      isActive: true,
    };

    USERS_DB.push(newUser);
    PASSWORDS_DB[email] = hashPassword(password);

    const token = await signToken({ userId: newUser.id, role: newUser.role });

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
