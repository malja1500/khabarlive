"use client";
import { useApp } from "@/store";
import { CATEGORY_META } from "@/lib/utils";
import { Category } from "@/types";

export default function AdminAnalyticsPage() {
  const { locale } = useApp();

  const catStats: { cat: Category; pct: number; views: string }[] = [
    { cat: "sport",    pct: 85, views: "45.1K" },
    { cat: "tech",     pct: 72, views: "41.3K" },
    { cat: "economy",  pct: 58, views: "18K" },
    { cat: "world",    pct: 45, views: "18.2K" },
    { cat: "politics", pct: 38, views: "4.1K" },
    { cat: "culture",  pct: 30, views: "18.3K" },
  ];

  const weekData = [
    { day: "شنبه/Sat",  v: "1.8M", h: 60 },
    { day: "یک/Sun",   v: "1.3M", h: 45 },
    { day: "دو/Mon",   v: "2.3M", h: 78 },
    { day: "سه/Tue",   v: "1.6M", h: 55 },
    { day: "چهار/Wed", v: "2.7M", h: 92 },
    { day: "پنج/Thu",  v: "2.1M", h: 70 },
    { day: "جمعه/Fri", v: "2.6M", h: 88 },
  ];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>
          {locale === "fa" ? "آمار و تحلیل" : locale === "ar" ? "الإحصاءات" : "Analytics"}
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>
          {locale === "fa" ? "گزارش عملکرد سایت در هفته اخیر" : "Site performance report for last week"}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: locale === "fa" ? "بازدید روزانه" : "Daily Visits", val: "2.4M", change: "+8%", color: "var(--accent)" },
          { label: locale === "fa" ? "نرخ پرش" : "Bounce Rate", val: "32%", change: "-5% ✓", color: "var(--blue)" },
          { label: locale === "fa" ? "میانگین مطالعه" : "Avg. Read Time", val: "4.2m", change: "+0.3m", color: "var(--green)" },
          { label: locale === "fa" ? "رضایت کاربران" : "Satisfaction", val: "87%", change: "+3%", color: "var(--gold)" },
        ].map((s, i) => (
          <div key={i} className="card2 p-5">
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs mb-2" style={{ color: "var(--text3)" }}>{s.label}</div>
            <div className="text-[11px] font-semibold" style={{ color: "var(--green)" }}>{s.change}</div>
          </div>
        ))}
      </div>

      {/* Weekly chart */}
      <div className="card p-5 mb-5">
        <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text)" }}>
          📈 {locale === "fa" ? "بازدید هفته اخیر" : "Weekly Traffic"}
        </h4>
        <div className="flex items-end gap-3 h-40 mb-2">
          {weekData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[10px]" style={{ color: "var(--text3)" }}>{d.v}</span>
              <div className="w-full rounded-t transition-all duration-700 cursor-pointer hover:opacity-80" style={{ height: `${d.h}%`, background: "linear-gradient(to top,var(--accent),rgba(230,57,70,0.25))", minHeight: 6 }} />
              <span className="text-[10px]" style={{ color: "var(--text3)" }}>{d.day.split("/")[locale === "en" ? 1 : 0]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card p-5">
        <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text)" }}>
          🔥 {locale === "fa" ? "پربازدیدترین دسته‌بندی‌ها" : "Top Categories"}
        </h4>
        <div className="space-y-4">
          {catStats.map(({ cat, pct, views }) => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium flex items-center gap-2" style={{ color: "var(--text)" }}>
                    {meta.icon} {meta[locale]}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text3)" }}>{views} — {pct}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--bg3)" }}>
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: meta.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
