/**
 * database.ts
 * SQLite persistent database using better-sqlite3.
 * The DB file is stored at: <project-root>/data/khabarlive.db
 * All tables are created on first run, then seed data is inserted once.
 */

import path from "path";
import fs from "fs";
import Database from "better-sqlite3";

// ── Ensure /data directory exists ──────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "khabarlive.db");

// ── Open / create database ─────────────────────────────────────────────────
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");   // better concurrent read performance
db.pragma("foreign_keys = ON");

// ── Create tables ──────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'user',
    avatar     TEXT,
    is_active  INTEGER NOT NULL DEFAULT 1,
    news_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS news (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    title_en    TEXT,
    title_ar    TEXT,
    excerpt     TEXT,
    excerpt_en  TEXT,
    excerpt_ar  TEXT,
    body        TEXT,
    body_en     TEXT,
    body_ar     TEXT,
    category    TEXT NOT NULL,
    image       TEXT,
    author      TEXT,
    author_id   TEXT,
    author_avatar TEXT,
    status      TEXT NOT NULL DEFAULT 'published',
    views       INTEGER NOT NULL DEFAULT 0,
    reading_time TEXT,
    tags        TEXT,          -- JSON array stored as string
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comments (
    id          TEXT PRIMARY KEY,
    news_id     TEXT NOT NULL,
    news_title  TEXT,
    user_id     TEXT NOT NULL,
    user_name   TEXT NOT NULL,
    user_avatar TEXT,
    text        TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending',
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS seed_done (
    id INTEGER PRIMARY KEY CHECK (id = 1)
  );
`);

// ── Seed initial data (runs only once) ─────────────────────────────────────
const alreadySeeded = db.prepare("SELECT id FROM seed_done WHERE id = 1").get();

if (!alreadySeeded) {
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, avatar, is_active, news_count, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertNews = db.prepare(`
    INSERT INTO news
      (id, title, title_en, title_ar, excerpt, excerpt_en, excerpt_ar,
       body, body_en, body_ar, category, image, author, author_id,
       author_avatar, status, views, reading_time, tags, created_at)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertComment = db.prepare(`
    INSERT INTO comments
      (id, news_id, news_title, user_id, user_name, user_avatar, text, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Passwords:
  //   admin  → Admin@1234   (stored as hashed_<base64>)
  //   users  → password     (stored as hashed_<base64>)
  const hashForSeed = (plain: string) =>
    "hashed_" + Buffer.from(plain).toString("base64");

  const seedAll = db.transaction(() => {
    // ── Users ──────────────────────────────────────────────────────────────
    insertUser.run(
      "admin-1", "علی رضایی", "admin@khabarlive.ir",
      hashForSeed("Admin@1234"), "admin",
      "https://i.pravatar.cc/80?img=3", 1, 142,
      "2024-01-01T00:00:00Z"
    );
    insertUser.run(
      "user-1", "سارا احمدی", "sara@example.com",
      hashForSeed("password"), "user",
      "https://i.pravatar.cc/80?img=5", 1, 0,
      "2024-02-15T00:00:00Z"
    );
    insertUser.run(
      "user-2", "رضا ملکی", "reza@example.com",
      hashForSeed("password"), "user",
      "https://i.pravatar.cc/80?img=8", 1, 0,
      "2024-03-10T00:00:00Z"
    );

    // ── News ───────────────────────────────────────────────────────────────
    const newsRows: any[][] = [
      [
        "news-1",
        "هوش مصنوعی AGI: دانشمندان اعلام کردند مرز بین هوش مصنوعی و هوش انسانی در حال محو شدن است",
        "AGI: Scientists Say the Line Between AI and Human Intelligence Is Fading",
        "الذكاء الاصطناعي العام: العلماء يعلنون تلاشي الحدود",
        "گروهی از محققان دانشگاه MIT اعلام کردند که آخرین نسل مدل‌های هوش مصنوعی توانایی انجام بیش از ۹۵٪ وظایف شناختی انسانی را دارند.",
        "MIT researchers announced that the latest AI models can perform over 95% of human cognitive tasks.",
        "أعلن باحثو MIT أن أحدث نماذج الذكاء الاصطناعي قادرة على أداء أكثر من 95٪ من المهام المعرفية البشرية.",
        "<p>محققان دانشگاه MIT در پژوهشی که امروز در ژورنال Science منتشر شد، اعلام کردند که مرز بین هوش مصنوعی عمومی (AGI) و هوش انسانی به سرعت در حال محو شدن است.</p><h3>چه چیزی تغییر کرده؟</h3><p>آنچه این آزمایش را از تحقیقات قبلی متمایز می‌کند، توانایی مدل در استدلال خلاقانه و حل مسائل بدون سابقه است.</p><blockquote>«ما در آستانه یک تحول بنیادین در تاریخ بشریت قرار داریم.» — دکتر سارا چن، MIT</blockquote>",
        "<p>MIT researchers published findings showing AI models now outperform average humans on over 95% of cognitive benchmarks.</p><h3>What Changed?</h3><p>Unlike previous systems that merely repeated learned patterns, these models can devise innovative solutions in entirely new situations.</p><blockquote>\"We stand at the threshold of a fundamental transformation in human history.\" — Dr. Sarah Chen, MIT</blockquote>",
        "<p>نشر باحثو MIT نتائج تُظهر أن نماذج الذكاء الاصطناعي تتفوق الآن على البشر في أكثر من 95٪ من المعايير المعرفية.</p>",
        "tech",
        "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80",
        "دکتر علی رضایی", "admin-1", "https://i.pravatar.cc/80?img=3",
        "published", 12400, "۵ دقیقه",
        JSON.stringify(["هوش مصنوعی","AGI","MIT","فناوری"]),
        "2026-06-07T06:00:00Z"
      ],
      [
        "news-2",
        "بازار جهانی نفت با رکورد تاریخی جدید مواجه شد؛ قیمت هر بشکه از ۱۲۰ دلار گذشت",
        "Global Oil Market Hits New Record: Barrel Price Exceeds $120",
        "سوق النفط العالمي يواجه رقماً قياسياً جديداً",
        "اوپک پلاس تصمیم گرفت تولید نفت را تا پایان سال محدود نگه دارد که این امر باعث جهش قیمت‌ها شد.",
        "OPEC+ decided to keep oil production limited until year-end, causing a price surge.",
        "قررت أوبك+ الإبقاء على إنتاج النفط محدوداً حتى نهاية العام.",
        "<p>بازار جهانی نفت دیروز با یک جهش تاریخی روبرو شد. قیمت هر بشکه نفت برنت برای اولین بار از سال ۲۰۲۲ از مرز ۱۲۰ دلار عبور کرد.</p><h3>دلایل افزایش قیمت</h3><p>تصمیم اوپک پلاس برای کاهش ۲ میلیون بشکه‌ای تولید روزانه، همراه با افزایش تقاضا از سوی اقتصادهای آسیایی، محرک اصلی این جهش قیمتی بود.</p>",
        "<p>The global oil market experienced a historic surge. Brent crude crossed $120 per barrel for the first time since 2022.</p>",
        "<p>شهد سوق النفط العالمي ارتفاعاً تاريخياً، إذ تجاوز سعر خام برنت 120 دولاراً للبرميل.</p>",
        "economy",
        "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=900&q=80",
        "مهندس سارا احمدی","admin-1","https://i.pravatar.cc/80?img=5",
        "published",8200,"۴ دقیقه",
        JSON.stringify(["نفت","اقتصاد","اوپک"]),
        "2026-06-07T05:15:00Z"
      ],
      [
        "news-3",
        "تیم ملی فوتبال ایران با پیروزی قاطع ۳ بر صفر راهی جام جهانی ۲۰۲۶ شد",
        "Iran National Football Team Qualifies for 2026 World Cup with 3-0 Victory",
        "المنتخب الإيراني يتأهل لكأس العالم 2026 بفوز حاسم 3-0",
        "با این پیروزی در بازی پلی‌آف، ایران سهمیه حضور در جام جهانی آمریکا، کانادا و مکزیک را کسب کرد.",
        "With this playoff victory, Iran secured a spot in the USA/Canada/Mexico World Cup.",
        "بهذا الفوز في ملحق التصفيات، ضمن إيران مكاناً في كأس العالم.",
        "<p>تیم ملی فوتبال ایران دیشب در یک بازی هیجان‌انگیز با نتیجه ۳ بر صفر حریف خود را شکست داد.</p><h3>گزارش بازی</h3><p>سردار آزمون در دقیقه ۲۳ اولین گل را به ثمر رساند.</p><blockquote>«این پیروزی به تمام ملت ایران تعلق دارد.»</blockquote>",
        "<p>Iran's national football team defeated their opponents 3-0 in a thrilling playoff match.</p>",
        "<p>هزم المنتخب الإيراني منافسه بنتيجة 3-0.</p>",
        "sport",
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80",
        "رضا ملکی","admin-1","https://i.pravatar.cc/80?img=8",
        "published",45100,"۳ دقیقه",
        JSON.stringify(["فوتبال","تیم ملی","جام جهانی"]),
        "2026-06-07T04:00:00Z"
      ],
      [
        "news-4",
        "سازمان ملل: بحران آب در خاورمیانه به نقطه بحرانی رسیده و نیاز به اقدام فوری دارد",
        "UN: Middle East Water Crisis Reaches Critical Point, Urgent Action Needed",
        "الأمم المتحدة: أزمة المياه في الشرق الأوسط وصلت لنقطة حرجة",
        "گزارش سازمان ملل هشدار می‌دهد که تا سال ۲۰۳۵، بیش از ۲۰۰ میلیون نفر با کمبود شدید آب مواجه خواهند شد.",
        "UN report warns that by 2035, over 200 million people will face severe water shortages.",
        "يحذر تقرير الأمم المتحدة من أنه بحلول 2035 سيواجه أكثر من 200 مليون شخص شحاً حاداً في المياه.",
        "<p>سازمان ملل متحد در گزارشی هشداردهنده اعلام کرد که بحران آب در منطقه خاورمیانه به نقطه‌ای غیرقابل بازگشت نزدیک می‌شود.</p><h3>ابعاد بحران</h3><p>پیش‌بینی‌ها نشان می‌دهد که تا سال ۲۰۳۵، بیش از ۲۰۰ میلیون نفر در معرض کمبود شدید آب قرار خواهند گرفت.</p>",
        "<p>The UN warned that the Middle East water crisis is approaching a point of no return.</p>",
        "<p>حذّرت الأمم المتحدة من أن أزمة المياه في الشرق الأوسط تقترب من نقطة اللاعودة.</p>",
        "world",
        "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80",
        "لیلا کریمی","admin-1","https://i.pravatar.cc/80?img=10",
        "published",6700,"۶ دقیقه",
        JSON.stringify(["آب","خاورمیانه","سازمان ملل"]),
        "2026-06-07T03:00:00Z"
      ],
      [
        "news-5",
        "اپل از iPhone 18 رونمایی کرد: صفحه‌نمایش هولوگرافیک و باتری ۵ روزه",
        "Apple Unveils iPhone 18: Holographic Display and 5-Day Battery",
        "آبل تكشف عن iPhone 18: شاشة هولوغرافية وبطارية لـ 5 أيام",
        "اپل در رویداد سالانه خود، مدل جدید آیفون را با فناوری‌های انقلابی معرفی کرد.",
        "Apple introduced the new iPhone model with revolutionary technologies at its annual event.",
        "قدّمت آبل نموذج iPhone الجديد بتقنيات ثورية في حدثها السنوي.",
        "<p>اپل دیروز در رویداد سالانه‌اش از iPhone 18 رونمایی کرد.</p><h3>ویژگی‌های انقلابی</h3><p>باتری جدید این دستگاه با فناوری گرافن، می‌تواند تا ۵ روز کامل با یک شارژ دوام بیاورد.</p>",
        "<p>Apple unveiled the iPhone 18 yesterday, the world's first commercial smartphone with a holographic display.</p>",
        "<p>كشفت آبل عن iPhone 18 أمس، أول هاتف ذكي تجاري يحمل شاشة هولوغرافية.</p>",
        "tech",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&q=80",
        "آرش محمودی","admin-1","https://i.pravatar.cc/80?img=15",
        "published",28900,"۴ دقیقه",
        JSON.stringify(["اپل","آیفون","موبایل"]),
        "2026-06-06T22:00:00Z"
      ],
      [
        "news-6",
        "نشست بریکس: ۲۴ کشور جدید درخواست عضویت دادند",
        "BRICS Summit: 24 New Countries Apply for Membership",
        "قمة بريكس: 24 دولة جديدة تتقدم بطلبات العضوية",
        "در اجلاس این هفته بریکس، درخواست عضویت ۲۴ کشور به صورت رسمی به دبیرخانه ارسال شد.",
        "At this week's BRICS summit, 24 countries formally submitted membership applications.",
        "في قمة بريكس هذا الأسبوع، قدّمت 24 دولة طلبات عضوية رسمية.",
        "<p>اجلاس بریکس این هفته با یک خبر مهم همراه بود: ۲۴ کشور جدید درخواست رسمی عضویت را ارسال کردند.</p>",
        "<p>This week's BRICS summit was accompanied by a major announcement: 24 new countries submitted formal membership applications.</p>",
        "<p>رافقت قمة بريكس إعلانات مهمة بتقدم 24 دولة جديدة بطلبات عضوية رسمية.</p>",
        "politics",
        "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=900&q=80",
        "فرزانه کاظمی","admin-1","https://i.pravatar.cc/80?img=20",
        "published",4100,"۵ دقیقه",
        JSON.stringify(["بریکس","سیاست بین‌الملل"]),
        "2026-06-06T18:00:00Z"
      ],
      [
        "news-7",
        "جشنواره فیلم کن: فیلم ایرانی «سایه‌های دور» جایزه طلایی نخل را از آن خود کرد",
        "Cannes Film Festival: Iranian Film 'Distant Shadows' Wins Palme d'Or",
        "مهرجان كان: الفيلم الإيراني 'ظلال بعيدة' يفوز بالسعفة الذهبية",
        "کارگردان جوان ایرانی با اثری درباره زندگی مهاجران، بزرگترین جایزه سینمای جهان را برد.",
        "A young Iranian director won cinema's greatest prize with a film about migrant life.",
        "مخرج إيراني شاب يفوز بأكبر جوائز السينما العالمية بفيلم عن حياة المهاجرين.",
        "<p>در هفتادوهشتمین دوره جشنواره فیلم کن، کارگردان جوان ایرانی موفق شد جایزه نخل طلایی را کسب کند.</p><h3>درباره فیلم</h3><p>«سایه‌های دور» روایتی تکان‌دهنده از زندگی یک خانواده مهاجر ایرانی در اروپاست.</p>",
        "<p>At the 78th Cannes Film Festival, a young Iranian director won the Palme d'Or.</p>",
        "<p>في الدورة الثامنة والسبعين لمهرجان كان، فاز مخرج إيراني شاب بالسعفة الذهبية.</p>",
        "culture",
        "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&q=80",
        "نیلوفر رحیمی","admin-1","https://i.pravatar.cc/80?img=25",
        "published",18300,"۳ دقیقه",
        JSON.stringify(["سینما","جشنواره کن","فرهنگ"]),
        "2026-06-06T14:00:00Z"
      ],
      [
        "news-8",
        "بورس تهران ۳.۸ درصد رشد کرد؛ صنعت خودرو و پتروشیمی پیشتاز بودند",
        "Tehran Stock Exchange Grows 3.8%: Auto and Petrochemical Sectors Lead",
        "بورصة طهران ترتفع 3.8٪: قطاعا السيارات والبتروكيماويات في الصدارة",
        "شاخص کل بورس تهران با رشد چشمگیر ۳.۸ درصدی روز خوبی را پشت سر گذاشت.",
        "Tehran's main stock index grew by a remarkable 3.8% yesterday.",
        "ارتفع المؤشر الرئيسي لبورصة طهران بنسبة ملحوظة بلغت 3.8٪ أمس.",
        "<p>بورس اوراق بهادار تهران روز گذشته یکی از بهترین روزهای خود در سال جاری را تجربه کرد.</p><h3>پیشتازان بازار</h3><p>سهام شرکت‌های پتروشیمی و خودروسازی بیشترین رشد را داشتند.</p>",
        "<p>The Tehran Stock Exchange had one of its best days of the year yesterday.</p>",
        "<p>شهدت بورصة طهران أمس أحد أفضل أيامها في العام الحالي.</p>",
        "economy",
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80",
        "علیرضا تهرانی","admin-1","https://i.pravatar.cc/80?img=30",
        "published",9800,"۳ دقیقه",
        JSON.stringify(["بورس","اقتصاد","سرمایه‌گذاری"]),
        "2026-06-06T10:00:00Z"
      ],
    ];

    for (const row of newsRows) insertNews.run(...row);

    // ── Comments ───────────────────────────────────────────────────────────
    const commentRows = [
      ["c-1","news-1","هوش مصنوعی AGI","user-1","سارا احمدی","https://i.pravatar.cc/40?img=5","مقاله بسیار جالبی بود، ممنون از تیم خبری!","approved","2026-06-07T07:00:00Z"],
      ["c-2","news-2","بازار نفت","user-2","رضا ملکی","https://i.pravatar.cc/40?img=8","چرا قیمت نفت اینقدر سریع بالا رفته؟","pending","2026-06-07T06:30:00Z"],
      ["c-3","news-3","تیم ملی فوتبال","user-1","سارا احمدی","https://i.pravatar.cc/40?img=5","واقعاً افتخار کردم بهشون!","approved","2026-06-07T05:00:00Z"],
      ["c-4","news-7","جشنواره کن","user-2","رضا ملکی","https://i.pravatar.cc/40?img=8","آیا این فیلم به زودی در ایران اکران می‌شود؟","pending","2026-06-06T20:00:00Z"],
      ["c-5","news-8","بورس تهران","user-1","سارا احمدی","https://i.pravatar.cc/40?img=5","اطلاعات دقیق و به موقع. ممنون.","pending","2026-06-06T15:00:00Z"],
    ];
    for (const row of commentRows) insertComment.run(...row);

    db.prepare("INSERT INTO seed_done (id) VALUES (1)").run();
  });

  seedAll();
}

// ── Typed helpers ──────────────────────────────────────────────────────────

export interface DBUser {
  id: string; name: string; email: string; password: string;
  role: "admin" | "user"; avatar: string | null;
  is_active: number; news_count: number; created_at: string;
}

export interface DBNews {
  id: string; title: string; title_en: string | null; title_ar: string | null;
  excerpt: string | null; excerpt_en: string | null; excerpt_ar: string | null;
  body: string | null; body_en: string | null; body_ar: string | null;
  category: string; image: string | null;
  author: string | null; author_id: string | null; author_avatar: string | null;
  status: string; views: number; reading_time: string | null;
  tags: string | null; created_at: string;
}

export interface DBComment {
  id: string; news_id: string; news_title: string | null;
  user_id: string; user_name: string; user_avatar: string | null;
  text: string; status: string; created_at: string;
}

// ── User queries ───────────────────────────────────────────────────────────
export const userQueries = {
  findByEmail: db.prepare<[string]>("SELECT * FROM users WHERE LOWER(email) = LOWER(?)"),
  findById:    db.prepare<[string]>("SELECT * FROM users WHERE id = ?"),
  getAll:      db.prepare("SELECT * FROM users ORDER BY created_at DESC"),
  insert:      db.prepare(`
    INSERT INTO users (id,name,email,password,role,avatar,is_active,news_count,created_at)
    VALUES (@id,@name,@email,@password,@role,@avatar,@is_active,@news_count,@created_at)
  `),
  delete:      db.prepare<[string]>("DELETE FROM users WHERE id = ?"),
};

// ── News queries ───────────────────────────────────────────────────────────
export const newsQueries = {
  getAll:      db.prepare("SELECT * FROM news ORDER BY created_at DESC"),
  getPublished:db.prepare("SELECT * FROM news WHERE status = 'published' ORDER BY created_at DESC"),
  findById:    db.prepare<[string]>("SELECT * FROM news WHERE id = ?"),
  insert:      db.prepare(`
    INSERT INTO news
      (id,title,title_en,title_ar,excerpt,excerpt_en,excerpt_ar,
       body,body_en,body_ar,category,image,author,author_id,
       author_avatar,status,views,reading_time,tags,created_at)
    VALUES
      (@id,@title,@title_en,@title_ar,@excerpt,@excerpt_en,@excerpt_ar,
       @body,@body_en,@body_ar,@category,@image,@author,@author_id,
       @author_avatar,@status,@views,@reading_time,@tags,@created_at)
  `),
  update:      db.prepare(`
    UPDATE news SET
      title=@title,title_en=@title_en,title_ar=@title_ar,
      excerpt=@excerpt,body=@body,category=@category,
      image=@image,status=@status,tags=@tags
    WHERE id=@id
  `),
  incrementViews: db.prepare<[string]>("UPDATE news SET views = views + 1 WHERE id = ?"),
  delete:      db.prepare<[string]>("DELETE FROM news WHERE id = ?"),
  search:      db.prepare(`
    SELECT * FROM news
    WHERE (status = 'published' OR @isAdmin = 1)
      AND (@category = 'all' OR category = @category)
      AND (@search = '' OR LOWER(title) LIKE @search OR LOWER(excerpt) LIKE @search)
    ORDER BY created_at DESC
    LIMIT @limit OFFSET @offset
  `),
  count:       db.prepare(`
    SELECT COUNT(*) as total FROM news
    WHERE (status = 'published' OR @isAdmin = 1)
      AND (@category = 'all' OR category = @category)
      AND (@search = '' OR LOWER(title) LIKE @search OR LOWER(excerpt) LIKE @search)
  `),
};

// ── Comment queries ────────────────────────────────────────────────────────
export const commentQueries = {
  getAll:      db.prepare("SELECT * FROM comments ORDER BY created_at DESC"),
  getApproved: db.prepare<[string]>("SELECT * FROM comments WHERE news_id = ? AND status = 'approved' ORDER BY created_at DESC"),
  getByNews:   db.prepare<[string]>("SELECT * FROM comments WHERE news_id = ? ORDER BY created_at DESC"),
  insert:      db.prepare(`
    INSERT INTO comments
      (id,news_id,news_title,user_id,user_name,user_avatar,text,status,created_at)
    VALUES
      (@id,@news_id,@news_title,@user_id,@user_name,@user_avatar,@text,@status,@created_at)
  `),
  updateStatus:db.prepare<[string,string]>("UPDATE comments SET status = ? WHERE id = ?"),
  delete:      db.prepare<[string]>("DELETE FROM comments WHERE id = ?"),
};

export default db;
