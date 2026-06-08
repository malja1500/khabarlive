import { NextRequest, NextResponse } from "next/server";
import { NEWS_DB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Category, NewsStatus } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as Category | null;
  const status = searchParams.get("status") as NewsStatus | null;
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  let results = [...NEWS_DB];

  if (category && category !== "all") results = results.filter((n) => n.category === category);
  if (status) results = results.filter((n) => n.status === status);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Public: only published
  const session = await getSession();
  if (!session || session.role !== "admin") {
    results = results.filter((n) => n.status === "published");
  }

  const total = results.length;
  const paginated = results.slice((page - 1) * limit, page * limit);

  return NextResponse.json({ news: paginated, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, excerpt, newsBody, category, image, tags, status, titleEn, titleAr, excerptEn, excerptAr } = body;

  if (!title || !category) {
    return NextResponse.json({ error: "Title and category required" }, { status: 400 });
  }

  const { USERS_DB } = await import("@/lib/db");
  const author = USERS_DB.find((u) => u.id === session.userId);

  const newItem = {
    id: "news-" + Date.now(),
    title,
    titleEn: titleEn || "",
    titleAr: titleAr || "",
    excerpt: excerpt || "",
    excerptEn: excerptEn || "",
    excerptAr: excerptAr || "",
    body: newsBody || "",
    bodyEn: "",
    bodyAr: "",
    category,
    image: image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80",
    author: author?.name || "Admin",
    authorId: session.userId,
    authorAvatar: author?.avatar || "https://i.pravatar.cc/80?img=1",
    status: status || "published",
    views: 0,
    createdAt: new Date().toISOString(),
    tags: tags ? tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [],
    readingTime: "۳ دقیقه",
  };

  NEWS_DB.unshift(newItem);
  return NextResponse.json({ success: true, news: newItem }, { status: 201 });
}
