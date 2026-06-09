/**
 * database.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-dependency, file-based JSON database.
 * Data is stored in  <project-root>/data/db.json
 * Works on Windows, Mac and Linux with no native modules.
 *
 * All reads/writes go through the exported query helpers below.
 * The file is loaded once per server process and flushed to disk after
 * every write, so data survives restarts.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import fs   from "fs";
import path from "path";

// ── Types ────────────────────────────────────────────────────────────────────

export interface DBUser {
  id:         string;
  name:       string;
  email:      string;
  password:   string;
  role:       "admin" | "user";
  avatar:     string;
  isActive:   boolean;
  newsCount:  number;
  createdAt:  string;
}

export interface DBNews {
  id:           string;
  title:        string;
  titleEn:      string;
  titleAr:      string;
  excerpt:      string;
  excerptEn:    string;
  excerptAr:    string;
  body:         string;
  bodyEn:       string;
  bodyAr:       string;
  category:     string;
  image:        string;
  author:       string;
  authorId:     string;
  authorAvatar: string;
  status:       "published" | "draft" | "review";
  views:        number;
  readingTime:  string;
  tags:         string[];
  createdAt:    string;
}

export interface DBComment {
  id:          string;
  newsId:      string;
  newsTitle:   string;
  userId:      string;
  userName:    string;
  userAvatar:  string;
  text:        string;
  status:      "pending" | "approved" | "rejected";
  createdAt:   string;
}

interface JsonDB {
  users:    DBUser[];
  news:     DBNews[];
  comments: DBComment[];
  seeded:   boolean;
}

// ── File path ────────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE  = path.join(DATA_DIR, "db.json");

// ── Load or initialise DB ────────────────────────────────────────────────────

function loadDB(): JsonDB {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE))  return { users: [], news: [], comments: [], seeded: false };
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as JsonDB;
  } catch {
    return { users: [], news: [], comments: [], seeded: false };
  }
}

function saveDB(data: JsonDB): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ── Global in-process cache ──────────────────────────────────────────────────
// Next.js re-uses the same Node process between requests in dev mode,
// so we can keep the DB in a module-level variable and only hit disk
// when something changes.

const _g = global as any;
if (!_g.__jsonDB) _g.__jsonDB = loadDB();

function getDB(): JsonDB        { return _g.__jsonDB as JsonDB; }
function persist(db: JsonDB)    { _g.__jsonDB = db; saveDB(db); }

// ── Seed ─────────────────────────────────────────────────────────────────────

function hashForSeed(plain: string): string {
  return "hashed_" + Buffer.from(plain, "utf8").toString("base64");
}

function seed(db: JsonDB): void {
  // Users
  db.users = [
    {
      id: "admin-1", name: "علی رضایی", email: "admin@khabarlive.ir",
      password: hashForSeed("Admin@1234"), role: "admin",
      avatar: "https://i.pravatar.cc/80?img=3",
      isActive: true, newsCount: 142, createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "user-1", name: "سارا احمدی", email: "sara@example.com",
      password: hashForSeed("password"), role: "user",
      avatar: "https://i.pravatar.cc/80?img=5",
      isActive: true, newsCount: 0, createdAt: "2024-02-15T00:00:00Z",
    },
    {
      id: "user-2", name: "رضا ملکی", email: "reza@example.com",
      password: hashForSeed("password"), role: "user",
      avatar: "https://i.pravatar.cc/80?img=8",
      isActive: true, newsCount: 0, createdAt: "2024-03-10T00:00:00Z",
    },
  ];

  // News
  db.news = [
    {
      id: "news-1", category: "tech", status: "published", views: 12400,
      readingTime: "۵ دقیقه", createdAt: "2026-06-07T06:00:00Z",
      author: "دکتر علی رضایی", authorId: "admin-1", authorAvatar: "https://i.pravatar.cc/80?img=3",
      image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80",
      tags: ["هوش مصنوعی","AGI","MIT","فناوری"],
      title:     "هوش مصنوعی AGI: دانشمندان اعلام کردند مرز بین هوش مصنوعی و هوش انسانی در حال محو شدن است",
      titleEn:   "AGI: Scientists Say the Line Between AI and Human Intelligence Is Fading",
      titleAr:   "الذكاء الاصطناعي العام: العلماء يعلنون تلاشي الحدود",
      excerpt:   "گروهی از محققان دانشگاه MIT اعلام کردند که آخرین نسل مدل‌های هوش مصنوعی توانایی انجام بیش از ۹۵٪ وظایف شناختی انسانی را دارند.",
      excerptEn: "MIT researchers announced that the latest AI models can perform over 95% of human cognitive tasks.",
      excerptAr: "أعلن باحثو MIT أن أحدث نماذج الذكاء الاصطناعي قادرة على أداء أكثر من 95٪ من المهام المعرفية البشرية.",
      body:    "<p>محققان دانشگاه MIT در پژوهشی که امروز در ژورنال Science منتشر شد، اعلام کردند که مرز بین هوش مصنوعی عمومی (AGI) و هوش انسانی به سرعت در حال محو شدن است.</p><h3>چه چیزی تغییر کرده؟</h3><p>آنچه این آزمایش را از تحقیقات قبلی متمایز می‌کند، توانایی مدل در استدلال خلاقانه و حل مسائل بدون سابقه است.</p><blockquote>«ما در آستانه یک تحول بنیادین در تاریخ بشریت قرار داریم.» — دکتر سارا چن، MIT</blockquote><h3>چالش‌های پیش رو</h3><p>با وجود این پیشرفت چشمگیر، کارشناسان نسبت به خطرات بالقوه هشدار می‌دهند.</p>",
      bodyEn:  "<p>MIT researchers published findings showing AI models now outperform average humans on over 95% of cognitive benchmarks.</p><h3>What Changed?</h3><p>These models can devise innovative solutions in entirely new situations.</p><blockquote>\"We stand at the threshold of a fundamental transformation.\" — Dr. Sarah Chen, MIT</blockquote>",
      bodyAr:  "<p>نشر باحثو MIT نتائج تُظهر أن نماذج الذكاء الاصطناعي تتفوق الآن على البشر في أكثر من 95٪ من المعايير المعرفية.</p>",
    },
    {
      id: "news-2", category: "economy", status: "published", views: 8200,
      readingTime: "۴ دقیقه", createdAt: "2026-06-07T05:15:00Z",
      author: "مهندس سارا احمدی", authorId: "admin-1", authorAvatar: "https://i.pravatar.cc/80?img=5",
      image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=900&q=80",
      tags: ["نفت","اقتصاد","اوپک"],
      title:     "بازار جهانی نفت با رکورد تاریخی جدید مواجه شد؛ قیمت هر بشکه از ۱۲۰ دلار گذشت",
      titleEn:   "Global Oil Market Hits New Record: Barrel Price Exceeds $120",
      titleAr:   "سوق النفط العالمي يواجه رقماً قياسياً جديداً",
      excerpt:   "اوپک پلاس تصمیم گرفت تولید نفت را تا پایان سال محدود نگه دارد که این امر باعث جهش قیمت‌ها شد.",
      excerptEn: "OPEC+ decided to keep oil production limited until year-end, causing a price surge.",
      excerptAr: "قررت أوبك+ الإبقاء على إنتاج النفط محدوداً حتى نهاية العام.",
      body:    "<p>بازار جهانی نفت دیروز با یک جهش تاریخی روبرو شد. قیمت هر بشکه نفت برنت برای اولین بار از سال ۲۰۲۲ از مرز ۱۲۰ دلار عبور کرد.</p><h3>دلایل افزایش قیمت</h3><p>تصمیم اوپک پلاس برای کاهش ۲ میلیون بشکه‌ای تولید روزانه محرک اصلی بود.</p>",
      bodyEn:  "<p>Brent crude crossed $120 per barrel for the first time since 2022.</p>",
      bodyAr:  "<p>تجاوز سعر خام برنت 120 دولاراً للبرميل للمرة الأولى منذ 2022.</p>",
    },
    {
      id: "news-3", category: "sport", status: "published", views: 45100,
      readingTime: "۳ دقیقه", createdAt: "2026-06-07T04:00:00Z",
      author: "رضا ملکی", authorId: "admin-1", authorAvatar: "https://i.pravatar.cc/80?img=8",
      image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80",
      tags: ["فوتبال","تیم ملی","جام جهانی"],
      title:     "تیم ملی فوتبال ایران با پیروزی قاطع ۳ بر صفر راهی جام جهانی ۲۰۲۶ شد",
      titleEn:   "Iran National Football Team Qualifies for 2026 World Cup with 3-0 Victory",
      titleAr:   "المنتخب الإيراني يتأهل لكأس العالم 2026 بفوز حاسم 3-0",
      excerpt:   "با این پیروزی در بازی پلی‌آف، ایران سهمیه حضور در جام جهانی را کسب کرد.",
      excerptEn: "With this playoff victory, Iran secured a spot in the USA/Canada/Mexico World Cup.",
      excerptAr: "ضمن إيران مكاناً في كأس العالم بهذا الفوز.",
      body:    "<p>تیم ملی فوتبال ایران دیشب با نتیجه ۳ بر صفر حریف خود را شکست داد.</p><h3>گزارش بازی</h3><p>سردار آزمون در دقیقه ۲۳ اولین گل را زد.</p><blockquote>«این پیروزی به تمام ملت ایران تعلق دارد.»</blockquote>",
      bodyEn:  "<p>Iran's national football team defeated their opponents 3-0.</p>",
      bodyAr:  "<p>هزم المنتخب الإيراني منافسه بنتيجة 3-0.</p>",
    },
    {
      id: "news-4", category: "world", status: "published", views: 6700,
      readingTime: "۶ دقیقه", createdAt: "2026-06-07T03:00:00Z",
      author: "لیلا کریمی", authorId: "admin-1", authorAvatar: "https://i.pravatar.cc/80?img=10",
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80",
      tags: ["آب","خاورمیانه","سازمان ملل"],
      title:     "سازمان ملل: بحران آب در خاورمیانه به نقطه بحرانی رسیده و نیاز به اقدام فوری دارد",
      titleEn:   "UN: Middle East Water Crisis Reaches Critical Point",
      titleAr:   "الأمم المتحدة: أزمة المياه في الشرق الأوسط وصلت لنقطة حرجة",
      excerpt:   "گزارش سازمان ملل هشدار می‌دهد که تا سال ۲۰۳۵، بیش از ۲۰۰ میلیون نفر با کمبود شدید آب مواجه خواهند شد.",
      excerptEn: "UN report warns that by 2035, over 200 million people will face severe water shortages.",
      excerptAr: "يحذر تقرير الأمم المتحدة من شح المياه لأكثر من 200 مليون شخص بحلول 2035.",
      body:    "<p>سازمان ملل متحد اعلام کرد که بحران آب در خاورمیانه به نقطه‌ای غیرقابل بازگشت نزدیک می‌شود.</p><h3>ابعاد بحران</h3><p>تا سال ۲۰۳۵، بیش از ۲۰۰ میلیون نفر در معرض کمبود شدید آب قرار خواهند گرفت.</p>",
      bodyEn:  "<p>The UN warned that the Middle East water crisis is approaching a point of no return.</p>",
      bodyAr:  "<p>حذّرت الأمم المتحدة من أن أزمة المياه في الشرق الأوسط تقترب من نقطة اللاعودة.</p>",
    },
    {
      id: "news-5", category: "tech", status: "published", views: 28900,
      readingTime: "۴ دقیقه", createdAt: "2026-06-06T22:00:00Z",
      author: "آرش محمودی", authorId: "admin-1", authorAvatar: "https://i.pravatar.cc/80?img=15",
      image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&q=80",
      tags: ["اپل","آیفون","موبایل"],
      title:     "اپل از iPhone 18 رونمایی کرد: صفحه‌نمایش هولوگرافیک و باتری ۵ روزه",
      titleEn:   "Apple Unveils iPhone 18: Holographic Display and 5-Day Battery",
      titleAr:   "آبل تكشف عن iPhone 18: شاشة هولوغرافية وبطارية لـ 5 أيام",
      excerpt:   "اپل در رویداد سالانه خود، مدل جدید آیفون را با فناوری‌های انقلابی معرفی کرد.",
      excerptEn: "Apple introduced the new iPhone model with revolutionary technologies.",
      excerptAr: "قدّمت آبل نموذج iPhone الجديد بتقنيات ثورية.",
      body:    "<p>اپل دیروز از iPhone 18 رونمایی کرد.</p><h3>ویژگی‌های انقلابی</h3><p>باتری گرافن می‌تواند تا ۵ روز کامل دوام بیاورد.</p>",
      bodyEn:  "<p>Apple unveiled the iPhone 18, the world's first commercial smartphone with a holographic display.</p>",
      bodyAr:  "<p>كشفت آبل عن iPhone 18 أول هاتف تجاري بشاشة هولوغرافية.</p>",
    },
    {
      id: "news-6", category: "politics", status: "published", views: 4100,
      readingTime: "۵ دقیقه", createdAt: "2026-06-06T18:00:00Z",
      author: "فرزانه کاظمی", authorId: "admin-1", authorAvatar: "https://i.pravatar.cc/80?img=20",
      image: "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=900&q=80",
      tags: ["بریکس","سیاست بین‌الملل"],
      title:     "نشست بریکس: ۲۴ کشور جدید درخواست عضویت دادند",
      titleEn:   "BRICS Summit: 24 New Countries Apply for Membership",
      titleAr:   "قمة بريكس: 24 دولة جديدة تتقدم بطلبات العضوية",
      excerpt:   "در اجلاس این هفته بریکس، درخواست عضویت ۲۴ کشور به صورت رسمی ارسال شد.",
      excerptEn: "At this week's BRICS summit, 24 countries formally submitted membership applications.",
      excerptAr: "في قمة بريكس، قدّمت 24 دولة طلبات عضوية رسمية.",
      body:    "<p>اجلاس بریکس این هفته: ۲۴ کشور جدید درخواست رسمی عضویت ارسال کردند.</p>",
      bodyEn:  "<p>24 new countries submitted formal BRICS membership applications this week.</p>",
      bodyAr:  "<p>قدّمت 24 دولة جديدة طلبات عضوية رسمية في بريكس.</p>",
    },
    {
      id: "news-7", category: "culture", status: "published", views: 18300,
      readingTime: "۳ دقیقه", createdAt: "2026-06-06T14:00:00Z",
      author: "نیلوفر رحیمی", authorId: "admin-1", authorAvatar: "https://i.pravatar.cc/80?img=25",
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&q=80",
      tags: ["سینما","جشنواره کن","فرهنگ"],
      title:     "جشنواره فیلم کن: فیلم ایرانی «سایه‌های دور» جایزه طلایی نخل را از آن خود کرد",
      titleEn:   "Cannes Film Festival: Iranian Film 'Distant Shadows' Wins Palme d'Or",
      titleAr:   "مهرجان كان: الفيلم الإيراني يفوز بالسعفة الذهبية",
      excerpt:   "کارگردان جوان ایرانی با اثری درباره زندگی مهاجران، بزرگترین جایزه سینمای جهان را برد.",
      excerptEn: "A young Iranian director won cinema's greatest prize with a film about migrant life.",
      excerptAr: "مخرج إيراني شاب يفوز بأكبر جوائز السينما العالمية.",
      body:    "<p>در هفتادوهشتمین دوره جشنواره فیلم کن، کارگردان جوان ایرانی جایزه نخل طلایی را کسب کرد.</p><h3>درباره فیلم</h3><p>«سایه‌های دور» روایتی از زندگی یک خانواده مهاجر ایرانی در اروپاست.</p>",
      bodyEn:  "<p>At the 78th Cannes Film Festival, a young Iranian director won the Palme d'Or.</p>",
      bodyAr:  "<p>في الدورة الثامنة والسبعين لمهرجان كان فاز مخرج إيراني بالسعفة الذهبية.</p>",
    },
    {
      id: "news-8", category: "economy", status: "published", views: 9800,
      readingTime: "۳ دقیقه", createdAt: "2026-06-06T10:00:00Z",
      author: "علیرضا تهرانی", authorId: "admin-1", authorAvatar: "https://i.pravatar.cc/80?img=30",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80",
      tags: ["بورس","اقتصاد","سرمایه‌گذاری"],
      title:     "بورس تهران ۳.۸ درصد رشد کرد؛ صنعت خودرو و پتروشیمی پیشتاز بودند",
      titleEn:   "Tehran Stock Exchange Grows 3.8%: Auto and Petrochemical Sectors Lead",
      titleAr:   "بورصة طهران ترتفع 3.8٪",
      excerpt:   "شاخص کل بورس تهران با رشد چشمگیر ۳.۸ درصدی روز خوبی را پشت سر گذاشت.",
      excerptEn: "Tehran's main stock index grew by a remarkable 3.8% yesterday.",
      excerptAr: "ارتفع المؤشر الرئيسي لبورصة طهران بنسبة 3.8٪.",
      body:    "<p>بورس تهران یکی از بهترین روزهای خود را تجربه کرد. شاخص کل ۳.۸٪ رشد کرد.</p>",
      bodyEn:  "<p>The Tehran Stock Exchange had one of its best days of the year.</p>",
      bodyAr:  "<p>شهدت بورصة طهران أحد أفضل أيامها في العام.</p>",
    },
  ];

  // Comments
  db.comments = [
    { id:"c-1", newsId:"news-1", newsTitle:"هوش مصنوعی AGI",   userId:"user-1", userName:"سارا احمدی",  userAvatar:"https://i.pravatar.cc/40?img=5", text:"مقاله بسیار جالبی بود، ممنون!",              status:"approved", createdAt:"2026-06-07T07:00:00Z" },
    { id:"c-2", newsId:"news-2", newsTitle:"بازار نفت",          userId:"user-2", userName:"رضا ملکی",   userAvatar:"https://i.pravatar.cc/40?img=8", text:"چرا قیمت نفت اینقدر سریع بالا رفته؟",       status:"pending",  createdAt:"2026-06-07T06:30:00Z" },
    { id:"c-3", newsId:"news-3", newsTitle:"تیم ملی فوتبال",    userId:"user-1", userName:"سارا احمدی",  userAvatar:"https://i.pravatar.cc/40?img=5", text:"واقعاً افتخار کردم بهشون!",                 status:"approved", createdAt:"2026-06-07T05:00:00Z" },
    { id:"c-4", newsId:"news-7", newsTitle:"جشنواره کن",        userId:"user-2", userName:"رضا ملکی",   userAvatar:"https://i.pravatar.cc/40?img=8", text:"آیا این فیلم در ایران اکران می‌شود؟",        status:"pending",  createdAt:"2026-06-06T20:00:00Z" },
    { id:"c-5", newsId:"news-8", newsTitle:"بورس تهران",        userId:"user-1", userName:"سارا احمدی",  userAvatar:"https://i.pravatar.cc/40?img=5", text:"اطلاعات دقیق و به موقع. ممنون.",             status:"pending",  createdAt:"2026-06-06T15:00:00Z" },
  ];

  db.seeded = true;
}

// ── Boot: seed if first run ───────────────────────────────────────────────────

;(function boot() {
  const db = getDB();
  if (!db.seeded) { seed(db); persist(db); }
})();

// ── Query helpers ─────────────────────────────────────────────────────────────

// ·· Users ··

export const userQueries = {
  findByEmail(email: string): DBUser | undefined {
    return getDB().users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findById(id: string): DBUser | undefined {
    return getDB().users.find((u) => u.id === id);
  },
  getAll(): DBUser[] {
    return [...getDB().users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  insert(user: DBUser): void {
    const db = getDB();
    db.users.push(user);
    persist(db);
  },
  delete(id: string): void {
    const db = getDB();
    db.users = db.users.filter((u) => u.id !== id);
    persist(db);
  },
};

// ·· News ··

export const newsQueries = {
  getAll(): DBNews[] {
    return [...getDB().news].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  getPublished(): DBNews[] {
    return this.getAll().filter((n) => n.status === "published");
  },
  findById(id: string): DBNews | undefined {
    return getDB().news.find((n) => n.id === id);
  },
  search(opts: {
    isAdmin: boolean; category: string; search: string; limit: number; offset: number;
  }): DBNews[] {
    let list = opts.isAdmin ? this.getAll() : this.getPublished();
    if (opts.category && opts.category !== "all")
      list = list.filter((n) => n.category === opts.category);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list.slice(opts.offset, opts.offset + opts.limit);
  },
  count(opts: { isAdmin: boolean; category: string; search: string }): number {
    return this.search({ ...opts, limit: 99999, offset: 0 }).length;
  },
  insert(item: DBNews): void {
    const db = getDB();
    db.news.unshift(item);
    persist(db);
  },
  update(id: string, updates: Partial<DBNews>): void {
    const db = getDB();
    const idx = db.news.findIndex((n) => n.id === id);
    if (idx !== -1) { db.news[idx] = { ...db.news[idx], ...updates }; persist(db); }
  },
  incrementViews(id: string): void {
    const db = getDB();
    const item = db.news.find((n) => n.id === id);
    if (item) { item.views += 1; persist(db); }
  },
  delete(id: string): void {
    const db = getDB();
    db.news = db.news.filter((n) => n.id !== id);
    persist(db);
  },
};

// ·· Comments ··

export const commentQueries = {
  getAll(): DBComment[] {
    return [...getDB().comments].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
  getApproved(newsId: string): DBComment[] {
    return this.getAll().filter((c) => c.newsId === newsId && c.status === "approved");
  },
  getByNews(newsId: string): DBComment[] {
    return this.getAll().filter((c) => c.newsId === newsId);
  },
  insert(comment: DBComment): void {
    const db = getDB();
    db.comments.unshift(comment);
    persist(db);
  },
  updateStatus(id: string, status: DBComment["status"]): void {
    const db = getDB();
    const c = db.comments.find((x) => x.id === id);
    if (c) { c.status = status; persist(db); }
  },
  delete(id: string): void {
    const db = getDB();
    db.comments = db.comments.filter((c) => c.id !== id);
    persist(db);
  },
};
