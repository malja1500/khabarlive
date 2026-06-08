import { NextRequest, NextResponse } from "next/server";
import { USERS_DB } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Return users without sensitive info
  const users = USERS_DB.map(({ id, name, email, role, avatar, createdAt, newsCount, isActive }) => ({
    id, name, email, role, avatar, createdAt, newsCount, isActive,
  }));
  return NextResponse.json({ users });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  if (id === "admin-1") {
    return NextResponse.json({ error: "Cannot delete main admin" }, { status: 400 });
  }
  const idx = USERS_DB.findIndex((u) => u.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  USERS_DB.splice(idx, 1);
  return NextResponse.json({ success: true });
}
