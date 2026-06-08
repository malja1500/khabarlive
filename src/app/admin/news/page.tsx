"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import { NewsItem } from "@/types";
import { CATEGORY_META, formatNumber } from "@/lib/utils";
import { PlusCircle, Eye, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminNewsPage() {
  const { locale } = useApp();
  const t = translations[locale].admin;
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/news?limit=100")
      .then((r) => r.json())
      .then((d) => { setNews(d.news || []); setLoading(false); });
  }, []);

  async function deleteNews(id: string) {
    if (!confirm(locale === "fa" ? "آیا از حذف این خبر مطمئن هستید؟" : "Delete this article?")) return;
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) { setNews((p) => p.filter((n) => n.id !== id)); toast.success(t.newsDeleted); }
  }

  const filtered = search ? news.filter((n) => n.title.toLowerCase().includes(search.toLowerCase())) : news;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>{t.manageNews}</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>{news.length} {locale === "fa" ? "خبر در سیستم" : "articles total"}</p>
        </div>
        <Link href="/admin/news/add" className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2">
          <PlusCircle size={14} />{t.addNews}
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text3)" }} />
        <input className="input-field ps-8 text-sm" placeholder={locale === "fa" ? "جستجو در عنوان..." : "Search title..."} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          {loading ? (
            <div className="p-8 text-center" style={{ color: "var(--text3)" }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{locale === "fa" ? "عنوان" : "Title"}</th>
                  <th>{locale === "fa" ? "دسته" : "Category"}</th>
                  <th>{locale === "fa" ? "نویسنده" : "Author"}</th>
                  <th>{locale === "fa" ? "بازدید" : "Views"}</th>
                  <th>{locale === "fa" ? "تاریخ" : "Date"}</th>
                  <th>{locale === "fa" ? "وضعیت" : "Status"}</th>
                  <th>{locale === "fa" ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n, i) => (
                  <tr key={n.id}>
                    <td className="text-xs" style={{ color: "var(--text3)" }}>{i + 1}</td>
                    <td style={{ maxWidth: 220 }}>
                      <div className="truncate text-sm font-bold" style={{ color: "var(--text)" }}>{n.title}</div>
                    </td>
                    <td>
                      <span className="cat-badge" style={{ background: CATEGORY_META[n.category].bg, color: "#fff", fontSize: 10 }}>
                        {CATEGORY_META[n.category][locale]}
                      </span>
                    </td>
                    <td className="text-xs" style={{ color: "var(--text2)" }}>{n.author}</td>
                    <td className="text-xs" style={{ color: "var(--text2)" }}>{formatNumber(n.views)}</td>
                    <td className="text-xs" style={{ color: "var(--text3)" }}>{n.createdAt?.slice(0, 10)}</td>
                    <td>
                      <span className={`status-badge status-${n.status}`}>
                        {n.status === "published" ? t.published : n.status === "draft" ? t.draft : t.review}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <Link href={`/news/${n.id}`} target="_blank">
                          <button className="text-xs px-2 py-1 rounded border transition-all hover:border-[--blue]" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)" }}>
                            <Eye size={11} />
                          </button>
                        </Link>
                        <button onClick={() => deleteNews(n.id)} className="text-xs px-2 py-1 rounded border transition-all hover:border-[--accent] hover:text-[--accent]" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)" }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-8 text-center" style={{ color: "var(--text3)" }}>
              {locale === "fa" ? "خبری یافت نشد" : "No articles found"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
