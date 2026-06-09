"use client";
import Link from "next/link";
import { Eye } from "lucide-react";
import { NewsItem } from "@/types";
import { useApp } from "@/store";
import { CATEGORY_META, formatNumber } from "@/lib/utils";

interface Props {
  news: NewsItem;
  size?: "normal" | "large" | "small";
}

export function NewsCard({ news, size = "normal" }: Props) {
  const { locale } = useApp();
  const cat = CATEGORY_META[news.category as keyof typeof CATEGORY_META];
  if (!cat) return null;

  const title =
    locale === "en" && news.titleEn ? news.titleEn :
    locale === "ar" && news.titleAr ? news.titleAr :
    news.title;

  const excerpt =
    locale === "en" && news.excerptEn ? news.excerptEn :
    locale === "ar" && news.excerptAr ? news.excerptAr :
    news.excerpt;

  const imgHeight = size === "large" ? "h-56" : size === "small" ? "h-36" : "h-48";

  return (
    <Link href={`/news/${news.id}`} className="block h-full">
      <div
        className="card news-card-hover cursor-pointer overflow-hidden h-full flex flex-col"
        style={{ border: "1px solid var(--border)" }}
      >
        {/* Image */}
        <div className={`relative overflow-hidden shrink-0 ${imgHeight} bg-[--bg3]`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={news.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&q=80"}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              // fallback اگه عکس لود نشد
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=700&q=80";
            }}
          />
          <div
            className="absolute top-3 end-3 cat-badge"
            style={{ background: cat.bg, color: "#fff" }}
          >
            {cat.icon} {cat[locale as keyof typeof cat] as string}
          </div>
          {news.status && news.status !== "published" && (
            <div className="absolute top-3 start-3 px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/90 text-black">
              {news.status}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <h3
            className="font-bold leading-relaxed mb-2 line-clamp-2 flex-1"
            style={{ fontSize: size === "large" ? "16px" : "14px", color: "var(--text)" }}
          >
            {title}
          </h3>
          {size !== "small" && (
            <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text2)", lineHeight: 1.8 }}>
              {excerpt}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2" style={{ color: "var(--text3)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={news.authorAvatar || "https://i.pravatar.cc/40"}
                alt=""
                className="w-6 h-6 rounded-full object-cover border"
                style={{ borderColor: "var(--border2)" }}
              />
              <span className="text-xs truncate max-w-[80px]">{news.createdAt?.slice(0, 10)}</span>
              <span className="text-xs flex items-center gap-0.5">
                <Eye size={10} />
                {formatNumber(news.views)}
              </span>
            </div>
            <span
              className="text-xs font-bold transition-opacity"
              style={{ color: "var(--accent)" }}
            >
              {locale === "fa" ? "بخوانید ←" : locale === "ar" ? "اقرأ →" : "Read →"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
