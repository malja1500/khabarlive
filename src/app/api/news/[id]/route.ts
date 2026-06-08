import { NextRequest, NextResponse } from "next/server";
import { NEWS_DB } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = NEWS_DB.find((n) => n.id === params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  // Increment views
  item.views += 1;
  return NextResponse.json({ news: item });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idx = NEWS_DB.findIndex((n) => n.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates = await req.json();
  NEWS_DB[idx] = { ...NEWS_DB[idx], ...updates };
  return NextResponse.json({ success: true, news: NEWS_DB[idx] });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const idx = NEWS_DB.findIndex((n) => n.id === params.id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  NEWS_DB.splice(idx, 1);
  return NextResponse.json({ success: true });
}
