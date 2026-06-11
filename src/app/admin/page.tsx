"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import { NewsItem, User, Comment } from "@/types";
import { formatNumber, formatDate, CATEGORY_META } from "@/lib/utils";
import { PlusCircle, Eye, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const { locale } = useApp();
  const t = translations[locale].admin;
  const [news, setNews] = useState<NewsItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [counts, setCounts] = useState({ n: 0, r: 0, v: 0, s: 0 });
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/news?limit=50").then((r) => r.json()).then((d) => setNews(d.news || []));
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers(d.users || []));
    fetch("/api/comments").then((r) => r.json()).then((d) => setComments(d.comments || []));
  }, []);

  useEffect(() => {
    const targets = { n: 1284, r: 48, v: 2400000, s: 12400 };
    const duration = 1400;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setCounts({ n: Math.round(targets.n * e), r: Math.round(targets.r * e), v: Math.round(targets.v * e), s: Math.round(targets.s * e) });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  async function deleteNews(id: string) {
    if (!confirm(locale === "fa" ? "آیا مطمئن هستید؟" : "Are you sure?")) return;
    const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
    if (res.ok) { setNews((p) => p.filter((n) => n.id !== id)); toast.success(t.newsDeleted); }
  }

  const chartData = [
    { day: locale === "fa" ? "شنبه" : "Sat", h: 60 },
    { day: locale === "fa" ? "یک" : "Sun", h: 45 },
    { day: locale === "fa" ? "دو" : "Mon", h: 78 },
    { day: locale === "fa" ? "سه" : "Tue", h: 55 },
    { day: locale === "fa" ? "چهار" : "Wed", h: 92 },
    { day: locale === "fa" ? "پنج" : "Thu", h: 70 },
    { day: locale === "fa" ? "جمعه" : "Fri", h: 88 },
  ];

  const statCards = [
    { num: formatNumber(counts.n), label: t.totalNews, color: "var(--accent)" },
    { num: counts.r, label: t.activeReporters, color: "var(--blue)" },
    { num: formatNumber(counts.v), label: t.dailyVisits, color: "var(--green)" },
    { num: formatNumber(counts.s), label: t.subscribers, color: "var(--gold)" },
  ];

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>{t.dashboard}</h1>
          <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>
            {locale === "fa" ? "خوش آمدید! آخرین وضعیت سایت را مشاهده کنید" : locale === "ar" ? "مرحباً! راجع آخر تحديثات الموقع" : "Welcome! Check the latest site status."}
          </p>
        </div>
        <Link href="/admin/news/add" className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2">
          <PlusCircle size={14} />
          {t.addNews}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className="card2 p-5">
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.num}</div>
            <div className="text-xs" style={{ color: "var(--text3)" }}>{s.label}</div>
            <div className="text-[11px] mt-2 font-semibold" style={{ color: "var(--green)" }}>▲ {[12, 3, 8.5, 1.2][i]}%</div>
          </div>
        ))}
      </div>

      {/* Chart + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 lg:col-span-2">
          <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text)" }}>
            📈 {locale === "fa" ? "بازدید ۷ روز گذشته" : locale === "ar" ? "زيارات آخر 7 أيام" : "Last 7 Days Visits"}
          </h4>
          <div className="flex items-end gap-2 h-28" ref={barsRef}>
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t transition-all duration-700 cursor-pointer hover:opacity-80" style={{ height: `${d.h}%`, background: "linear-gradient(to top,var(--accent),rgba(230,57,70,0.3))", minHeight: 4 }} title={`${d.h}%`} />
                <span className="text-[10px]" style={{ color: "var(--text3)" }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <h4 className="text-sm font-bold mb-4" style={{ color: "var(--text)" }}>📊 {locale === "fa" ? "آمار سریع" : locale === "ar" ? "إحصاءات سريعة" : "Quick Stats"}</h4>
          <div className="space-y-3">
            {[
              { label: locale === "fa" ? "پربازدیدترین خبر" : "Top Article", val: locale === "fa" ? "فوتبال ایران" : "Iran Football" },
              { label: locale === "fa" ? "نظرات امروز" : "Today's Comments", val: comments.length },
              { label: locale === "fa" ? "اخبار در صف" : "Pending News", val: news.filter((n) => n.status === "review").length },
              { label: locale === "fa" ? "کاربران ثبت‌شده" : "Registered Users", val: users.length },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2" style={{ borderBottom: "1px solid var(--border)" }}>
                <span className="text-xs" style={{ color: "var(--text2)" }}>{item.label}</span>
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent news table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <h4 className="text-sm font-bold" style={{ color: "var(--text)" }}>📰 {locale === "fa" ? "آخرین اخبار" : locale === "ar" ? "آخر الأخبار" : "Recent Articles"}</h4>
          <Link href="/admin/news" className="text-xs hover:text-[--accent] transition-colors" style={{ color: "var(--text3)" }}>{locale === "fa" ? "مشاهده همه" : "View All"}</Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{locale === "fa" ? "عنوان" : "Title"}</th>
                <th>{locale === "fa" ? "دسته" : "Category"}</th>
                <th>{locale === "fa" ? "بازدید" : "Views"}</th>
                <th>{locale === "fa" ? "وضعیت" : "Status"}</th>
                <th>{locale === "fa" ? "عملیات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {news.slice(0, 6).map((n) => (
                <tr key={n.id}>
                  <td style={{ maxWidth: 260 }}>
                    <div className="truncate text-sm font-semibold" style={{ color: "var(--text)" }}>{n.title}</div>
                  </td>
                  <td>
                    <span className="cat-badge text-white" style={{ background: CATEGORY_META[n.category].bg, fontSize: 10 }}>
                      {CATEGORY_META[n.category][locale]}
                    </span>
                  </td>
                  <td><span className="text-xs flex items-center gap-1"><Eye size={11}/>{formatNumber(n.views)}</span></td>
                  <td><span className={`status-badge status-${n.status}`}>{n.status === "published" ? t.published : n.status === "draft" ? t.draft : t.review}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <Link href={`/news/${n.id}`}><button className="action-btn" style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", fontSize: 11, background: "var(--bg3)", color: "var(--text2)", cursor: "pointer" }}><Eye size={11}/></button></Link>
                      <Link href={`/admin/news/edit/${n.id}`}><button className="action-btn" style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", fontSize: 11, background: "var(--bg3)", color: "var(--text2)", cursor: "pointer" }}>✏️</button></Link>
                      <button onClick={() => deleteNews(n.id)} className="action-btn" style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", fontSize: 11, background: "var(--bg3)", color: "var(--accent)", cursor: "pointer" }}><Trash2 size={11}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
