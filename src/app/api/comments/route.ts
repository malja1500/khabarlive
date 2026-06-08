import { NextRequest, NextResponse } from "next/server";
import { COMMENTS_DB } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Comment } from "@/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const newsId = searchParams.get("newsId");
  const session = await getSession();

  let results = [...COMMENTS_DB];
  if (newsId) results = results.filter((c) => c.newsId === newsId);

  // Public only sees approved comments
  if (!session || session.role !== "admin") {
    results = results.filter((c) => c.status === "approved");
  }

  return NextResponse.json({ comments: results });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { newsId, newsTitle, text } = await req.json();
  if (!text?.trim() || !newsId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { USERS_DB } = await import("@/lib/db");
  const user = USERS_DB.find((u) => u.id === session.userId);

  const comment: Comment = {
    id: "c-" + Date.now(),
    newsId,
    newsTitle: newsTitle || "",
    userId: session.userId,
    userName: user?.name || "کاربر",
    userAvatar: user?.avatar,
    text: text.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  COMMENTS_DB.unshift(comment);
  return NextResponse.json({ success: true, comment }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  const idx = COMMENTS_DB.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  COMMENTS_DB[idx].status = status;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  const idx = COMMENTS_DB.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  COMMENTS_DB.splice(idx, 1);
  return NextResponse.json({ success: true });
}
