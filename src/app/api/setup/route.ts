/**
 * /api/setup — یک‌بار اجرا می‌شه و دیتابیس رو راه‌اندازی می‌کنه
 * بعد از اجرای موفق، این فایل رو از پروژه حذف کن
 */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { UserModel, NewsModel, CategoryModel, ConfigModel, CommentModel } from "@/lib/models";

function makeHash(plain: string): string {
  return "hashed_" + Buffer.from(plain, "utf8").toString("base64");
}

export async function GET() {
  try {
    await connectDB();

    const report: Record<string, string> = {};

    // ─── ۱. ادمین ───────────────────────────────────────────────
    const existingAdmin = await UserModel.findOne({ role: "admin" });
    if (existingAdmin) {
      // ادمین وجود داره — فقط ایمیل و رمز رو آپدیت کن
      await UserModel.updateOne(
        { role: "admin" },
        {
          $set: {
            email:    "dnote6443@gmail.com",
            password: makeHash("farfar12"),
            isActive: true,
          },
        }
      );
      report.admin = "✅ ادمین موجود بود — ایمیل و رمز آپدیت شد";
    } else {
      // ادمین وجود نداره — بساز
      await UserModel.create({
        id:        "admin-1",
        name:      "مدیر سایت",
        email:     "dnote6443@gmail.com",
        password:  makeHash("farfar12"),
        role:      "admin",
        avatar:    "https://i.pravatar.cc/80?img=3",
        isActive:  true,
        newsCount: 0,
        createdAt: new Date().toISOString(),
      });
      report.admin = "✅ ادمین جدید ساخته شد";
    }

    // ─── ۲. دسته‌بندی‌ها ────────────────────────────────────────
    const catCount = await CategoryModel.countDocuments();
    if (catCount === 0) {
      await CategoryModel.insertMany([
        { id:"cat-1", key:"tech",     labelFa:"فناوری",  labelEn:"Technology", labelAr:"التكنولوجيا", icon:"💻", color:"#457b9d", bg:"rgba(69,123,157,0.85)",  isActive:true, createdAt:"2024-01-01T00:00:00Z" },
        { id:"cat-2", key:"economy",  labelFa:"اقتصاد",  labelEn:"Economy",    labelAr:"الاقتصاد",    icon:"📈", color:"#f4a261", bg:"rgba(244,162,97,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
        { id:"cat-3", key:"sport",    labelFa:"ورزش",    labelEn:"Sports",     labelAr:"الرياضة",     icon:"⚽", color:"#2d9a6b", bg:"rgba(45,154,107,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
        { id:"cat-4", key:"world",    labelFa:"جهان",    labelEn:"World",      labelAr:"العالم",      icon:"🌍", color:"#7c3aed", bg:"rgba(124,58,237,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
        { id:"cat-5", key:"politics", labelFa:"سیاسی",   labelEn:"Politics",   labelAr:"السياسة",     icon:"🏛", color:"#ea580c", bg:"rgba(234,88,12,0.85)",  isActive:true, createdAt:"2024-01-01T00:00:00Z" },
        { id:"cat-6", key:"culture",  labelFa:"فرهنگ",   labelEn:"Culture",    labelAr:"الثقافة",     icon:"🎨", color:"#db2777", bg:"rgba(219,39,119,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
      ]);
      report.categories = "✅ ۶ دسته‌بندی ساخته شد";
    } else {
      report.categories = `⏭ دسته‌بندی‌ها قبلاً موجود بود (${catCount} عدد)`;
    }

    // ─── ۳. تنظیمات pinned ──────────────────────────────────────
    const pinnedDoc = await ConfigModel.findOne({ key: "pinnedIds" });
    if (!pinnedDoc) {
      await ConfigModel.create({ key: "pinnedIds", value: JSON.stringify([]) });
      report.config = "✅ تنظیمات اولیه ساخته شد";
    } else {
      report.config = "⏭ تنظیمات قبلاً موجود بود";
    }

    // ─── ۴. گزارش وضعیت collection ها ─────────────────────────
    report.counts = JSON.stringify({
      users:      await UserModel.countDocuments(),
      news:       await NewsModel.countDocuments(),
      comments:   await CommentModel.countDocuments(),
      categories: await CategoryModel.countDocuments(),
    });

    return NextResponse.json({
      success: true,
      message: "✅ دیتابیس با موفقیت راه‌اندازی شد",
      report,
      loginInfo: {
        email:    "dnote6443@gmail.com",
        password: "farfar12",
        role:     "admin",
      },
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error:   err.message,
      hint:    "مطمئن شو MONGODB_URI در Vercel تنظیم شده",
    }, { status: 500 });
  }
}
