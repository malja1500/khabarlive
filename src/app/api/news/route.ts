import { NextRequest, NextResponse } from "next/server";
import { newsQueries, userQueries, DBNews } from "@/lib/database";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || "all";
  const search   = searchParams.get("search")   || "";
  const page     = parseInt(searchParams.get("page")  || "1");
  const limit    = parseInt(searchParams.get("limit") || "50");
  const offset   = (page - 1) * limit;
  const session  = await getSession();
  const isAdmin  = session?.role === "admin";

  const news  = await newsQueries.search({ isAdmin, category, search, limit, offset });
  const total = await newsQueries.count({ isAdmin, category, search });
  return NextResponse.json({ news, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, titleEn, titleAr, excerpt, excerptEn, excerptAr, newsBody, category, image, tags, status } = body;
  if (!title?.trim() || !category)
    return NextResponse.json({ error: "Title and category required" }, { status: 400 });

  const author = await userQueries.findById(session.userId);
  const newItem: DBNews = {
    id:           "news-" + Date.now(),
    title:        title.trim(),
    titleEn:      titleEn   || "",
    titleAr:      titleAr   || "",
    excerpt:      excerpt   || "",
    excerptEn:    excerptEn || "",
    excerptAr:    excerptAr || "",
    body:         newsBody  || "",
    bodyEn:       "",
    bodyAr:       "",
    category,
    image:        image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80",
    author:       author?.name   || "Admin",
    authorId:     session.userId,
    authorAvatar: author?.avatar || "https://i.pravatar.cc/80?img=1",
    status:       status || "published",
    views:        0,
    readingTime:  "۳ دقیقه",
    tags:         tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    createdAt:    new Date().toISOString(),
  };
  await newsQueries.insert(newItem);
  return NextResponse.json({ success: true, news: newItem }, { status: 201 });
}
