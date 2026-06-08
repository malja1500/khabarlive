"use client";
import Link from "next/link";
import Image from "next/image";
import { Eye, Clock } from "lucide-react";
import { NewsItem } from "@/types";
import { useApp } from "@/store";
import { CATEGORY_META, formatNumber } from "@/lib/utils";

interface Props {
  news: NewsItem;
  size?: "normal" | "large" | "small";
}

export function NewsCard({ news, size = "normal" }: Props) {
  const { locale } = useApp();
  const cat = CATEGORY_META[news.category];

  const title =
    locale === "en" && news.titleEn ? news.titleEn :
    locale === "ar" && news.titleAr ? news.titleAr :
    news.title;

  const excerpt =
    locale === "en" && news.excerptEn ? news.excerptEn :
    locale === "ar" && news.excerptAr ? news.excerptAr :
    news.excerpt;

  return (
    <Link href={`/news/${news.id}`}>
      <div
        className="card news-card-hover cursor-pointer overflow-hidden h-full flex flex-col"
        style={{ border: "1px solid var(--border)" }}
      >
        {/* Image */}
        <div className={`relative overflow-hidden shrink-0 ${size === "large" ? "h-56" : size === "small" ? "h-36" : "h-48"}`}>
          <img
            src={news.image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div
            className="absolute top-3 end-3 cat-badge text-white"
            style={{ background: cat.bg }}
          >
            {cat.icon} {cat[locale]}
          </div>
          {news.status !== "published" && (
            <div className="absolute top-3 start-3 px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/90 text-black">
              {news.status}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold leading-relaxed mb-2 line-clamp-2 flex-1" style={{ fontSize: size === "large" ? "16px" : "14px", color: "var(--text)" }}>
            {title}
          </h3>
          {size !== "small" && (
            <p className="text-xs mb-4 line-clamp-2" style={{ color: "var(--text2)", lineHeight: 1.8 }}>
              {excerpt}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2" style={{ color: "var(--text3)" }}>
              <img src={news.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover border" style={{ borderColor: "var(--border2)" }} />
              <span className="text-xs">{news.time || news.createdAt?.slice(0,10)}</span>
              <span className="text-xs flex items-center gap-1">
                <Eye size={10} /> {formatNumber(news.views)}
              </span>
            </div>
            <span className="text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--accent)" }}>
              {locale === "fa" ? "بخوانید ←" : locale === "ar" ? "اقرأ →" : "Read →"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
