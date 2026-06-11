/**
 * database.ts — JSON file-based persistent database
 * data/db.json — no native packages needed
 */
import fs   from "fs";
import path from "path";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBUser {
  id: string; name: string; email: string; password: string;
  role: "admin"|"user"; avatar: string;
  isActive: boolean; newsCount: number; createdAt: string;
}

export interface DBNews {
  id: string; title: string; titleEn: string; titleAr: string;
  excerpt: string; excerptEn: string; excerptAr: string;
  body: string; bodyEn: string; bodyAr: string;
  category: string; image: string;
  author: string; authorId: string; authorAvatar: string;
  status: "published"|"draft"|"review";
  views: number; readingTime: string; tags: string[];
  createdAt: string;
  source?: string;       // خبرگزاری منبع (اختیاری)
  sourceUrl?: string;    // لینک منبع اصلی
}

export interface DBComment {
  id: string; newsId: string; newsTitle: string;
  userId: string; userName: string; userAvatar: string;
  text: string; status: "pending"|"approved"|"rejected"; createdAt: string;
}

export interface DBCategory {
  id: string; key: string;
  labelFa: string; labelEn: string; labelAr: string;
  icon: string; color: string; bg: string;
  isActive: boolean; createdAt: string;
}

interface JsonDB {
  users:      DBUser[];
  news:       DBNews[];
  comments:   DBComment[];
  categories: DBCategory[];
  pinnedIds:  string[];     // حداکثر ۴ خبر پین‌شده برای هیرو
  seeded:     boolean;
}

// ─── Paths ────────────────────────────────────────────────────────────────────
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE  = path.join(DATA_DIR, "db.json");

// ─── Hash helpers ─────────────────────────────────────────────────────────────
export function makeHash(plain: string): string {
  return "hashed_" + Buffer.from(plain, "utf8").toString("base64");
}
export function checkHash(plain: string, hash: string): boolean {
  if (!hash?.startsWith("hashed_")) return false;
  try { return Buffer.from(hash.slice(7), "base64").toString("utf8") === plain; }
  catch { return false; }
}

// ─── I/O ──────────────────────────────────────────────────────────────────────
function readDB(): JsonDB {
  try {
    if (!fs.existsSync(DB_FILE)) return emptyDB();
    const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as JsonDB;
    // backfill fields added later
    if (!data.categories) data.categories = defaultCategories();
    if (!data.pinnedIds)  data.pinnedIds  = [];
    return data;
  } catch { return emptyDB(); }
}
function writeDB(data: JsonDB): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}
function emptyDB(): JsonDB {
  return { users:[], news:[], comments:[], categories:[], pinnedIds:[], seeded:false };
}

// ─── Default categories ───────────────────────────────────────────────────────
function defaultCategories(): DBCategory[] {
  return [
    { id:"cat-1", key:"tech",     labelFa:"فناوری",  labelEn:"Technology", labelAr:"التكنولوجيا", icon:"💻", color:"#457b9d", bg:"rgba(69,123,157,0.85)",  isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-2", key:"economy",  labelFa:"اقتصاد",  labelEn:"Economy",    labelAr:"الاقتصاد",    icon:"📈", color:"#f4a261", bg:"rgba(244,162,97,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-3", key:"sport",    labelFa:"ورزش",    labelEn:"Sports",     labelAr:"الرياضة",     icon:"⚽", color:"#2d9a6b", bg:"rgba(45,154,107,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-4", key:"world",    labelFa:"جهان",    labelEn:"World",      labelAr:"العالم",      icon:"🌍", color:"#7c3aed", bg:"rgba(124,58,237,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-5", key:"politics", labelFa:"سیاسی",   labelEn:"Politics",   labelAr:"السياسة",     icon:"🏛", color:"#ea580c", bg:"rgba(234,88,12,0.85)",  isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-6", key:"culture",  labelFa:"فرهنگ",   labelEn:"Culture",    labelAr:"الثقافة",     icon:"🎨", color:"#db2777", bg:"rgba(219,39,119,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
  ];
}

// ─── Seed ─────────────────────────────────────────────────────────────────────
function buildSeed(): JsonDB {
  return {
    seeded: true,
    categories: defaultCategories(),
    pinnedIds: ["news-1","news-2","news-3","news-4"],
    users: [
      { id:"admin-1", name:"علی رضایی",  email:"admin@khabarlive.ir", password:makeHash("Admin@1234"), role:"admin", avatar:"https://i.pravatar.cc/80?img=3",  isActive:true, newsCount:142, createdAt:"2024-01-01T00:00:00Z" },
      { id:"user-1",  name:"سارا احمدی", email:"sara@example.com",    password:makeHash("password"),   role:"user",  avatar:"https://i.pravatar.cc/80?img=5",  isActive:true, newsCount:0,   createdAt:"2024-02-15T00:00:00Z" },
      { id:"user-2",  name:"رضا ملکی",   email:"reza@example.com",    password:makeHash("password"),   role:"user",  avatar:"https://i.pravatar.cc/80?img=8",  isActive:true, newsCount:0,   createdAt:"2024-03-10T00:00:00Z" },
    ],
    news: [
      { id:"news-1", category:"tech", status:"published", views:12400, readingTime:"۵ دقیقه", createdAt:"2026-06-07T06:00:00Z", author:"دکتر علی رضایی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=3", image:"https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80", tags:["هوش مصنوعی","AGI","MIT","فناوری"], title:"هوش مصنوعی AGI: دانشمندان اعلام کردند مرز بین هوش مصنوعی و هوش انسانی در حال محو شدن است", titleEn:"AGI: Scientists Say the Line Between AI and Human Intelligence Is Fading", titleAr:"الذكاء الاصطناعي العام: العلماء يعلنون تلاشي الحدود", excerpt:"گروهی از محققان دانشگاه MIT اعلام کردند که آخرین نسل مدل‌های هوش مصنوعی توانایی انجام بیش از ۹۵٪ وظایف شناختی انسانی را دارند.", excerptEn:"MIT researchers announced that the latest AI models can perform over 95% of human cognitive tasks.", excerptAr:"أعلن باحثو MIT أن أحدث نماذج الذكاء الاصطناعي قادرة على أداء أكثر من 95٪ من المهام.", body:"<p>محققان MIT اعلام کردند مرز AGI و هوش انسانی محو می‌شود.</p><h3>چه چیزی تغییر کرده؟</h3><p>مدل‌های جدید در موقعیت‌های کاملاً جدید راه‌حل ارائه می‌دهند.</p><blockquote>«ما در آستانه یک تحول بنیادین قرار داریم.» — دکتر سارا چن</blockquote>", bodyEn:"<p>MIT researchers say AI models now outperform average humans on over 95% of cognitive benchmarks.</p>", bodyAr:"<p>نشر باحثو MIT نتائج تُظهر تفوق نماذج الذكاء الاصطناعي في أكثر من 95٪ من المعايير.</p>" },
      { id:"news-2", category:"economy", status:"published", views:8200, readingTime:"۴ دقیقه", createdAt:"2026-06-07T05:15:00Z", author:"مهندس سارا احمدی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=5", image:"https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=900&q=80", tags:["نفت","اقتصاد","اوپک"], title:"بازار جهانی نفت با رکورد تاریخی جدید مواجه شد؛ قیمت هر بشکه از ۱۲۰ دلار گذشت", titleEn:"Global Oil Market Hits New Record: Barrel Price Exceeds $120", titleAr:"سوق النفط العالمي يواجه رقماً قياسياً جديداً", excerpt:"اوپک پلاس تصمیم گرفت تولید نفت را محدود نگه دارد.", excerptEn:"OPEC+ decided to keep oil production limited until year-end.", excerptAr:"قررت أوبك+ الإبقاء على إنتاج النفط محدوداً.", body:"<p>قیمت نفت برنت از ۱۲۰ دلار گذشت.</p><h3>دلایل</h3><p>کاهش تولید اوپک پلاس محرک اصلی بود.</p>", bodyEn:"<p>Brent crude crossed $120 per barrel for the first time since 2022.</p>", bodyAr:"<p>تجاوز سعر خام برنت 120 دولاراً للبرميل.</p>" },
      { id:"news-3", category:"sport", status:"published", views:45100, readingTime:"۳ دقیقه", createdAt:"2026-06-07T04:00:00Z", author:"رضا ملکی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=8", image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80", tags:["فوتبال","تیم ملی","جام جهانی"], title:"تیم ملی فوتبال ایران با پیروزی قاطع ۳ بر صفر راهی جام جهانی ۲۰۲۶ شد", titleEn:"Iran National Football Team Qualifies for 2026 World Cup with 3-0 Victory", titleAr:"المنتخب الإيراني يتأهل لكأس العالم 2026 بفوز حاسم 3-0", excerpt:"با این پیروزی در بازی پلی‌آف، ایران سهمیه جام جهانی را کسب کرد.", excerptEn:"With this playoff victory, Iran secured a spot in the World Cup.", excerptAr:"ضمن إيران مكاناً في كأس العالم بهذا الفوز.", body:"<p>تیم ملی ایران با نتیجه ۳ بر صفر حریف را شکست داد.</p><blockquote>«این پیروزی به تمام ملت ایران تعلق دارد.»</blockquote>", bodyEn:"<p>Iran's national team defeated their opponents 3-0.</p>", bodyAr:"<p>هزم المنتخب الإيراني منافسه بنتيجة 3-0.</p>" },
      { id:"news-4", category:"world", status:"published", views:6700, readingTime:"۶ دقیقه", createdAt:"2026-06-07T03:00:00Z", author:"لیلا کریمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=10", image:"https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80", tags:["آب","خاورمیانه","سازمان ملل"], title:"سازمان ملل: بحران آب در خاورمیانه به نقطه بحرانی رسیده", titleEn:"UN: Middle East Water Crisis Reaches Critical Point", titleAr:"الأمم المتحدة: أزمة المياه وصلت لنقطة حرجة", excerpt:"تا سال ۲۰۳۵، بیش از ۲۰۰ میلیون نفر با کمبود آب مواجه خواهند شد.", excerptEn:"By 2035, over 200 million people will face severe water shortages.", excerptAr:"بحلول 2035 سيواجه 200 مليون شخص شحاً في المياه.", body:"<p>سازمان ملل هشدار داد بحران آب خاورمیانه حاد می‌شود.</p>", bodyEn:"<p>The UN warned the Middle East water crisis is approaching a point of no return.</p>", bodyAr:"<p>حذّرت الأمم المتحدة من تفاقم أزمة المياه في الشرق الأوسط.</p>" },
      { id:"news-5", category:"tech", status:"published", views:28900, readingTime:"۴ دقیقه", createdAt:"2026-06-06T22:00:00Z", author:"آرش محمودی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=15", image:"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&q=80", tags:["اپل","آیفون","موبایل"], title:"اپل از iPhone 18 رونمایی کرد: صفحه‌نمایش هولوگرافیک و باتری ۵ روزه", titleEn:"Apple Unveils iPhone 18: Holographic Display and 5-Day Battery", titleAr:"آبل تكشف عن iPhone 18: شاشة هولوغرافية وبطارية 5 أيام", excerpt:"اپل مدل جدید آیفون را با فناوری‌های انقلابی معرفی کرد.", excerptEn:"Apple introduced the new iPhone with revolutionary technologies.", excerptAr:"قدّمت آبل نموذج iPhone الجديد بتقنيات ثورية.", body:"<p>iPhone 18 اولین گوشی با صفحه هولوگرافیک است.</p>", bodyEn:"<p>iPhone 18 is the world's first commercial smartphone with a holographic display.</p>", bodyAr:"<p>iPhone 18 أول هاتف تجاري بشاشة هولوغرافية.</p>" },
      { id:"news-6", category:"politics", status:"published", views:4100, readingTime:"۵ دقیقه", createdAt:"2026-06-06T18:00:00Z", author:"فرزانه کاظمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=20", image:"https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=900&q=80", tags:["بریکس","سیاست بین‌الملل"], title:"نشست بریکس: ۲۴ کشور جدید درخواست عضویت دادند", titleEn:"BRICS Summit: 24 New Countries Apply for Membership", titleAr:"قمة بريكس: 24 دولة جديدة تتقدم بطلبات العضوية", excerpt:"در اجلاس بریکس، ۲۴ کشور درخواست رسمی عضویت ارسال کردند.", excerptEn:"At this week's BRICS summit, 24 countries formally applied for membership.", excerptAr:"قدّمت 24 دولة طلبات عضوية رسمية.", body:"<p>اجلاس بریکس: ۲۴ کشور درخواست عضویت ارسال کردند.</p>", bodyEn:"<p>24 new countries submitted formal BRICS membership applications.</p>", bodyAr:"<p>قدّمت 24 دولة جديدة طلبات عضوية في بريكس.</p>" },
      { id:"news-7", category:"culture", status:"published", views:18300, readingTime:"۳ دقیقه", createdAt:"2026-06-06T14:00:00Z", author:"نیلوفر رحیمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=25", image:"https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&q=80", tags:["سینما","جشنواره کن","فرهنگ"], title:"جشنواره فیلم کن: فیلم ایرانی «سایه‌های دور» جایزه طلایی نخل را از آن خود کرد", titleEn:"Cannes: Iranian Film 'Distant Shadows' Wins Palme d'Or", titleAr:"كان: الفيلم الإيراني يفوز بالسعفة الذهبية", excerpt:"کارگردان جوان ایرانی بزرگترین جایزه سینمای جهان را برد.", excerptEn:"A young Iranian director won cinema's greatest prize.", excerptAr:"مخرج إيراني شاب يفوز بأكبر جوائز السينما.", body:"<p>کارگردان ایرانی جایزه نخل طلایی کن را کسب کرد.</p>", bodyEn:"<p>An Iranian director won the Palme d'Or at Cannes.</p>", bodyAr:"<p>فاز مخرج إيراني بالسعفة الذهبية في مهرجان كان.</p>" },
      { id:"news-8", category:"economy", status:"published", views:9800, readingTime:"۳ دقیقه", createdAt:"2026-06-06T10:00:00Z", author:"علیرضا تهرانی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=30", image:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80", tags:["بورس","اقتصاد"], title:"بورس تهران ۳.۸ درصد رشد کرد؛ خودرو و پتروشیمی پیشتاز بودند", titleEn:"Tehran Stock Exchange Grows 3.8%", titleAr:"بورصة طهران ترتفع 3.8٪", excerpt:"شاخص کل بورس تهران با رشد ۳.۸ درصدی روز خوبی پشت سر گذاشت.", excerptEn:"Tehran's main stock index grew 3.8% yesterday.", excerptAr:"ارتفع المؤشر الرئيسي لبورصة طهران 3.8٪.", body:"<p>بورس تهران یکی از بهترین روزهای سال را تجربه کرد.</p>", bodyEn:"<p>The Tehran Stock Exchange had one of its best days of the year.</p>", bodyAr:"<p>شهدت بورصة طهران أحد أفضل أيامها.</p>" },
    ],
    comments: [
      { id:"c-1", newsId:"news-1", newsTitle:"هوش مصنوعی AGI",  userId:"user-1", userName:"سارا احمدی", userAvatar:"https://i.pravatar.cc/40?img=5", text:"مقاله بسیار جالبی بود!", status:"approved", createdAt:"2026-06-07T07:00:00Z" },
      { id:"c-2", newsId:"news-2", newsTitle:"بازار نفت",        userId:"user-2", userName:"رضا ملکی",   userAvatar:"https://i.pravatar.cc/40?img=8", text:"چرا قیمت نفت بالا رفته؟",  status:"pending",  createdAt:"2026-06-07T06:30:00Z" },
      { id:"c-3", newsId:"news-3", newsTitle:"تیم ملی فوتبال",  userId:"user-1", userName:"سارا احمدی", userAvatar:"https://i.pravatar.cc/40?img=5", text:"واقعاً افتخار کردم!",     status:"approved", createdAt:"2026-06-07T05:00:00Z" },
    ],
  };
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
;(function boot() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) { writeDB(buildSeed()); return; }
  try {
    const db = readDB();
    const admin = db.users.find(u => u.id === "admin-1");
    const correctHash = makeHash("Admin@1234");
    let dirty = false;
    if (!admin) { db.users.unshift({ id:"admin-1", name:"علی رضایی", email:"admin@khabarlive.ir", password:correctHash, role:"admin", avatar:"https://i.pravatar.cc/80?img=3", isActive:true, newsCount:142, createdAt:"2024-01-01T00:00:00Z" }); dirty=true; }
    else if (!checkHash("Admin@1234", admin.password)) { admin.password = correctHash; dirty=true; }
    if (!db.categories?.length) { db.categories = defaultCategories(); dirty=true; }
    if (!db.pinnedIds) { db.pinnedIds = []; dirty=true; }
    if (dirty) writeDB(db);
  } catch { writeDB(buildSeed()); }
})();

// ─── Query helpers ────────────────────────────────────────────────────────────

export const userQueries = {
  findByEmail: (email: string) => readDB().users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  findById:    (id: string)    => readDB().users.find(u => u.id === id),
  getAll:      ()              => readDB().users.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  insert(user: DBUser) { const db=readDB(); db.users.push(user); writeDB(db); },
  delete(id: string)   { const db=readDB(); db.users=db.users.filter(u=>u.id!==id); writeDB(db); },
};

export const newsQueries = {
  getAll():       DBNews[] { return readDB().news.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); },
  getPublished(): DBNews[] { return this.getAll().filter(n=>n.status==="published"); },
  findById(id: string): DBNews|undefined { return readDB().news.find(n=>n.id===id); },
  search(o:{isAdmin:boolean;category:string;search:string;limit:number;offset:number}): DBNews[] {
    let list = o.isAdmin ? this.getAll() : this.getPublished();
    if (o.category && o.category!=="all") list=list.filter(n=>n.category===o.category);
    if (o.search) { const q=o.search.toLowerCase(); list=list.filter(n=>n.title.toLowerCase().includes(q)||n.excerpt.toLowerCase().includes(q)||n.tags.some(t=>t.toLowerCase().includes(q))); }
    return list.slice(o.offset, o.offset+o.limit);
  },
  count(o:{isAdmin:boolean;category:string;search:string}): number { return this.search({...o,limit:99999,offset:0}).length; },
  insert(item: DBNews)                    { const db=readDB(); db.news.unshift(item); writeDB(db); },
  update(id: string, u: Partial<DBNews>)  { const db=readDB(); const i=db.news.findIndex(n=>n.id===id); if(i!==-1){db.news[i]={...db.news[i],...u};writeDB(db);} },
  incrementViews(id: string)              { const db=readDB(); const item=db.news.find(n=>n.id===id); if(item){item.views+=1;writeDB(db);} },
  delete(id: string)                      { const db=readDB(); db.news=db.news.filter(n=>n.id!==id); writeDB(db); },
};

export const commentQueries = {
  getAll():                  DBComment[] { return readDB().comments.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); },
  getApproved(newsId:string):DBComment[] { return this.getAll().filter(c=>c.newsId===newsId&&c.status==="approved"); },
  getByNews(newsId:string):  DBComment[] { return this.getAll().filter(c=>c.newsId===newsId); },
  insert(c: DBComment)                   { const db=readDB(); db.comments.unshift(c); writeDB(db); },
  updateStatus(id:string, s:DBComment["status"]) { const db=readDB(); const c=db.comments.find(x=>x.id===id); if(c){c.status=s;writeDB(db);} },
  delete(id:string)                      { const db=readDB(); db.comments=db.comments.filter(c=>c.id!==id); writeDB(db); },
};

export const categoryQueries = {
  getAll():     DBCategory[] { return readDB().categories.sort((a,b)=>a.id.localeCompare(b.id)); },
  getActive():  DBCategory[] { return this.getAll().filter(c=>c.isActive); },
  findById(id:string): DBCategory|undefined { return readDB().categories.find(c=>c.id===id); },
  findByKey(key:string): DBCategory|undefined { return readDB().categories.find(c=>c.key===key); },
  insert(cat: DBCategory) { const db=readDB(); db.categories.push(cat); writeDB(db); },
  update(id:string, u:Partial<DBCategory>) { const db=readDB(); const i=db.categories.findIndex(c=>c.id===id); if(i!==-1){db.categories[i]={...db.categories[i],...u};writeDB(db);} },
  delete(id:string) { const db=readDB(); db.categories=db.categories.filter(c=>c.id!==id); writeDB(db); },
};

export const pinnedQueries = {
  getAll():           string[] { return readDB().pinnedIds||[]; },
  set(ids: string[])           { const db=readDB(); db.pinnedIds=ids.slice(0,4); writeDB(db); },
  add(id: string)              { const db=readDB(); if(!db.pinnedIds)db.pinnedIds=[]; if(!db.pinnedIds.includes(id)){db.pinnedIds=([id,...db.pinnedIds]).slice(0,4);writeDB(db);} },
  remove(id: string)           { const db=readDB(); db.pinnedIds=(db.pinnedIds||[]).filter(x=>x!==id); writeDB(db); },
};
