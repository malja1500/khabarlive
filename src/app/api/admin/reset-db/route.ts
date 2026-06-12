import { NextResponse } from "next/server";

export async function GET() {
  try {
    const USE_MONGO = !!process.env.MONGODB_URI;

    if (USE_MONGO) {
      const { connectDB } = await import("@/lib/mongodb");
      const { UserModel, NewsModel, CommentModel, CategoryModel, ConfigModel } = await import("@/lib/models");
      await connectDB();
      await Promise.all([
        UserModel.deleteMany({}),
        NewsModel.deleteMany({}),
        CommentModel.deleteMany({}),
        CategoryModel.deleteMany({}),
        ConfigModel.deleteMany({}),
      ]);
      // Re-seed by calling database which seeds on empty
      const { userQueries } = await import("@/lib/database");
      await userQueries.getAll(); // triggers seed
    } else {
      const fs   = require("fs");
      const path = require("path");
      const DB_FILE = path.join(process.cwd(), "data", "db.json");
      if (fs.existsSync(DB_FILE)) fs.unlinkSync(DB_FILE);
    }

    return NextResponse.json({
      success: true,
      message: "DB reset. Login: admin@khabarlive.ir / Admin@1234",
      mode: USE_MONGO ? "mongodb" : "json-file",
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
