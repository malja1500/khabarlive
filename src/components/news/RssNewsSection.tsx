"use client";
import { useEffect, useState, useCallback } from "react";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsItem } from "@/types";
import { useApp } from "@/store";

// تبدیل DBNews به NewsItem برای نمایش
function toNewsItem(raw: any): NewsItem {
  return {
    id:           raw.id,
    title:        raw.title,
    titleEn:      raw.titleEn  || "",
    titleAr:      raw.titleAr  || "",
    excerpt:      raw.excerpt  || "",
    excerptEn:    raw.excerptEn|| "",
    excerptAr:    raw.excerptAr|| "",
    body:         raw.body     || "",
    category:     raw.category || "politics",
    image:        raw.image    || "",
    author:       raw.author   || "",
    authorId:     raw.authorId || "",
    authorAvatar: raw.authorAvatar || "",
    status:       raw.status   || "published",
    views:        raw.views    || 0,
    readingTime:  raw.readingTime || "۲ دقیقه",
    tags:         raw.tags     || [],
    createdAt:    raw.createdAt|| new Date().toISOString(),
  };
}

const SOURCE_LABELS: Record<string, string> = {
  all:  "همه",
  irib: "صدا و سیما",
  yjc:  "باشگاه خبرنگاران",
};

export function RssNewsSection() {
  const { locale } = useApp();
  const [news,      setNews]      = useState<NewsItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [source,    setSource]    = useState<"all"|"irib"|"yjc">("all");
  const [lastFetch, setLastFetch] = useState<string>("");

  const fetchRSS = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/rss-fetch");
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "خطا در دریافت RSS");
      setNews((data.news || []).map(toNewsItem));
      setLastFetch(new Date().toLocaleTimeString("fa-IR"));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // فچ اولیه + رفرش خودکار هر ۵ دقیقه
  useEffect(() => {
    fetchRSS();
    const interval = setInterval(fetchRSS, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRSS]);

  // فیلتر بر اساس منبع
  const filtered = source === "all"
    ? news
    : news.filter((n) =>
        source === "irib"
          ? n.author.includes("صدا و سیما")
          : n.author.includes("باشگاه")
      );

  return (
    <section className="animate-fade-up mt-12">
      {/* هدر بخش */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="text-lg font-black" style={{ color: "var(--text)" }}>
            {locale === "en" ? "Live News Feed" : locale === "ar" ? "تغذية الأخبار المباشرة" : "اخبار زنده خبرگزاری‌ها"}
          </span>
          {/* نشانگر زنده */}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: "rgba(230,57,70,0.12)", color: "var(--accent)" }}>
            <span className="w-1.5 h-1.5 rounded-full blink-dot" style={{ background: "var(--accent)" }} />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className="text-xs" style={{ color: "var(--text3)" }}>
              آخرین بروزرسانی: {lastFetch}
            </span>
          )}
          <button onClick={fetchRSS} disabled={loading}
            className="btn-secondary text-xs py-1.5 px-3 rounded-xl flex items-center gap-1"
            title="بروزرسانی">
            <span className={loading ? "animate-spin inline-block" : ""}>🔄</span>
          </button>
        </div>
      </div>

      {/* فیلتر منبع */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(["all", "irib", "yjc"] as const).map((s) => (
          <button key={s} onClick={() => setSource(s)}
            className="px-4 py-2 rounded-full text-xs font-bold transition-all border"
            style={{
              background:   source === s ? "var(--accent)" : "var(--card)",
              color:        source === s ? "#fff" : "var(--text2)",
              borderColor:  source === s ? "var(--accent)" : "var(--border)",
            }}>
            {SOURCE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* محتوا */}
      {error ? (
        <div className="text-center py-10 rounded-2xl border"
          style={{ borderColor: "var(--border)", color: "var(--text3)" }}>
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-sm">{error}</p>
          <button onClick={fetchRSS} className="btn-secondary mt-4 text-xs px-4 py-2 rounded-xl">
            تلاش مجدد
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card h-72 shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10" style={{ color: "var(--text3)" }}>
          خبری یافت نشد
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.slice(0, 12).map((item) => (
            <div key={item.id} className="group">
              <NewsCard news={item} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
