"use client";
import { useApp } from "@/store";
import { CATEGORY_META } from "@/lib/utils";
import { Category } from "@/types";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const { locale } = useApp();
  const cats = Object.entries(CATEGORY_META) as [Category, typeof CATEGORY_META[Category]][];

  const counts: Record<Category, number> = {
    tech: 320, economy: 280, sport: 210, world: 185, politics: 160, culture: 129,
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>
          {locale === "fa" ? "دسته‌بندی‌ها" : locale === "ar" ? "التصنيفات" : "Categories"}
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>
          {cats.length} {locale === "fa" ? "دسته‌بندی فعال" : "active categories"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(([key, meta]) => (
          <div key={key} className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${meta.color}20` }}>
              {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm mb-1" style={{ color: "var(--text)" }}>{meta[locale]}</div>
              <div className="text-xs" style={{ color: "var(--text3)" }}>
                {counts[key]} {locale === "fa" ? "خبر" : locale === "ar" ? "خبر" : "articles"}
              </div>
              <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
                <div className="h-full rounded-full" style={{ width: `${(counts[key] / 320) * 100}%`, background: meta.color }} />
              </div>
            </div>
            <span className="status-badge status-published text-[10px] shrink-0">
              {locale === "fa" ? "فعال" : "Active"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
