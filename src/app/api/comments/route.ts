import { NextRequest, NextResponse } from "next/server";
import { commentQueries, userQueries, DBComment } from "@/lib/database";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const newsId  = searchParams.get("newsId");
  const session = await getSession();

  let comments: DBComment[];
  if (session?.role === "admin") {
    comments = newsId ? commentQueries.getByNews(newsId) : commentQueries.getAll();
  } else {
    comments = newsId ? commentQueries.getApproved(newsId) : [];
  }
  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login required" }, { status: 401 });

  const { newsId, newsTitle, text } = await req.json();
  if (!text?.trim() || !newsId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = userQueries.findById(session.userId);
  const comment: DBComment = {
    id:         "c-" + Date.now(),
    newsId,
    newsTitle:  newsTitle || "",
    userId:     session.userId,
    userName:   user?.name   || "کاربر",
    userAvatar: user?.avatar || "",
    text:       text.trim(),
    status:     "pending",
    createdAt:  new Date().toISOString(),
  };

  commentQueries.insert(comment);
  return NextResponse.json({ success: true, comment }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, status } = await req.json();
  commentQueries.updateStatus(id, status);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  commentQueries.delete(id);
  return NextResponse.json({ success: true });
}
