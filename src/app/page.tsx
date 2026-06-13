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
import { RssNewsSection } from "@/components/news/RssNewsSection";

export default function HomePage() {
  const { locale } = useApp();
  const t = translations[locale];
  const [news, setNews] = useState<NewsItem[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ n: 0, r: 0, v: 0 });

  useEffect(() => {
    Promise.all([
      fetch("/api/news?limit=50").then((r) => r.json()),
      fetch("/api/admin/pinned").then((r) => r.json()),
    ])
      .then(([nd, pd]) => {
        setNews(nd.news || []);
        setPinned(pd.pinnedIds || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const targets = { n: 1284, r: 48, v: 2400000 };
    const duration = 1600;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCounts({
        n: Math.round(targets.n * e),
        r: Math.round(targets.r * e),
        v: Math.round(targets.v * e),
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    const tm = setTimeout(() => requestAnimationFrame(tick), 300);
    return () => clearTimeout(tm);
  }, []);

  const filtered =
    filter === "all" ? news : news.filter((n) => n.category === filter);

  // hero: اول pinned، سپس بقیه
  const heroList =
    pinned.length > 0
      ? [
          ...(pinned
            .map((id) => news.find((n) => n.id === id))
            .filter(Boolean) as NewsItem[]),
          ...news.filter((n) => !pinned.includes(n.id)),
        ]
      : news;

  const heroMain = heroList[0];
  const heroSide = heroList.slice(1, 4);

  const getLabel = (cat: string) => {
    const m = CATEGORY_META[cat as keyof typeof CATEGORY_META];
    return m ? (m[locale as keyof typeof m] as string) : cat;
  };
  const getBg = (cat: string) =>
    CATEGORY_META[cat as keyof typeof CATEGORY_META]?.bg || "#666";

  return (
    <>
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Breaking badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 animate-fade-up delay-100 border"
          style={{
            background: "rgba(230,57,70,0.1)",
            borderColor: "rgba(230,57,70,0.25)",
            color: "var(--accent)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full blink-dot"
            style={{ background: "var(--accent)" }}
          />
          <span className="text-sm font-bold">{t.home.breaking}</span>
        </div>

        {/* Hero */}
        {!loading && heroMain && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 animate-fade-up delay-200">
            <Link href={`/news/${heroMain.id}`} className="lg:col-span-2">
              <div className="relative rounded-2xl overflow-hidden h-[380px] sm:h-[460px] cursor-pointer group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={heroMain.image}
                  alt={heroMain.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top,rgba(0,0,0,0.95) 0%,rgba(0,0,0,0.4) 55%,transparent 100%)",
                  }}
                />
                <div className="absolute bottom-0 p-6 w-full">
                  <div
                    className="cat-badge mb-3"
                    style={{ background: getBg(heroMain.category) }}
                  >
                    {getLabel(heroMain.category)}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-relaxed mb-3 line-clamp-3">
                    {locale === "en" && heroMain.titleEn
                      ? heroMain.titleEn
                      : locale === "ar" && heroMain.titleAr
                        ? heroMain.titleAr
                        : heroMain.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-white/60 flex-wrap">
                    <span>🕐 {heroMain.createdAt?.slice(0, 10)}</span>
                    <span>✍️ {heroMain.author}</span>
                    <span>👁 {formatNumber(heroMain.views)}</span>
                  </div>
                </div>
              </div>
            </Link>

            <div className="flex flex-col gap-4">
              {heroSide.map((item) => (
                <Link key={item.id} href={`/news/${item.id}`}>
                  <div
                    className="card flex overflow-hidden cursor-pointer transition-all hover:border-[--border2] hover:-translate-x-1 group"
                    style={{
                      border: "1px solid var(--border)",
                      height: "calc((460px - 32px)/3)",
                    }}
                  >
                    <div className="w-28 shrink-0 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div
                          className="text-[10px] font-bold uppercase mb-1"
                          style={{
                            color:
                              CATEGORY_META[
                                item.category as keyof typeof CATEGORY_META
                              ]?.color || "var(--accent)",
                          }}
                        >
                          {getLabel(item.category)}
                        </div>
                        <p
                          className="text-sm font-bold line-clamp-3 leading-relaxed"
                          style={{ color: "var(--text)" }}
                        >
                          {locale === "en" && item.titleEn
                            ? item.titleEn
                            : locale === "ar" && item.titleAr
                              ? item.titleAr
                              : item.title}
                        </p>
                      </div>
                      <div
                        className="text-[11px]"
                        style={{ color: "var(--text3)" }}
                      >
                        {item.createdAt?.slice(0, 10)}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <div className="card grid grid-cols-2 sm:grid-cols-4 gap-0 mb-10 animate-fade-up delay-300 text-center overflow-hidden">
          {[
            { num: formatNumber(counts.n), label: t.home.dailyNews },
            { num: counts.r, label: t.home.activeReporters },
            { num: formatNumber(counts.v), label: t.home.dailyVisits },
            { num: 7, label: t.home.categories },
          ].map((s, i) => (
            <div
              key={i}
              className="py-6 px-4"
              style={{
                borderInlineStart: i > 0 ? "1px solid var(--border)" : "none",
              }}
            >
              <div
                className="text-2xl sm:text-3xl font-black mb-1"
                style={{
                  background: "linear-gradient(135deg,#e63946,#f4a261)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.num}
              </div>
              <div className="text-xs" style={{ color: "var(--text3)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* News Grid — اخبار دیتابیس */}
        <div className="animate-fade-up delay-400">
          <div className="flex items-center justify-between mb-5">
            <div
              className="flex items-center gap-3 text-lg font-black"
              style={{ color: "var(--text)" }}
            >
              <div
                className="w-1 h-6 rounded-full"
                style={{ background: "var(--accent)" }}
              />
              {t.home.latestNews}
            </div>
            <Link
              href="/news"
              className="btn-secondary text-xs py-1.5 px-4 rounded-xl"
            >
              {t.home.viewAll}
            </Link>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(
              [
                "all",
                "tech",
                "economy",
                "sport",
                "world",
                "politics",
                "culture",
              ] as const
            ).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className="px-4 py-2 rounded-full text-xs font-bold transition-all border"
                style={{
                  background: filter === cat ? "var(--accent)" : "var(--card)",
                  color: filter === cat ? "#fff" : "var(--text2)",
                  borderColor:
                    filter === cat ? "var(--accent)" : "var(--border)",
                }}
              >
                {cat === "all"
                  ? t.categories.all
                  : `${CATEGORY_META[cat].icon} ${CATEGORY_META[cat][locale as keyof (typeof CATEGORY_META)[typeof cat]] as string}`}
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
            <div
              className="text-center py-16"
              style={{ color: "var(--text3)" }}
            >
              {t.news.noResults}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.slice(0, 8).map((item) => (
                <div key={item.id} className="group">
                  <NewsCard news={item} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── بخش RSS خبرگزاری‌ها ─── */}
        <RssNewsSection />
      </main>
      <Footer />
    </>
  );
}
