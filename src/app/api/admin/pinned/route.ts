import { NextRequest, NextResponse } from "next/server";
import { pinnedQueries } from "@/lib/database";
import { getSession } from "@/lib/auth";

export async function GET() {
  return NextResponse.json({ pinnedIds: await pinnedQueries.getAll() });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { action, id, ids } = await req.json();
  if      (action === "set"    && ids) await pinnedQueries.set(ids);
  else if (action === "add"    && id)  await pinnedQueries.add(id);
  else if (action === "remove" && id)  await pinnedQueries.remove(id);
  else return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  return NextResponse.json({ success: true, pinnedIds: await pinnedQueries.getAll() });
}
