import { NextRequest, NextResponse } from "next/server";
import { userQueries } from "@/lib/database";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await userQueries.getAll();
  const users = all.map(({ password: _p, ...u }) => u);
  return NextResponse.json({ users });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (id === "admin-1")
    return NextResponse.json({ error: "Cannot delete main admin" }, { status: 400 });
  if (!await userQueries.findById(id))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await userQueries.delete(id);
  return NextResponse.json({ success: true });
}
