import { NextRequest, NextResponse } from "next/server";
import { newsQueries, userQueries, DBNews, DBUser } from "@/lib/database";
import { getSession } from "@/lib/auth";

/** Convert a DB row to the shape the frontend expects */
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "all";
  const search   = searchParams.get("search")   || "";
  const page     = parseInt(searchParams.get("page")  || "1");
  const limit    = parseInt(searchParams.get("limit") || "50");
  const offset   = (page - 1) * limit;

  const session   = await getSession();
  const isAdmin   = session?.role === "admin" ? 1 : 0;
  const searchStr = search ? `%${search.toLowerCase()}%` : "";

  const rows = newsQueries.search.all({
    isAdmin,
    category,
    search:  searchStr,
    limit,
    offset,
  }) as DBNews[];

  const countRow = newsQueries.count.get({
    isAdmin,
    category,
    search: searchStr,
  }) as { total: number };

  return NextResponse.json({
    news:  rows.map(rowToNews),
    total: countRow.total,
    page,
    limit,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    title, titleEn, titleAr,
    excerpt, excerptEn, excerptAr,
    newsBody, category, image, tags, status,
  } = body;

  if (!title?.trim() || !category) {
    return NextResponse.json({ error: "Title and category required" }, { status: 400 });
  }

  const author = userQueries.findById.get(session.userId) as DBUser | undefined;

  const newItem = {
    id:           "news-" + Date.now(),
    title:        title.trim(),
    title_en:     titleEn   || null,
    title_ar:     titleAr   || null,
    excerpt:      excerpt   || null,
    excerpt_en:   excerptEn || null,
    excerpt_ar:   excerptAr || null,
    body:         newsBody  || null,
    body_en:      null,
    body_ar:      null,
    category,
    image:        image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80",
    author:       author?.name  || "Admin",
    author_id:    session.userId,
    author_avatar:author?.avatar || "https://i.pravatar.cc/80?img=1",
    status:       status || "published",
    views:        0,
    reading_time: "۳ دقیقه",
    tags:         JSON.stringify(
                    tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : []
                  ),
    created_at:   new Date().toISOString(),
  };

  newsQueries.insert.run(newItem);

  return NextResponse.json({ success: true, news: rowToNews(newItem as any) }, { status: 201 });
}
