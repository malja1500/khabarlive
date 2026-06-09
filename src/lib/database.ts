/**
 * database.ts — JSON file-based persistent database
 * ───────────────────────────────────────────────────
 * • داده‌ها در  data/db.json  ذخیره می‌شوند
 * • هیچ پکیج native ای نیاز نیست — روی Windows/Mac/Linux کار می‌کند
 * • هر write بلافاصله روی دیسک flush می‌شود
 * • هر read مستقیماً از فایل می‌خواند تا بین hot-reload‌های Next.js sync بماند
 */

import fs   from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBUser {
  id:        string;
  name:      string;
  email:     string;
  password:  string;
  role:      "admin" | "user";
  avatar:    string;
  isActive:  boolean;
  newsCount: number;
  createdAt: string;
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
  id:         string;
  newsId:     string;
  newsTitle:  string;
  userId:     string;
  userName:   string;
  userAvatar: string;
  text:       string;
  status:     "pending" | "approved" | "rejected";
  createdAt:  string;
}

interface JsonDB {
  users:    DBUser[];
  news:     DBNews[];
  comments: DBComment[];
  seeded:   boolean;
}

// ─── File helpers ─────────────────────────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE  = path.join(DATA_DIR, "db.json");

/** هر بار مستقیم از فایل می‌خواند — هیچ وقت stale نمی‌شود */
function readDB(): JsonDB {
  try {
    if (!fs.existsSync(DB_FILE))
      return { users: [], news: [], comments: [], seeded: false };
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as JsonDB;
  } catch {
    return { users: [], news: [], comments: [], seeded: false };
  }
}

/** بعد از هر تغییر فوری روی دیسک می‌نویسد */
function writeDB(data: JsonDB): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

function h(plain: string): string {
  return "hashed_" + Buffer.from(plain, "utf8").toString("base64");
}

function seedDB(): void {
  const db: JsonDB = {
    seeded: true,
    users: [
      { id:"admin-1", name:"علی رضایی",   email:"admin@khabarlive.ir", password:h("Admin@1234"), role:"admin", avatar:"https://i.pravatar.cc/80?img=3",  isActive:true, newsCount:142, createdAt:"2024-01-01T00:00:00Z" },
      { id:"user-1",  name:"سارا احمدی",  email:"sara@example.com",    password:h("password"),   role:"user",  avatar:"https://i.pravatar.cc/80?img=5",  isActive:true, newsCount:0,   createdAt:"2024-02-15T00:00:00Z" },
      { id:"user-2",  name:"رضا ملکی",    email:"reza@example.com",    password:h("password"),   role:"user",  avatar:"https://i.pravatar.cc/80?img=8",  isActive:true, newsCount:0,   createdAt:"2024-03-10T00:00:00Z" },
    ],
    news: [
      {
        id:"news-1", category:"tech", status:"published", views:12400, readingTime:"۵ دقیقه", createdAt:"2026-06-07T06:00:00Z",
        author:"دکتر علی رضایی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=3",
        image:"https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80",
        tags:["هوش مصنوعی","AGI","MIT","فناوری"],
        title:"هوش مصنوعی AGI: دانشمندان اعلام کردند مرز بین هوش مصنوعی و هوش انسانی در حال محو شدن است",
        titleEn:"AGI: Scientists Say the Line Between AI and Human Intelligence Is Fading",
        titleAr:"الذكاء الاصطناعي العام: العلماء يعلنون تلاشي الحدود",
        excerpt:"گروهی از محققان دانشگاه MIT اعلام کردند که آخرین نسل مدل‌های هوش مصنوعی توانایی انجام بیش از ۹۵٪ وظایف شناختی انسانی را دارند.",
        excerptEn:"MIT researchers announced that the latest AI models can perform over 95% of human cognitive tasks.",
        excerptAr:"أعلن باحثو MIT أن أحدث نماذج الذكاء الاصطناعي قادرة على أداء أكثر من 95٪ من المهام المعرفية.",
        body:"<p>محققان دانشگاه MIT اعلام کردند که مرز بین AGI و هوش انسانی در حال محو شدن است.</p><h3>چه چیزی تغییر کرده؟</h3><p>مدل‌های جدید می‌توانند در موقعیت‌های کاملاً جدید راه‌حل‌های نوآورانه ارائه دهند.</p><blockquote>«ما در آستانه یک تحول بنیادین قرار داریم.» — دکتر سارا چن</blockquote>",
        bodyEn:"<p>MIT researchers say AI models now outperform average humans on over 95% of cognitive benchmarks.</p>",
        bodyAr:"<p>نشر باحثو MIT نتائج تُظهر تفوق نماذج الذكاء الاصطناعي على البشر في أكثر من 95٪ من المعايير.</p>",
      },
      {
        id:"news-2", category:"economy", status:"published", views:8200, readingTime:"۴ دقیقه", createdAt:"2026-06-07T05:15:00Z",
        author:"مهندس سارا احمدی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=5",
        image:"https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=900&q=80",
        tags:["نفت","اقتصاد","اوپک"],
        title:"بازار جهانی نفت با رکورد تاریخی جدید مواجه شد؛ قیمت هر بشکه از ۱۲۰ دلار گذشت",
        titleEn:"Global Oil Market Hits New Record: Barrel Price Exceeds $120",
        titleAr:"سوق النفط العالمي يواجه رقماً قياسياً جديداً",
        excerpt:"اوپک پلاس تصمیم گرفت تولید نفت را تا پایان سال محدود نگه دارد.",
        excerptEn:"OPEC+ decided to keep oil production limited until year-end, causing a price surge.",
        excerptAr:"قررت أوبك+ الإبقاء على إنتاج النفط محدوداً حتى نهاية العام.",
        body:"<p>قیمت هر بشکه نفت برنت از ۱۲۰ دلار گذشت.</p><h3>دلایل افزایش</h3><p>کاهش ۲ میلیون بشکه‌ای تولید روزانه محرک اصلی بود.</p>",
        bodyEn:"<p>Brent crude crossed $120 per barrel for the first time since 2022.</p>",
        bodyAr:"<p>تجاوز سعر خام برنت 120 دولاراً للبرميل.</p>",
      },
      {
        id:"news-3", category:"sport", status:"published", views:45100, readingTime:"۳ دقیقه", createdAt:"2026-06-07T04:00:00Z",
        author:"رضا ملکی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=8",
        image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80",
        tags:["فوتبال","تیم ملی","جام جهانی"],
        title:"تیم ملی فوتبال ایران با پیروزی قاطع ۳ بر صفر راهی جام جهانی ۲۰۲۶ شد",
        titleEn:"Iran National Football Team Qualifies for 2026 World Cup with 3-0 Victory",
        titleAr:"المنتخب الإيراني يتأهل لكأس العالم 2026 بفوز حاسم 3-0",
        excerpt:"با این پیروزی در بازی پلی‌آف، ایران سهمیه جام جهانی را کسب کرد.",
        excerptEn:"With this playoff victory, Iran secured a spot in the World Cup.",
        excerptAr:"ضمن إيران مكاناً في كأس العالم بهذا الفوز.",
        body:"<p>تیم ملی ایران با نتیجه ۳ بر صفر حریف را شکست داد.</p><blockquote>«این پیروزی به تمام ملت ایران تعلق دارد.»</blockquote>",
        bodyEn:"<p>Iran's national team defeated their opponents 3-0 in a thrilling match.</p>",
        bodyAr:"<p>هزم المنتخب الإيراني منافسه بنتيجة 3-0.</p>",
      },
      {
        id:"news-4", category:"world", status:"published", views:6700, readingTime:"۶ دقیقه", createdAt:"2026-06-07T03:00:00Z",
        author:"لیلا کریمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=10",
        image:"https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80",
        tags:["آب","خاورمیانه","سازمان ملل"],
        title:"سازمان ملل: بحران آب در خاورمیانه به نقطه بحرانی رسیده",
        titleEn:"UN: Middle East Water Crisis Reaches Critical Point",
        titleAr:"الأمم المتحدة: أزمة المياه في الشرق الأوسط وصلت لنقطة حرجة",
        excerpt:"تا سال ۲۰۳۵، بیش از ۲۰۰ میلیون نفر با کمبود شدید آب مواجه خواهند شد.",
        excerptEn:"By 2035, over 200 million people will face severe water shortages.",
        excerptAr:"بحلول 2035 سيواجه أكثر من 200 مليون شخص شحاً حاداً في المياه.",
        body:"<p>سازمان ملل هشدار داد بحران آب خاورمیانه به نقطه غیرقابل بازگشت نزدیک می‌شود.</p>",
        bodyEn:"<p>The UN warned the Middle East water crisis is approaching a point of no return.</p>",
        bodyAr:"<p>حذّرت الأمم المتحدة من اقتراب أزمة المياه من نقطة اللاعودة.</p>",
      },
      {
        id:"news-5", category:"tech", status:"published", views:28900, readingTime:"۴ دقیقه", createdAt:"2026-06-06T22:00:00Z",
        author:"آرش محمودی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=15",
        image:"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&q=80",
        tags:["اپل","آیفون","موبایل"],
        title:"اپل از iPhone 18 رونمایی کرد: صفحه‌نمایش هولوگرافیک و باتری ۵ روزه",
        titleEn:"Apple Unveils iPhone 18: Holographic Display and 5-Day Battery",
        titleAr:"آبل تكشف عن iPhone 18: شاشة هولوغرافية وبطارية 5 أيام",
        excerpt:"اپل مدل جدید آیفون را با فناوری‌های انقلابی معرفی کرد.",
        excerptEn:"Apple introduced the new iPhone with revolutionary technologies.",
        excerptAr:"قدّمت آبل نموذج iPhone الجديد بتقنيات ثورية.",
        body:"<p>iPhone 18 اولین گوشی با صفحه هولوگرافیک است.</p><h3>ویژگی‌ها</h3><p>باتری گرافن تا ۵ روز دوام دارد.</p>",
        bodyEn:"<p>iPhone 18 is the world's first commercial smartphone with a holographic display.</p>",
        bodyAr:"<p>iPhone 18 أول هاتف تجاري بشاشة هولوغرافية.</p>",
      },
      {
        id:"news-6", category:"politics", status:"published", views:4100, readingTime:"۵ دقیقه", createdAt:"2026-06-06T18:00:00Z",
        author:"فرزانه کاظمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=20",
        image:"https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=900&q=80",
        tags:["بریکس","سیاست بین‌الملل"],
        title:"نشست بریکس: ۲۴ کشور جدید درخواست عضویت دادند",
        titleEn:"BRICS Summit: 24 New Countries Apply for Membership",
        titleAr:"قمة بريكس: 24 دولة جديدة تتقدم بطلبات العضوية",
        excerpt:"در اجلاس این هفته بریکس، ۲۴ کشور درخواست رسمی عضویت ارسال کردند.",
        excerptEn:"At this week's BRICS summit, 24 countries formally applied for membership.",
        excerptAr:"قدّمت 24 دولة طلبات عضوية رسمية في قمة بريكس.",
        body:"<p>اجلاس بریکس این هفته: ۲۴ کشور جدید درخواست عضویت ارسال کردند.</p>",
        bodyEn:"<p>24 new countries submitted formal BRICS membership applications.</p>",
        bodyAr:"<p>قدّمت 24 دولة جديدة طلبات عضوية في بريكس.</p>",
      },
      {
        id:"news-7", category:"culture", status:"published", views:18300, readingTime:"۳ دقیقه", createdAt:"2026-06-06T14:00:00Z",
        author:"نیلوفر رحیمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=25",
        image:"https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&q=80",
        tags:["سینما","جشنواره کن","فرهنگ"],
        title:"جشنواره فیلم کن: فیلم ایرانی «سایه‌های دور» جایزه طلایی نخل را از آن خود کرد",
        titleEn:"Cannes: Iranian Film 'Distant Shadows' Wins Palme d'Or",
        titleAr:"كان: الفيلم الإيراني يفوز بالسعفة الذهبية",
        excerpt:"کارگردان جوان ایرانی بزرگترین جایزه سینمای جهان را برد.",
        excerptEn:"A young Iranian director won cinema's greatest prize.",
        excerptAr:"مخرج إيراني شاب يفوز بأكبر جوائز السينما.",
        body:"<p>کارگردان ایرانی جایزه نخل طلایی کن را کسب کرد.</p><h3>درباره فیلم</h3><p>«سایه‌های دور» داستان یک خانواده مهاجر ایرانی در اروپاست.</p>",
        bodyEn:"<p>An Iranian director won the Palme d'Or at Cannes.</p>",
        bodyAr:"<p>فاز مخرج إيراني بالسعفة الذهبية في مهرجان كان.</p>",
      },
      {
        id:"news-8", category:"economy", status:"published", views:9800, readingTime:"۳ دقیقه", createdAt:"2026-06-06T10:00:00Z",
        author:"علیرضا تهرانی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=30",
        image:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80",
        tags:["بورس","اقتصاد","سرمایه‌گذاری"],
        title:"بورس تهران ۳.۸ درصد رشد کرد؛ خودرو و پتروشیمی پیشتاز بودند",
        titleEn:"Tehran Stock Exchange Grows 3.8%",
        titleAr:"بورصة طهران ترتفع 3.8٪",
        excerpt:"شاخص کل بورس تهران با رشد ۳.۸ درصدی روز خوبی را پشت سر گذاشت.",
        excerptEn:"Tehran's main stock index grew 3.8% yesterday.",
        excerptAr:"ارتفع المؤشر الرئيسي لبورصة طهران 3.8٪.",
        body:"<p>بورس تهران یکی از بهترین روزهای سال را تجربه کرد.</p>",
        bodyEn:"<p>The Tehran Stock Exchange had one of its best days of the year.</p>",
        bodyAr:"<p>شهدت بورصة طهران أحد أفضل أيامها.</p>",
      },
    ],
    comments: [
      { id:"c-1", newsId:"news-1", newsTitle:"هوش مصنوعی AGI",  userId:"user-1", userName:"سارا احمدی", userAvatar:"https://i.pravatar.cc/40?img=5", text:"مقاله بسیار جالبی بود، ممنون!", status:"approved", createdAt:"2026-06-07T07:00:00Z" },
      { id:"c-2", newsId:"news-2", newsTitle:"بازار نفت",        userId:"user-2", userName:"رضا ملکی",   userAvatar:"https://i.pravatar.cc/40?img=8", text:"چرا قیمت نفت اینقدر بالا رفته؟",  status:"pending",  createdAt:"2026-06-07T06:30:00Z" },
      { id:"c-3", newsId:"news-3", newsTitle:"تیم ملی فوتبال",  userId:"user-1", userName:"سارا احمدی", userAvatar:"https://i.pravatar.cc/40?img=5", text:"واقعاً افتخار کردم بهشون!",       status:"approved", createdAt:"2026-06-07T05:00:00Z" },
      { id:"c-4", newsId:"news-7", newsTitle:"جشنواره کن",      userId:"user-2", userName:"رضا ملکی",   userAvatar:"https://i.pravatar.cc/40?img=8", text:"آیا این فیلم در ایران اکران می‌شود؟", status:"pending", createdAt:"2026-06-06T20:00:00Z" },
      { id:"c-5", newsId:"news-8", newsTitle:"بورس تهران",      userId:"user-1", userName:"سارا احمدی", userAvatar:"https://i.pravatar.cc/40?img=5", text:"اطلاعات دقیق و به موقع. ممنون.",  status:"pending",  createdAt:"2026-06-06T15:00:00Z" },
    ],
  };
  writeDB(db);
}

// ─── Boot: اگه فایل نبود seed کن ─────────────────────────────────────────────
;(function boot() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) seedDB();
})();

// ─── Query helpers — همیشه از فایل می‌خوانند ─────────────────────────────────

export const userQueries = {
  findByEmail(email: string): DBUser | undefined {
    return readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findById(id: string): DBUser | undefined {
    return readDB().users.find(u => u.id === id);
  },
  getAll(): DBUser[] {
    return readDB().users.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  insert(user: DBUser): void {
    const db = readDB();
    db.users.push(user);
    writeDB(db);
  },
  delete(id: string): void {
    const db = readDB();
    db.users = db.users.filter(u => u.id !== id);
    writeDB(db);
  },
};

export const newsQueries = {
  getAll(): DBNews[] {
    return readDB().news.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getPublished(): DBNews[] {
    return this.getAll().filter(n => n.status === "published");
  },
  findById(id: string): DBNews | undefined {
    return readDB().news.find(n => n.id === id);
  },
  search(opts: { isAdmin:boolean; category:string; search:string; limit:number; offset:number }): DBNews[] {
    let list = opts.isAdmin ? this.getAll() : this.getPublished();
    if (opts.category && opts.category !== "all") list = list.filter(n => n.category === opts.category);
    if (opts.search) {
      const q = opts.search.toLowerCase();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return list.slice(opts.offset, opts.offset + opts.limit);
  },
  count(opts: { isAdmin:boolean; category:string; search:string }): number {
    return this.search({ ...opts, limit:99999, offset:0 }).length;
  },
  insert(item: DBNews): void {
    const db = readDB();
    db.news.unshift(item);
    writeDB(db);
  },
  update(id: string, updates: Partial<DBNews>): void {
    const db = readDB();
    const i = db.news.findIndex(n => n.id === id);
    if (i !== -1) { db.news[i] = { ...db.news[i], ...updates }; writeDB(db); }
  },
  incrementViews(id: string): void {
    const db = readDB();
    const item = db.news.find(n => n.id === id);
    if (item) { item.views += 1; writeDB(db); }
  },
  delete(id: string): void {
    const db = readDB();
    db.news = db.news.filter(n => n.id !== id);
    writeDB(db);
  },
};

export const commentQueries = {
  getAll(): DBComment[] {
    return readDB().comments.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getApproved(newsId: string): DBComment[] {
    return this.getAll().filter(c => c.newsId === newsId && c.status === "approved");
  },
  getByNews(newsId: string): DBComment[] {
    return this.getAll().filter(c => c.newsId === newsId);
  },
  insert(comment: DBComment): void {
    const db = readDB();
    db.comments.unshift(comment);
    writeDB(db);
  },
  updateStatus(id: string, status: DBComment["status"]): void {
    const db = readDB();
    const c = db.comments.find(x => x.id === id);
    if (c) { c.status = status; writeDB(db); }
  },
  delete(id: string): void {
    const db = readDB();
    db.comments = db.comments.filter(c => c.id !== id);
    writeDB(db);
  },
};
