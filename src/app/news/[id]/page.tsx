"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Eye, Clock, Tag, ArrowRight, Send } from "lucide-react";
import { useApp, useAuth } from "@/store";
import { translations } from "@/lib/i18n";
import { NewsItem, Comment } from "@/types";
import { NewsCard } from "@/components/news/NewsCard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CATEGORY_META, formatNumber, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

export default function NewsDetailPage() {
  const params = useParams();
  const { locale } = useApp();
  const { user, isLoggedIn } = useAuth();
  const t = translations[locale];

  const [news, setNews] = useState<NewsItem | null>(null);
  const [related, setRelated] = useState<NewsItem[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/news/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setNews(d.news);
        setLoading(false);
        if (d.news) {
          fetch(`/api/news?category=${d.news.category}&limit=4`)
            .then((r) => r.json())
            .then((rd) => setRelated((rd.news || []).filter((n: NewsItem) => n.id !== params.id).slice(0, 3)));
          fetch(`/api/comments?newsId=${params.id}`)
            .then((r) => r.json())
            .then((cd) => setComments(cd.comments || []));
        }
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newsId: params.id, newsTitle: news?.title, text: commentText }),
    });
    if (res.ok) {
      toast.success(locale === "fa" ? "نظر شما ثبت شد و پس از تأیید نمایش داده می‌شود" : "Comment submitted for review");
      setCommentText("");
    }
    setSubmitting(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    toast.success(t.news.linkCopied);
  }

  if (loading) return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="h-64 rounded-2xl shimmer mb-6" />
        <div className="h-8 rounded shimmer mb-4 w-3/4" />
        <div className="h-4 rounded shimmer mb-2" />
        <div className="h-4 rounded shimmer mb-2 w-2/3" />
      </div>
    </>
  );

  if (!news) return (
    <>
      <Navbar />
      <div className="text-center py-32">
        <div className="text-6xl mb-4">📰</div>
        <p style={{ color: "var(--text3)" }}>{locale === "fa" ? "خبر یافت نشد" : "Article not found"}</p>
        <Link href="/news" className="btn-primary mt-6 inline-block rounded-xl px-6 py-2">{locale === "fa" ? "بازگشت به اخبار" : "Back to News"}</Link>
      </div>
    </>
  );

  const cat = CATEGORY_META[news.category];
  const title = locale === "en" && news.titleEn ? news.titleEn : locale === "ar" && news.titleAr ? news.titleAr : news.title;
  const body = locale === "en" && news.bodyEn ? news.bodyEn : locale === "ar" && news.bodyAr ? news.bodyAr : news.body;

  return (
    <>
      <Navbar />

      {/* Hero image */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img src={news.image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,var(--bg) 0%,rgba(0,0,0,0.3) 60%,transparent 100%)" }} />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-6 pb-12 relative z-10">
        {/* Back button */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/news">
            <button className="btn-secondary text-xs py-2 px-4 rounded-xl flex items-center gap-2">
              <ArrowRight size={14} />
              {locale === "fa" ? "بازگشت" : locale === "ar" ? "عودة" : "Back"}
            </button>
          </Link>
        </div>

        {/* Category badge */}
        <div className="cat-badge mb-4" style={{ background: cat.bg }}>{cat.icon} {cat[locale]}</div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black leading-relaxed mb-6 animate-fade-up" style={{ color: "var(--text)" }}>{title}</h1>

        {/* Meta */}
        <div className="flex items-center gap-4 flex-wrap mb-8 pb-6 animate-fade-up delay-100" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <img src={news.authorAvatar} alt={news.author} className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: "var(--accent)" }} />
            <div>
              <div className="text-sm font-bold" style={{ color: "var(--text)" }}>{news.author}</div>
              <div className="text-xs" style={{ color: "var(--text3)" }}>{locale === "fa" ? "خبرنگار ارشد" : locale === "ar" ? "مراسل أول" : "Senior Reporter"}</div>
            </div>
          </div>
          <div className="text-xs flex items-center gap-1" style={{ color: "var(--text3)" }}>
            <Clock size={12} />
            {formatDate(news.createdAt, locale)}
          </div>
          <div className="text-xs flex items-center gap-1" style={{ color: "var(--text3)" }}>
            <Eye size={12} />
            {formatNumber(news.views)} {t.news.views}
          </div>
          <div className="text-xs" style={{ color: "var(--text3)" }}>📖 {news.readingTime}</div>
        </div>

        {/* Body */}
        <div className="news-prose animate-fade-up delay-200 mb-10" dangerouslySetInnerHTML={{ __html: body }} />

        {/* Share */}
        <div className="flex gap-3 flex-wrap mb-10">
          {[
            { label: `🔗 ${t.news.shareLink}`, action: copyLink },
            { label: `🔖 ${t.news.save}`, action: () => toast.success(locale === "fa" ? "ذخیره شد" : "Saved") },
            { label: `🖨 ${t.news.print}`, action: () => window.print() },
          ].map((b) => (
            <button key={b.label} onClick={b.action} className="btn-secondary text-xs py-2 px-4 rounded-xl flex-1 min-w-28">
              {b.label}
            </button>
          ))}
        </div>

        {/* Tags */}
        {news.tags?.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-10 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            <Tag size={14} style={{ color: "var(--text3)" }} className="mt-1 shrink-0" />
            {news.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-xs border cursor-pointer transition-all hover:border-[--accent] hover:text-[--accent]" style={{ background: "var(--bg3)", borderColor: "var(--border)", color: "var(--text2)" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="pt-6" style={{ borderTop: "1px solid var(--border)" }}>
          <h3 className="text-lg font-black mb-6" style={{ color: "var(--text)" }}>
            💬 {t.news.comments} ({comments.length})
          </h3>

          {/* Add comment */}
          {isLoggedIn ? (
            <form onSubmit={submitComment} className="mb-8 card p-4">
              <div className="flex items-start gap-3">
                <img src={user?.avatar || "https://i.pravatar.cc/40"} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 border" style={{ borderColor: "var(--border2)" }} />
                <div className="flex-1">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={t.news.addComment}
                    className="input-field resize-none min-h-[80px] mb-3 text-sm"
                    required
                  />
                  <div className="flex justify-end">
                    <button type="submit" disabled={submitting || !commentText.trim()} className="btn-primary text-xs py-2 px-5 rounded-xl flex items-center gap-2" style={{ opacity: submitting ? 0.7 : 1 }}>
                      <Send size={13} />
                      {t.news.submitComment}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="card p-4 text-center mb-8" style={{ border: "1px dashed var(--border2)" }}>
              <p className="text-sm mb-3" style={{ color: "var(--text2)" }}>{t.news.loginToComment}</p>
              <Link href="/login" className="btn-primary text-xs py-2 px-5 rounded-xl inline-block">{t.nav.login}</Link>
            </div>
          )}

          {/* Comment list */}
          <div className="space-y-4">
            {comments.map((c) => (
              <div key={c.id} className="card p-4 flex gap-3">
                <img src={c.userAvatar || "https://i.pravatar.cc/40"} alt={c.userName} className="w-9 h-9 rounded-full object-cover shrink-0 border" style={{ borderColor: "var(--border2)" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{c.userName}</span>
                    <span className="text-xs" style={{ color: "var(--text3)" }}>{formatDate(c.createdAt, locale)}</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>{c.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center py-8 text-sm" style={{ color: "var(--text3)" }}>
                {locale === "fa" ? "هنوز نظری ثبت نشده است" : locale === "ar" ? "لا تعليقات بعد" : "No comments yet"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related news */}
      {related.length > 0 && (
        <div style={{ background: "var(--card)", borderTop: "1px solid var(--border)" }} className="py-12">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-6 text-lg font-black" style={{ color: "var(--text)" }}>
              <div className="w-1 h-6 rounded-full" style={{ background: "var(--accent)" }} />
              {t.news.relatedNews}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <div key={item.id} className="group">
                  <NewsCard news={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
