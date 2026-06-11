/**
 * /api/admin/reset-db
 * پاک کردن db.json و seed دوباره — فقط برای رفع مشکل hash قدیمی
 * بعد از اینکه مشکل حل شد می‌تونی این فایل رو پاک کنی
 */
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "data", "db.json");

export async function GET() {
  try {
    // پاک کردن db.json
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }

    // ایمپورت database تا seed دوباره اجرا بشه
    // چون فایل پاک شد، بار بعدی که database لود بشه seed می‌کنه
    // ولی چون module cache هست باید مستقیم seed کنیم

    const DATA_DIR = path.join(process.cwd(), "data");
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    function h(plain: string): string {
      return "hashed_" + Buffer.from(plain, "utf8").toString("base64");
    }

    const freshDB = {
      seeded: true,
      users: [
        {
          id: "admin-1", name: "علی رضایی", email: "admin@khabarlive.ir",
          password: h("Admin@1234"), role: "admin",
          avatar: "https://i.pravatar.cc/80?img=3",
          isActive: true, newsCount: 142, createdAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "user-1", name: "سارا احمدی", email: "sara@example.com",
          password: h("password"), role: "user",
          avatar: "https://i.pravatar.cc/80?img=5",
          isActive: true, newsCount: 0, createdAt: "2024-02-15T00:00:00Z",
        },
        {
          id: "user-2", name: "رضا ملکی", email: "reza@example.com",
          password: h("password"), role: "user",
          avatar: "https://i.pravatar.cc/80?img=8",
          isActive: true, newsCount: 0, createdAt: "2024-03-10T00:00:00Z",
        },
      ],
      news: [],
      comments: [],
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(freshDB, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "دیتابیس ریست شد. الان می‌تونی با admin@khabarlive.ir / Admin@1234 لاگین کنی.",
      adminHash: h("Admin@1234"),
      testDecode: Buffer.from(h("Admin@1234").slice(7), "base64").toString("utf8"),
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
