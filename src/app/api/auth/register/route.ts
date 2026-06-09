import { NextRequest, NextResponse } from "next/server";
import { userQueries, DBUser } from "@/lib/database";
import { signToken, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "password_too_short" }, { status: 400 });
    }

    const existing = userQueries.findByEmail(email.trim());
    if (existing) {
      return NextResponse.json({ error: "email_exists" }, { status: 409 });
    }

    const newUser: DBUser = {
      id:        "user-" + Date.now(),
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      password:  hashPassword(password),
      role:      "user",
      avatar:    `https://i.pravatar.cc/80?u=${encodeURIComponent(email)}`,
      isActive:  true,
      newsCount: 0,
      createdAt: new Date().toISOString(),
    };

    userQueries.insert(newUser);   // saved to data/db.json

    const token = await signToken({ userId: newUser.id, role: newUser.role });

    const response = NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, avatar: newUser.avatar },
    });
    response.cookies.set("auth_token", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/",
    });
    return response;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
