"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import { NewsItem, Category } from "@/types";
import { NewsCard } from "@/components/news/NewsCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CATEGORY_META, formatNumber } from "@/lib/utils";

export default function HomePage() {
  const { locale } = useApp();
  const t = translations[locale];
  const [news, setNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ n: 0, r: 0, v: 0 });

  useEffect(() => {
    fetch("/api/news")
      .then((r) => r.json())
      .then((d) => { setNews(d.news || []); setLoading(false); });
  }, []);

  // Animate counters
  useEffect(() => {
    const targets = { n: 1284, r: 48, v: 2400000 };
    const duration = 1600;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCounts({
        n: Math.round(targets.n * ease),
        r: Math.round(targets.r * ease),
        v: Math.round(targets.v * ease),
      });
      if (progress < 1) requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => requestAnimationFrame(tick), 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = filter === "all" ? news : news.filter((n) => n.category === filter);
  const heroNews = news[0];
  const sideNews = news.slice(1, 4);

  return (
    <>
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Breaking badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-up delay-100 border" style={{ background: "rgba(230,57,70,0.1)", borderColor: "rgba(230,57,70,0.25)", color: "var(--accent)" }}>
          <span className="w-2 h-2 rounded-full blink-dot" style={{ background: "var(--accent)" }} />
          <span className="text-sm font-bold">{t.home.breaking}</span>
        </div>

        {/* Hero Section */}
        {!loading && heroNews && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 animate-fade-up delay-200">
            {/* Main hero */}
            <Link href={`/news/${heroNews.id}`} className="lg:col-span-2">
              <div className="relative rounded-2xl overflow-hidden h-[400px] sm:h-[460px] cursor-pointer group">
                <img src={heroNews.image} alt={heroNews.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.4) 55%,transparent 100%)" }} />
                <div className="absolute bottom-0 p-6 w-full">
                  <div className="cat-badge mb-3" style={{ background: CATEGORY_META[heroNews.category].bg }}>
                    {CATEGORY_META[heroNews.category][locale]}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed mb-3 line-clamp-3">
                    {locale === "en" && heroNews.titleEn ? heroNews.titleEn : locale === "ar" && heroNews.titleAr ? heroNews.titleAr : heroNews.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-white/60 flex-wrap">
                    <span>🕐 {heroNews.createdAt?.slice(0,10)}</span>
                    <span>✍️ {heroNews.author}</span>
                    <span>👁 {formatNumber(heroNews.views)}</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Side news */}
            <div className="flex flex-col gap-4">
              {sideNews.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`}>
                  <div className="card flex overflow-hidden h-[134px] cursor-pointer transition-all hover:border-[--border2] hover:-translate-x-1 group" style={{ border: "1px solid var(--border)" }}>
                    <div className="w-28 shrink-0 overflow-hidden">
                      <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="text-[10px] font-bold uppercase mb-1" style={{ color: CATEGORY_META[item.category].color }}>
                          {CATEGORY_META[item.category][locale]}
                        </div>
                        <p className="text-sm font-bold line-clamp-3 leading-relaxed" style={{ color: "var(--text)" }}>
                          {locale === "en" && item.titleEn ? item.titleEn : locale === "ar" && item.titleAr ? item.titleAr : item.title}
                        </p>
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--text3)" }}>{item.createdAt?.slice(0,10)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Stats Bar */}
        <div className="card grid grid-cols-2 sm:grid-cols-4 gap-0 mb-10 animate-fade-up delay-300 text-center overflow-hidden">
          {[
            { num: formatNumber(counts.n), label: t.home.dailyNews },
            { num: counts.r, label: t.home.activeReporters },
            { num: formatNumber(counts.v), label: t.home.dailyVisits },
            { num: 7, label: t.home.categories },
          ].map((s, i) => (
            <div key={i} className="py-6 px-4 relative" style={{ borderInlineStart: i > 0 ? "1px solid var(--border)" : "none" }}>
              <div className="text-2xl sm:text-3xl font-black mb-1" style={{ background: "linear-gradient(135deg,#e63946,#f4a261)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {s.num}
              </div>
              <div className="text-xs" style={{ color: "var(--text3)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* News Grid */}
        <div className="animate-fade-up delay-400">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3 text-lg font-black" style={{ color: "var(--text)" }}>
              <div className="w-1 h-6 rounded-full" style={{ background: "var(--accent)" }} />
              {t.home.latestNews}
            </div>
            <Link href="/news" className="btn-secondary text-xs py-1.5 px-4 rounded-xl">
              {t.home.viewAll}
            </Link>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(["all", "tech", "economy", "sport", "world", "politics", "culture"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all border"
                style={{
                  background: filter === cat ? "var(--accent)" : "var(--card)",
                  color: filter === cat ? "#fff" : "var(--text2)",
                  borderColor: filter === cat ? "var(--accent)" : "var(--border)",
                }}
              >
                {cat === "all" ? t.categories.all : `${CATEGORY_META[cat].icon} ${CATEGORY_META[cat][locale]}`}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="card h-72 shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16" style={{ color: "var(--text3)" }}>
              {t.news.noResults}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 group">
              {filtered.slice(0, 8).map((item) => (
                <div key={item.id} className="group">
                  <NewsCard news={item} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
