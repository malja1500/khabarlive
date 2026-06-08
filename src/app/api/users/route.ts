import { NextRequest, NextResponse } from "next/server";
import { userQueries, DBUser } from "@/lib/database";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = userQueries.getAll.all() as DBUser[];
  const users = rows.map((u) => ({
    id:         u.id,
    name:       u.name,
    email:      u.email,
    role:       u.role,
    avatar:     u.avatar,
    createdAt:  u.created_at,
    newsCount:  u.news_count,
    isActive:   Boolean(u.is_active),
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

  const user = userQueries.findById.get(id) as DBUser | undefined;
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  userQueries.delete.run(id);
  return NextResponse.json({ success: true });
}
