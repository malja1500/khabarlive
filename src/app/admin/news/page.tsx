"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import { NewsItem } from "@/types";
import { CATEGORY_META, formatNumber } from "@/lib/utils";
import { PlusCircle, Eye, Trash2, Pencil, Search, Pin } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminNewsPage() {
  const { locale } = useApp();
  const t = translations[locale].admin;
  const [news, setNews]   = useState<NewsItem[]>([]);
  const [pinned, setPinned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/news?limit=100").then(r=>r.json()),
      fetch("/api/admin/pinned").then(r=>r.json()),
    ]).then(([nd, pd]) => {
      setNews(nd.news || []);
      setPinned(pd.pinnedIds || []);
      setLoading(false);
    });
  }, []);

  async function deleteNews(id: string) {
    if (!confirm(locale==="fa"?"آیا از حذف این خبر مطمئن هستید؟":"Delete this article?")) return;
    const res = await fetch(`/api/news/${id}`, { method:"DELETE" });
    if (res.ok) { setNews(p=>p.filter(n=>n.id!==id)); toast.success(t.newsDeleted); }
  }

  async function togglePin(id: string) {
    const action = pinned.includes(id) ? "remove" : "add";
    if (action==="add" && pinned.length>=4) { toast.error(locale==="fa"?"حداکثر ۴ خبر پین می‌شود":"Max 4 pinned"); return; }
    const res = await fetch("/api/admin/pinned",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,id})});
    if (res.ok) { const d=await res.json(); setPinned(d.pinnedIds); toast.success(action==="add"?"📌 پین شد":"پین برداشته شد"); }
  }

  const filtered = search ? news.filter(n=>n.title.toLowerCase().includes(search.toLowerCase())) : news;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black" style={{ color:"var(--text)" }}>{t.manageNews}</h1>
          <p className="text-xs mt-1" style={{ color:"var(--text3)" }}>{news.length} {locale==="fa"?"خبر در سیستم":"articles total"}</p>
        </div>
        <Link href="/admin/news/add" className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2">
          <PlusCircle size={14}/>{t.addNews}
        </Link>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{ color:"var(--text3)" }}/>
        <input className="input-field ps-8 text-sm" placeholder={locale==="fa"?"جستجو در عنوان...":"Search title..."} value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          {loading ? (
            <div className="p-8 text-center" style={{ color:"var(--text3)" }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{locale==="fa"?"عنوان":"Title"}</th>
                  <th>{locale==="fa"?"دسته":"Cat"}</th>
                  <th>{locale==="fa"?"نویسنده":"Author"}</th>
                  <th>{locale==="fa"?"بازدید":"Views"}</th>
                  <th>{locale==="fa"?"تاریخ":"Date"}</th>
                  <th>{locale==="fa"?"وضعیت":"Status"}</th>
                  <th>{locale==="fa"?"عملیات":"Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n, i) => {
                  const cat = CATEGORY_META[n.category as keyof typeof CATEGORY_META];
                  const isPinned = pinned.includes(n.id);
                  return (
                    <tr key={n.id} style={{ background:isPinned?"rgba(230,57,70,0.04)":"" }}>
                      <td className="text-xs" style={{ color:"var(--text3)" }}>{i+1}</td>
                      <td style={{ maxWidth:220 }}>
                        <div className="flex items-center gap-1.5">
                          {isPinned && <Pin size={10} style={{ color:"var(--accent)", flexShrink:0 }}/>}
                          <div className="truncate text-sm font-bold" style={{ color:"var(--text)" }}>{n.title}</div>
                        </div>
                      </td>
                      <td>
                        {cat && <span className="cat-badge text-white" style={{ background:cat.bg, fontSize:10 }}>{cat.icon} {cat[locale as keyof typeof cat] as string}</span>}
                      </td>
                      <td className="text-xs" style={{ color:"var(--text2)" }}>{n.author}</td>
                      <td className="text-xs" style={{ color:"var(--text2)" }}>{formatNumber(n.views)}</td>
                      <td className="text-xs" style={{ color:"var(--text3)" }}>{n.createdAt?.slice(0,10)}</td>
                      <td>
                        <span className={`status-badge status-${n.status}`}>
                          {n.status==="published"?t.published:n.status==="draft"?t.draft:t.review}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1.5">
                          {/* مشاهده */}
                          <Link href={`/news/${n.id}`} target="_blank">
                            <button className="w-7 h-7 rounded border flex items-center justify-center transition-all hover:border-[--blue]" style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text2)" }} title={t.view}>
                              <Eye size={11}/>
                            </button>
                          </Link>
                          {/* ویرایش */}
                          <Link href={`/admin/news/edit/${n.id}`}>
                            <button className="w-7 h-7 rounded border flex items-center justify-center transition-all hover:border-[--gold]" style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text2)" }} title={t.edit}>
                              <Pencil size={11}/>
                            </button>
                          </Link>
                          {/* پین */}
                          <button onClick={() => togglePin(n.id)} className="w-7 h-7 rounded border flex items-center justify-center transition-all" style={{ background:isPinned?"rgba(230,57,70,0.1)":"var(--bg3)", border:`1px solid ${isPinned?"var(--accent)":"var(--border)"}`, color:isPinned?"var(--accent)":"var(--text2)" }} title={isPinned?"Unpin":"Pin"}>
                            <Pin size={11}/>
                          </button>
                          {/* حذف */}
                          <button onClick={() => deleteNews(n.id)} className="w-7 h-7 rounded border flex items-center justify-center transition-all hover:border-[--accent] hover:text-[--accent]" style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text2)" }} title={t.delete}>
                            <Trash2 size={11}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length===0 && (
            <div className="p-8 text-center" style={{ color:"var(--text3)" }}>{locale==="fa"?"خبری یافت نشد":"No articles found"}</div>
          )}
        </div>
      </div>
    </div>
  );
}
