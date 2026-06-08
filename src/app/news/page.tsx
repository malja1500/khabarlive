"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import { NewsItem, Category } from "@/types";
import { NewsCard } from "@/components/news/NewsCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CATEGORY_META } from "@/lib/utils";

function NewsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useApp();
  const t = translations[locale];

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">((searchParams.get("category") as Category) || "all");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (search) params.set("search", search);
    params.set("limit", "50");
    fetch(`/api/news?${params}`)
      .then((r) => r.json())
      .then((d) => { setNews(d.news || []); setTotal(d.total || 0); setLoading(false); });
  }, [category, search]);

  const cats: { key: Category | "all"; label: string }[] = [
    { key: "all", label: t.categories.all },
    { key: "tech", label: `${CATEGORY_META.tech.icon} ${t.categories.tech}` },
    { key: "economy", label: `${CATEGORY_META.economy.icon} ${t.categories.economy}` },
    { key: "sport", label: `${CATEGORY_META.sport.icon} ${t.categories.sport}` },
    { key: "world", label: `${CATEGORY_META.world.icon} ${t.categories.world}` },
    { key: "politics", label: `${CATEGORY_META.politics.icon} ${t.categories.politics}` },
    { key: "culture", label: `${CATEGORY_META.culture.icon} ${t.categories.culture}` },
  ];

  return (
    <>
      <Navbar />
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-8 animate-fade-up delay-100">
          <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ color: "var(--text)" }}>
            {category === "all" ? t.home.latestNews : cats.find((c) => c.key === category)?.label}
          </h1>
          <p className="text-sm" style={{ color: "var(--text3)" }}>
            {total} {locale === "fa" ? "خبر یافت شد" : locale === "ar" ? "خبر تم العثور عليه" : "articles found"}
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 animate-fade-up delay-200">
          <div className="relative flex-1">
            <Search size={15} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text3)" }} />
            <input
              className="input-field ps-9"
              placeholder={t.news.search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="absolute end-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text3)" }} onClick={() => setSearch("")}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Category filter pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 animate-fade-up delay-200 no-scrollbar">
          {cats.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border shrink-0"
              style={{
                background: category === c.key ? "var(--accent)" : "var(--card)",
                color: category === c.key ? "#fff" : "var(--text2)",
                borderColor: category === c.key ? "var(--accent)" : "var(--border)",
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="card h-72 shimmer" />)}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-bold mb-2" style={{ color: "var(--text)" }}>{t.news.noResults}</p>
            <p className="text-sm" style={{ color: "var(--text3)" }}>{locale === "fa" ? "کلمه دیگری را جستجو کنید" : "Try a different search term"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-fade-up delay-300">
            {news.map((item) => (
              <div key={item.id} className="group">
                <NewsCard news={item} />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ color: "var(--text3)" }}>Loading...</div>}>
      <NewsListContent />
    </Suspense>
  );
}
