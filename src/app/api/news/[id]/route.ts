import { NextRequest, NextResponse } from "next/server";
import { newsQueries, DBNews } from "@/lib/database";
import { getSession } from "@/lib/auth";

function rowToNews(n: DBNews) {
  return {
    id:           n.id,
    title:        n.title,
    titleEn:      n.title_en   ?? "",
    titleAr:      n.title_ar   ?? "",
    excerpt:      n.excerpt    ?? "",
    excerptEn:    n.excerpt_en ?? "",
    excerptAr:    n.excerpt_ar ?? "",
    body:         n.body       ?? "",
    bodyEn:       n.body_en    ?? "",
    bodyAr:       n.body_ar    ?? "",
    category:     n.category,
    image:        n.image      ?? "",
    author:       n.author     ?? "",
    authorId:     n.author_id  ?? "",
    authorAvatar: n.author_avatar ?? "",
    status:       n.status,
    views:        n.views,
    readingTime:  n.reading_time ?? "۳ دقیقه",
    tags:         JSON.parse(n.tags ?? "[]"),
    createdAt:    n.created_at,
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const row = newsQueries.findById.get(params.id) as DBNews | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment view count
  newsQueries.incrementViews.run(params.id);
  row.views += 1;

  return NextResponse.json({ news: rowToNews(row) });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = newsQueries.findById.get(params.id) as DBNews | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updates = await req.json();
  newsQueries.update.run({
    id:       params.id,
    title:    updates.title    ?? row.title,
    title_en: updates.titleEn  ?? row.title_en,
    title_ar: updates.titleAr  ?? row.title_ar,
    excerpt:  updates.excerpt  ?? row.excerpt,
    body:     updates.body     ?? row.body,
    category: updates.category ?? row.category,
    image:    updates.image    ?? row.image,
    status:   updates.status   ?? row.status,
    tags:     updates.tags     ? JSON.stringify(updates.tags) : row.tags,
  });

  const updated = newsQueries.findById.get(params.id) as DBNews;
  return NextResponse.json({ success: true, news: rowToNews(updated) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const row = newsQueries.findById.get(params.id) as DBNews | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  newsQueries.delete.run(params.id);
  return NextResponse.json({ success: true });
}
