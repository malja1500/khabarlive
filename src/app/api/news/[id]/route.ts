import { NextRequest, NextResponse } from "next/server";
import { newsQueries } from "@/lib/database";
import { getSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const item = newsQueries.findById(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  newsQueries.incrementViews(params.id);
  return NextResponse.json({ news: { ...item, views: item.views + 1 } });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const item = newsQueries.findById(params.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updates = await req.json();
  newsQueries.update(params.id, updates);
  return NextResponse.json({ success: true, news: newsQueries.findById(params.id) });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!newsQueries.findById(params.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  newsQueries.delete(params.id);
  return NextResponse.json({ success: true });
}
