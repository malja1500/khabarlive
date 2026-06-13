import { NextResponse } from "next/server";
import { newsQueries } from "@/lib/database";
import type { DBNews } from "@/lib/database";

// ─── تنظیمات خبرگزاری‌ها ─────────────────────────────────────────
const RSS_SOURCES = [
  {
    id: "irib",
    name: "صدا و سیما",
    url: "https://www.iribnews.ir/fa/rss/allnews",
    authorName: "خبرگزاری صدا و سیما",
    authorAvatar: "https://www.iribnews.ir/favicon.ico",
    defaultCategory: "politics" as const,
  },
  {
    id: "yjc",
    name: "باشگاه خبرنگاران",
    url: "https://www.yjc.ir/fa/rss/allnews",
    authorName: "باشگاه خبرنگاران جوان",
    authorAvatar: "https://www.yjc.ir/favicon.ico",
    defaultCategory: "world" as const,
  },
];

// ─── نگاشت کلمات کلیدی به دسته‌بندی ────────────────────────────
function guessCategory(title: string, desc: string): DBNews["category"] {
  const text = (title + " " + desc).toLowerCase();
  if (/فوتبال|ورزش|لیگ|بازی|تیم ملی|المپیک|کشتی|والیبال/.test(text))  return "sport";
  if (/اقتصاد|بورس|نفت|دلار|تورم|بانک|بازار|سهام|ریال/.test(text))     return "economy";
  if (/فناوری|هوش مصنوعی|موبایل|اینترنت|نرم‌افزار|سایبر|دیجیتال/.test(text)) return "tech";
  if (/فرهنگ|سینما|موسیقی|هنر|کتاب|ادبیات|جشنواره/.test(text))         return "culture";
  if (/جهان|بین‌الملل|آمریکا|اروپا|چین|روسیه|سازمان ملل/.test(text))   return "world";
  return "politics";
}

// ─── استخراج عکس از RSS ─────────────────────────────────────────
function extractImage(item: Element): string {
  // تلاش برای پیدا کردن عکس در تگ‌های مختلف RSS
  const enclosure = item.querySelector("enclosure");
  if (enclosure?.getAttribute("type")?.startsWith("image")) {
    return enclosure.getAttribute("url") || "";
  }
  const mediaContent = item.querySelector("content");
  if (mediaContent?.getAttribute("url")) {
    return mediaContent.getAttribute("url") || "";
  }
  // استخراج عکس از داخل description
  const desc = item.querySelector("description")?.textContent || "";
  const imgMatch = desc.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80";
}

// ─── پاکسازی HTML از متن ────────────────────────────────────────
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

// ─── پارس کردن RSS ──────────────────────────────────────────────
async function fetchRSS(source: typeof RSS_SOURCES[0]): Promise<DBNews[]> {
  const res = await fetch(source.url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; KhabarLive/1.0)" },
    next: { revalidate: 300 }, // کَش ۵ دقیقه‌ای
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${source.url} → ${res.status}`);

  const xml = await res.text();

  // پارس XML در محیط Node (بدون DOMParser)
  const items = parseRSSItems(xml);

  return items.slice(0, 20).map((item, i) => {
    const title   = stripHtml(item.title   || "بدون عنوان");
    const excerpt = stripHtml(item.description || "").slice(0, 200);
    const link    = item.link || "";
    const pubDate = item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString();
    const image   = item.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=900&q=80";
    const category = guessCategory(title, excerpt);

    return {
      id:           `rss-${source.id}-${Date.now()}-${i}`,
      title,
      titleEn:      "",
      titleAr:      "",
      excerpt,
      excerptEn:    "",
      excerptAr:    "",
      body:         `<p>${excerpt}</p><p><a href="${link}" target="_blank" rel="noopener">ادامه مطلب در ${source.name} ←</a></p>`,
      bodyEn:       "",
      bodyAr:       "",
      category,
      image,
      author:       source.authorName,
      authorId:     `rss-${source.id}`,
      authorAvatar: source.authorAvatar,
      status:       "published" as const,
      views:        0,
      readingTime:  "۲ دقیقه",
      tags:         [source.name, "RSS"],
      createdAt:    pubDate,
      source:       source.name,
      sourceUrl:    link,
    };
  });
}

// ─── پارسر XML ساده برای محیط Node ─────────────────────────────
function parseRSSItems(xml: string): Array<{
  title: string; description: string; link: string;
  pubDate: string; image: string;
}> {
  const items: ReturnType<typeof parseRSSItems> = [];
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i"))
             || block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m ? m[1].trim() : "";
    };
    // تلاش برای گرفتن عکس
    const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/i)
                        || block.match(/<media:content[^>]+url=["']([^"']+)["']/i);
    const description = get("description");
    const imgInDesc   = description.match(/<img[^>]+src=["']([^"']+)["']/i);

    items.push({
      title:       get("title"),
      description: stripHtml(description).slice(0, 300),
      link:        get("link") || get("guid"),
      pubDate:     get("pubDate"),
      image:       enclosureMatch?.[1] || imgInDesc?.[1] || "",
    });
  }
  return items;
}

// ─── GET /api/rss-fetch ──────────────────────────────────────────
// این route خبرها رو fetch می‌کنه و برمی‌گردونه (برای نمایش)
export async function GET() {
  try {
    const results = await Promise.allSettled(RSS_SOURCES.map(fetchRSS));

    const allNews: DBNews[] = [];
    const errors: string[]  = [];

    results.forEach((r, i) => {
      if (r.status === "fulfilled") allNews.push(...r.value);
      else errors.push(`${RSS_SOURCES[i].name}: ${r.reason?.message}`);
    });

    // مرتب‌سازی بر اساس تاریخ
    allNews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      count:   allNews.length,
      news:    allNews,
      errors:  errors.length ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── POST /api/rss-fetch ─────────────────────────────────────────
// این route خبرها رو fetch کرده و داخل دیتابیس ذخیره می‌کنه
// (برای cron job یا دکمه ادمین)
export async function POST() {
  try {
    const results = await Promise.allSettled(RSS_SOURCES.map(fetchRSS));
    const allNews: DBNews[] = [];
    const errors: string[]  = [];

    results.forEach((r, i) => {
      if (r.status === "fulfilled") allNews.push(...r.value);
      else errors.push(`${RSS_SOURCES[i].name}: ${r.reason?.message}`);
    });

    // فقط خبرهایی رو ذخیره کن که قبلاً نبودن
    const existing = await newsQueries.getAll();
    const existingUrls = new Set(existing.map((n) => n.sourceUrl).filter(Boolean));

    let saved = 0;
    for (const item of allNews) {
      if (!existingUrls.has(item.sourceUrl)) {
        await newsQueries.insert(item);
        saved++;
      }
    }

    return NextResponse.json({
      success: true,
      fetched: allNews.length,
      saved,
      skipped: allNews.length - saved,
      errors:  errors.length ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
