import { NextRequest, NextResponse } from "next/server";
import { commentQueries, userQueries, DBComment, DBUser } from "@/lib/database";
import { getSession } from "@/lib/auth";

function rowToComment(c: DBComment) {
  return {
    id:          c.id,
    newsId:      c.news_id,
    newsTitle:   c.news_title   ?? "",
    userId:      c.user_id,
    userName:    c.user_name,
    userAvatar:  c.user_avatar  ?? undefined,
    text:        c.text,
    status:      c.status,
    createdAt:   c.created_at,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const newsId  = searchParams.get("newsId");
  const session = await getSession();

  let rows: DBComment[];

  if (session?.role === "admin") {
    // Admin sees all comments
    rows = (newsId
      ? commentQueries.getByNews.all(newsId)
      : commentQueries.getAll.all()) as DBComment[];
  } else {
    // Public sees only approved comments for a specific news
    rows = newsId
      ? (commentQueries.getApproved.all(newsId) as DBComment[])
      : [];
  }

  return NextResponse.json({ comments: rows.map(rowToComment) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { newsId, newsTitle, text } = await req.json();
  if (!text?.trim() || !newsId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const user = userQueries.findById.get(session.userId) as DBUser | undefined;

  const comment = {
    id:          "c-" + Date.now(),
    news_id:     newsId,
    news_title:  newsTitle || null,
    user_id:     session.userId,
    user_name:   user?.name   || "کاربر",
    user_avatar: user?.avatar || null,
    text:        text.trim(),
    status:      "pending",
    created_at:  new Date().toISOString(),
  };

  commentQueries.insert.run(comment);

  return NextResponse.json({ success: true, comment: rowToComment(comment as any) }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id || !status) {
    return NextResponse.json({ error: "id and status required" }, { status: 400 });
  }

  commentQueries.updateStatus.run(status, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  commentQueries.delete.run(id);
  return NextResponse.json({ success: true });
}
