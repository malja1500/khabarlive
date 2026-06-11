import { NextRequest, NextResponse } from "next/server";
import { categoryQueries, DBCategory } from "@/lib/database";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ categories: categoryQueries.getAll() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { key, labelFa, labelEn, labelAr, icon, color, bg } = body;
  if (!key || !labelFa) return NextResponse.json({ error: "key and labelFa required" }, { status: 400 });
  if (categoryQueries.findByKey(key)) return NextResponse.json({ error: "key_exists" }, { status: 409 });
  const cat: DBCategory = {
    id: "cat-" + Date.now(), key, labelFa, labelEn: labelEn||key, labelAr: labelAr||key,
    icon: icon||"📰", color: color||"#666", bg: bg||"rgba(102,102,102,0.85)",
    isActive: true, createdAt: new Date().toISOString(),
  };
  categoryQueries.insert(cat);
  return NextResponse.json({ success: true, category: cat }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, ...updates } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  categoryQueries.update(id, updates);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  const builtIn = ["cat-1","cat-2","cat-3","cat-4","cat-5","cat-6"];
  if (builtIn.includes(id)) return NextResponse.json({ error: "Cannot delete built-in category" }, { status: 400 });
  categoryQueries.delete(id);
  return NextResponse.json({ success: true });
}
