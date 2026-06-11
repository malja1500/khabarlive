/**
 * /api/news/external
 * دریافت اخبار از خبرگزاری‌های خارجی
 * 
 * query params:
 *   source=newsapi | gnews | rss
 *   agency=bbc | cnn | reuters | al-jazeera | ...
 *   q=search query (optional)
 *   locale=fa | en | ar
 */
import { NextRequest, NextResponse } from "next/server";

// ─── منابع خبری ───────────────────────────────────────────────────────────────

const NEWS_AGENCIES = {
  international: [
    { id:"bbc",       name:"BBC News",       name_fa:"بی‌بی‌سی",         lang:"en", rss:"https://feeds.bbci.co.uk/news/rss.xml",           logo:"🇬🇧" },
    { id:"reuters",   name:"Reuters",        name_fa:"رویترز",            lang:"en", rss:"https://feeds.reuters.com/reuters/topNews",        logo:"📰" },
    { id:"cnn",       name:"CNN",            name_fa:"سی‌ان‌ان",          lang:"en", rss:"http://rss.cnn.com/rss/edition.rss",               logo:"🇺🇸" },
    { id:"aljazeera", name:"Al Jazeera",     name_fa:"الجزیره",           lang:"ar", rss:"https://www.aljazeera.com/xml/rss/all.xml",        logo:"🇶🇦" },
    { id:"apnews",    name:"AP News",        name_fa:"اسوشیتدپرس",       lang:"en", rss:"https://rsshub.app/apnews/topics/apf-topnews",    logo:"🗞" },
    { id:"dw",        name:"DW News",        name_fa:"دویچه وله",         lang:"en", rss:"https://rss.dw.com/rdf/rss-en-all",               logo:"🇩🇪" },
    { id:"france24",  name:"France 24",      name_fa:"فرانس ۲۴",          lang:"en", rss:"https://www.france24.com/en/rss",                  logo:"🇫🇷" },
    { id:"guardian",  name:"The Guardian",   name_fa:"گاردین",            lang:"en", rss:"https://www.theguardian.com/world/rss",            logo:"📋" },
  ],
  domestic: [
    { id:"irna",      name:"IRNA",           name_fa:"ایرنا",             lang:"fa", rss:"https://www.irna.ir/rss",                          logo:"🇮🇷" },
    { id:"isna",      name:"ISNA",           name_fa:"ایسنا",             lang:"fa", rss:"https://www.isna.ir/rss",                          logo:"🇮🇷" },
    { id:"tasnim",    name:"Tasnim News",    name_fa:"تسنیم",             lang:"fa", rss:"https://www.tasnimnews.com/fa/rss/feed/0/8/0",     logo:"🇮🇷" },
    { id:"mehrnews",  name:"Mehr News",      name_fa:"مهر",               lang:"fa", rss:"https://www.mehrnews.com/rss",                     logo:"🇮🇷" },
    { id:"farsnews",  name:"Fars News",      name_fa:"فارس",              lang:"fa", rss:"https://www.farsnews.ir/rss",                      logo:"🇮🇷" },
    { id:"ibna",      name:"IBNA",           name_fa:"ایبنا",             lang:"fa", rss:"https://www.ibna.ir/rss",                          logo:"🇮🇷" },
  ],
};

// ─── Mock news برای demo (بدون نیاز به API key) ────────────────────────────────
function getMockNews(agencyId: string, count = 10) {
  const agency = [...NEWS_AGENCIES.international, ...NEWS_AGENCIES.domestic].find(a => a.id === agencyId);
  if (!agency) return [];

  const titles_en = [
    "World Leaders Gather for Climate Summit in Geneva",
    "Tech Giants Report Record Quarterly Earnings",
    "New Medical Breakthrough in Cancer Treatment",
    "Global Markets Rally Amid Economic Optimism",
    "Space Agency Announces Next Mars Mission",
    "Renewable Energy Hits New Production Record",
    "International Trade Deal Signed by 40 Nations",
    "Scientists Discover New Species in Amazon",
    "Major Earthquake Strikes Pacific Rim",
    "AI Technology Transforms Healthcare Industry",
  ];

  const titles_fa = [
    "رهبران جهان برای اجلاس آب‌وهوایی در ژنو گرد هم آمدند",
    "غول‌های فناوری درآمد فصلی رکورد را گزارش کردند",
    "پیشرفت پزشکی جدید در درمان سرطان",
    "بازارهای جهانی در پی خوش‌بینی اقتصادی صعود کرد",
    "سازمان فضایی مأموریت بعدی مریخ را اعلام کرد",
    "انرژی تجدیدپذیر به رکورد تولید جدیدی رسید",
    "معاهده تجارت بین‌المللی توسط ۴۰ کشور امضا شد",
    "دانشمندان گونه جدیدی در آمازون کشف کردند",
    "زلزله بزرگ به حلقه آتش اقیانوس آرام ضربه زد",
    "فناوری هوش مصنوعی صنعت بهداشت را متحول می‌کند",
  ];

  const images = [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&q=80",
    "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600&q=80",
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80",
    "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600&q=80",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&q=80",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80",
    "https://images.unsplash.com/photo-1551418015-3a9f29d08e77?w=600&q=80",
    "https://images.unsplash.com/photo-1526666923127-b2970f64b422?w=600&q=80",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80",
  ];

  const categories = ["world","tech","economy","sport","politics","culture"];

  return Array.from({ length: Math.min(count, 10) }, (_, i) => ({
    id:           `${agencyId}-${Date.now()}-${i}`,
    title:        agency.lang === "fa" ? titles_fa[i % titles_fa.length] : titles_en[i % titles_en.length],
    excerpt:      agency.lang === "fa" ? "خلاصه خبر از " + agency.name_fa : `Summary of news from ${agency.name}`,
    image:        images[i % images.length],
    category:     categories[i % categories.length],
    source:       agency.name_fa,
    sourceId:     agency.id,
    sourceLogo:   agency.logo,
    sourceUrl:    `https://${agency.id}.com`,
    lang:         agency.lang,
    publishedAt:  new Date(Date.now() - i * 3600000).toISOString(),
    isExternal:   true,
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type    = searchParams.get("type") || "all";   // all | domestic | international
  const agency  = searchParams.get("agency") || "";
  const count   = parseInt(searchParams.get("count") || "10");

  // فهرست خبرگزاری‌ها
  if (searchParams.get("list") === "1") {
    return NextResponse.json({
      domestic:      NEWS_AGENCIES.domestic,
      international: NEWS_AGENCIES.international,
    });
  }

  let news: any[] = [];

  if (agency) {
    // خبرگزاری خاص
    news = getMockNews(agency, count);
  } else if (type === "domestic") {
    // همه داخلی
    for (const a of NEWS_AGENCIES.domestic) {
      news.push(...getMockNews(a.id, 3));
    }
  } else if (type === "international") {
    // همه خارجی
    for (const a of NEWS_AGENCIES.international) {
      news.push(...getMockNews(a.id, 3));
    }
  } else {
    // همه
    for (const a of [...NEWS_AGENCIES.domestic, ...NEWS_AGENCIES.international]) {
      news.push(...getMockNews(a.id, 2));
    }
  }

  return NextResponse.json({ news, total: news.length });
}
