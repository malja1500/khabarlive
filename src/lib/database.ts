/**
 * database.ts
 * ─────────────────────────────────────────────────────────────────
 * Universal database layer:
 *   • روی Vercel/production → MongoDB Atlas (از MONGODB_URI)
 *   • روی localhost بدون MONGODB_URI → JSON file (data/db.json)
 *
 * همه API route ها فقط با این فایل کار می‌کنند.
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Types (shared) ───────────────────────────────────────────────
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
  createdAt: string; source?: string; sourceUrl?: string;
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

// ─── Hash helpers ─────────────────────────────────────────────────
export function makeHash(plain: string): string {
  return "hashed_" + Buffer.from(plain, "utf8").toString("base64");
}
export function checkHash(plain: string, hash: string): boolean {
  if (!hash?.startsWith("hashed_")) return false;
  try { return Buffer.from(hash.slice(7), "base64").toString("utf8") === plain; }
  catch { return false; }
}

// ─── Detect environment ───────────────────────────────────────────
const USE_MONGO = !!process.env.MONGODB_URI;

// ═══════════════════════════════════════════════════════════════════
//  BRANCH A — MongoDB (Vercel / production)
// ═══════════════════════════════════════════════════════════════════
async function mongoQuery() {
  const { connectDB } = await import("./mongodb");
  const { UserModel, NewsModel, CommentModel, CategoryModel, ConfigModel } = await import("./models");
  await connectDB();

  // Seed if empty
  const count = await UserModel.countDocuments();
  if (count === 0) await mongoSeed(UserModel, NewsModel, CommentModel, CategoryModel, ConfigModel);

  return { UserModel, NewsModel, CommentModel, CategoryModel, ConfigModel };
}

async function mongoSeed(U: any, N: any, C: any, Cat: any, Cfg: any) {
  await U.create([
    { id:"admin-1", name:"علی رضایی",  email:"admin@khabarlive.ir", password:makeHash("Admin@1234"), role:"admin", avatar:"https://i.pravatar.cc/80?img=3",  isActive:true, newsCount:142, createdAt:"2024-01-01T00:00:00Z" },
    { id:"user-1",  name:"سارا احمدی", email:"sara@example.com",    password:makeHash("password"),   role:"user",  avatar:"https://i.pravatar.cc/80?img=5",  isActive:true, newsCount:0,   createdAt:"2024-02-15T00:00:00Z" },
    { id:"user-2",  name:"رضا ملکی",   email:"reza@example.com",    password:makeHash("password"),   role:"user",  avatar:"https://i.pravatar.cc/80?img=8",  isActive:true, newsCount:0,   createdAt:"2024-03-10T00:00:00Z" },
  ]);
  await Cat.create([
    { id:"cat-1", key:"tech",     labelFa:"فناوری",  labelEn:"Technology", labelAr:"التكنولوجيا", icon:"💻", color:"#457b9d", bg:"rgba(69,123,157,0.85)",  isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-2", key:"economy",  labelFa:"اقتصاد",  labelEn:"Economy",    labelAr:"الاقتصاد",    icon:"📈", color:"#f4a261", bg:"rgba(244,162,97,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-3", key:"sport",    labelFa:"ورزش",    labelEn:"Sports",     labelAr:"الرياضة",     icon:"⚽", color:"#2d9a6b", bg:"rgba(45,154,107,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-4", key:"world",    labelFa:"جهان",    labelEn:"World",      labelAr:"العالم",      icon:"🌍", color:"#7c3aed", bg:"rgba(124,58,237,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-5", key:"politics", labelFa:"سیاسی",   labelEn:"Politics",   labelAr:"السياسة",     icon:"🏛", color:"#ea580c", bg:"rgba(234,88,12,0.85)",  isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-6", key:"culture",  labelFa:"فرهنگ",   labelEn:"Culture",    labelAr:"الثقافة",     icon:"🎨", color:"#db2777", bg:"rgba(219,39,119,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
  ]);
  await Cfg.create({ key:"pinnedIds", value: JSON.stringify(["news-1","news-2","news-3","news-4"]) });
  await N.create(SEED_NEWS);
  await C.create(SEED_COMMENTS);
}

// ═══════════════════════════════════════════════════════════════════
//  BRANCH B — JSON file (localhost fallback)
// ═══════════════════════════════════════════════════════════════════
let _jsonDB: any = null;

function getJsonDB() {
  if (_jsonDB) return _jsonDB;
  const fs   = require("fs");
  const path = require("path");
  const DATA_DIR = path.join(process.cwd(), "data");
  const DB_FILE  = path.join(DATA_DIR, "db.json");
  const defaultCats = [
    { id:"cat-1", key:"tech",     labelFa:"فناوری",  labelEn:"Technology", labelAr:"التكنولوجيا", icon:"💻", color:"#457b9d", bg:"rgba(69,123,157,0.85)",  isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-2", key:"economy",  labelFa:"اقتصاد",  labelEn:"Economy",    labelAr:"الاقتصاد",    icon:"📈", color:"#f4a261", bg:"rgba(244,162,97,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-3", key:"sport",    labelFa:"ورزش",    labelEn:"Sports",     labelAr:"الرياضة",     icon:"⚽", color:"#2d9a6b", bg:"rgba(45,154,107,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-4", key:"world",    labelFa:"جهان",    labelEn:"World",      labelAr:"العالم",      icon:"🌍", color:"#7c3aed", bg:"rgba(124,58,237,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-5", key:"politics", labelFa:"سیاسی",   labelEn:"Politics",   labelAr:"السياسة",     icon:"🏛", color:"#ea580c", bg:"rgba(234,88,12,0.85)",  isActive:true, createdAt:"2024-01-01T00:00:00Z" },
    { id:"cat-6", key:"culture",  labelFa:"فرهنگ",   labelEn:"Culture",    labelAr:"الثقافة",     icon:"🎨", color:"#db2777", bg:"rgba(219,39,119,0.85)", isActive:true, createdAt:"2024-01-01T00:00:00Z" },
  ];
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive:true });
  if (!fs.existsSync(DB_FILE)) {
    _jsonDB = {
      seeded:true,
      categories: defaultCats,
      pinnedIds: ["news-1","news-2","news-3","news-4"],
      users:[
        { id:"admin-1", name:"علی رضایی",  email:"admin@khabarlive.ir", password:makeHash("Admin@1234"), role:"admin", avatar:"https://i.pravatar.cc/80?img=3",  isActive:true, newsCount:142, createdAt:"2024-01-01T00:00:00Z" },
        { id:"user-1",  name:"سارا احمدی", email:"sara@example.com",    password:makeHash("password"),   role:"user",  avatar:"https://i.pravatar.cc/80?img=5",  isActive:true, newsCount:0,   createdAt:"2024-02-15T00:00:00Z" },
        { id:"user-2",  name:"رضا ملکی",   email:"reza@example.com",    password:makeHash("password"),   role:"user",  avatar:"https://i.pravatar.cc/80?img=8",  isActive:true, newsCount:0,   createdAt:"2024-03-10T00:00:00Z" },
      ],
      news: SEED_NEWS,
      comments: SEED_COMMENTS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(_jsonDB,null,2),"utf8");
  } else {
    try {
      _jsonDB = JSON.parse(fs.readFileSync(DB_FILE,"utf8"));
      if (!_jsonDB.categories) { _jsonDB.categories = defaultCats; saveJson(_jsonDB); }
      if (!_jsonDB.pinnedIds)  { _jsonDB.pinnedIds  = []; saveJson(_jsonDB); }
      // fix admin hash
      const admin = _jsonDB.users?.find((u:any) => u.id==="admin-1");
      if (admin && !checkHash("Admin@1234", admin.password)) {
        admin.password = makeHash("Admin@1234"); saveJson(_jsonDB);
      }
    } catch { _jsonDB = null; return getJsonDB(); }
  }
  return _jsonDB;
}

function saveJson(db: any) {
  const fs   = require("fs");
  const path = require("path");
  const DATA_DIR = path.join(process.cwd(), "data");
  const DB_FILE  = path.join(DATA_DIR, "db.json");
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive:true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db,null,2),"utf8");
  _jsonDB = db;
}

// ═══════════════════════════════════════════════════════════════════
//  PUBLIC QUERY HELPERS
// ═══════════════════════════════════════════════════════════════════

function sortDesc(arr: any[]) {
  return [...arr].sort((a,b) => new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime());
}

export const userQueries = {
  async findByEmail(email: string): Promise<DBUser|undefined> {
    if (USE_MONGO) {
      const { UserModel } = await mongoQuery();
      const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
      return doc ? { ...doc as any, id: (doc as any).id } : undefined;
    }
    return getJsonDB().users.find((u:DBUser) => u.email.toLowerCase()===email.toLowerCase());
  },
  async findById(id: string): Promise<DBUser|undefined> {
    if (USE_MONGO) {
      const { UserModel } = await mongoQuery();
      const doc = await UserModel.findOne({ id }).lean();
      return doc ? doc as unknown as DBUser : undefined;
    }
    return getJsonDB().users.find((u:DBUser) => u.id===id);
  },
  async getAll(): Promise<DBUser[]> {
    if (USE_MONGO) {
      const { UserModel } = await mongoQuery();
      return (await UserModel.find().lean()) as unknown as DBUser[];
    }
    return sortDesc(getJsonDB().users);
  },
  async insert(user: DBUser): Promise<void> {
    if (USE_MONGO) {
      const { UserModel } = await mongoQuery();
      await UserModel.create(user);
    } else {
      const db = getJsonDB(); db.users.push(user); saveJson(db);
    }
  },
  async delete(id: string): Promise<void> {
    if (USE_MONGO) {
      const { UserModel } = await mongoQuery();
      await UserModel.deleteOne({ id });
    } else {
      const db = getJsonDB(); db.users = db.users.filter((u:DBUser) => u.id!==id); saveJson(db);
    }
  },
};

export const newsQueries = {
  async getAll(): Promise<DBNews[]> {
    if (USE_MONGO) {
      const { NewsModel } = await mongoQuery();
      return (await NewsModel.find().sort({ createdAt:-1 }).lean()) as unknown as DBNews[];
    }
    return sortDesc(getJsonDB().news);
  },
  async getPublished(): Promise<DBNews[]> {
    if (USE_MONGO) {
      const { NewsModel } = await mongoQuery();
      return (await NewsModel.find({ status:"published" }).sort({ createdAt:-1 }).lean()) as unknown as DBNews[];
    }
    return sortDesc(getJsonDB().news).filter((n:DBNews)=>n.status==="published");
  },
  async findById(id: string): Promise<DBNews|undefined> {
    if (USE_MONGO) {
      const { NewsModel } = await mongoQuery();
      const doc = await NewsModel.findOne({ id }).lean();
      return doc ? doc as unknown as DBNews : undefined;
    }
    return getJsonDB().news.find((n:DBNews) => n.id===id);
  },
  async search(o: {isAdmin:boolean;category:string;search:string;limit:number;offset:number}): Promise<DBNews[]> {
    if (USE_MONGO) {
      const { NewsModel } = await mongoQuery();
      const query: any = {};
      if (!o.isAdmin) query.status = "published";
      if (o.category && o.category!=="all") query.category = o.category;
      if (o.search) query.$or = [
        { title:    { $regex: o.search, $options:"i" } },
        { excerpt:  { $regex: o.search, $options:"i" } },
        { tags:     { $regex: o.search, $options:"i" } },
      ];
      return (await NewsModel.find(query).sort({ createdAt:-1 }).skip(o.offset).limit(o.limit).lean()) as unknown as DBNews[];
    }
    let list = o.isAdmin ? sortDesc(getJsonDB().news) : sortDesc(getJsonDB().news).filter((n:DBNews)=>n.status==="published");
    if (o.category && o.category!=="all") list=list.filter((n:DBNews)=>n.category===o.category);
    if (o.search) { const q=o.search.toLowerCase(); list=list.filter((n:DBNews)=>n.title.toLowerCase().includes(q)||n.excerpt.toLowerCase().includes(q)||(n.tags||[]).some((t:string)=>t.toLowerCase().includes(q))); }
    return list.slice(o.offset, o.offset+o.limit);
  },
  async count(o: {isAdmin:boolean;category:string;search:string}): Promise<number> {
    const list = await this.search({...o,limit:99999,offset:0});
    return list.length;
  },
  async insert(item: DBNews): Promise<void> {
    if (USE_MONGO) {
      const { NewsModel } = await mongoQuery();
      await NewsModel.create(item);
    } else {
      const db = getJsonDB(); db.news.unshift(item); saveJson(db);
    }
  },
  async update(id: string, u: Partial<DBNews>): Promise<void> {
    if (USE_MONGO) {
      const { NewsModel } = await mongoQuery();
      await NewsModel.updateOne({ id }, { $set: u });
    } else {
      const db = getJsonDB(); const i=db.news.findIndex((n:DBNews)=>n.id===id);
      if(i!==-1){db.news[i]={...db.news[i],...u};saveJson(db);}
    }
  },
  async incrementViews(id: string): Promise<void> {
    if (USE_MONGO) {
      const { NewsModel } = await mongoQuery();
      await NewsModel.updateOne({ id }, { $inc: { views: 1 } });
    } else {
      const db = getJsonDB(); const item=db.news.find((n:DBNews)=>n.id===id);
      if(item){item.views+=1;saveJson(db);}
    }
  },
  async delete(id: string): Promise<void> {
    if (USE_MONGO) {
      const { NewsModel } = await mongoQuery();
      await NewsModel.deleteOne({ id });
    } else {
      const db = getJsonDB(); db.news=db.news.filter((n:DBNews)=>n.id!==id); saveJson(db);
    }
  },
};

export const commentQueries = {
  async getAll(): Promise<DBComment[]> {
    if (USE_MONGO) {
      const { CommentModel } = await mongoQuery();
      return (await CommentModel.find().sort({ createdAt:-1 }).lean()) as unknown as DBComment[];
    }
    return sortDesc(getJsonDB().comments);
  },
  async getApproved(newsId: string): Promise<DBComment[]> {
    if (USE_MONGO) {
      const { CommentModel } = await mongoQuery();
      return (await CommentModel.find({ newsId, status:"approved" }).sort({ createdAt:-1 }).lean()) as unknown as DBComment[];
    }
    return sortDesc(getJsonDB().comments).filter((c:DBComment)=>c.newsId===newsId&&c.status==="approved");
  },
  async getByNews(newsId: string): Promise<DBComment[]> {
    if (USE_MONGO) {
      const { CommentModel } = await mongoQuery();
      return (await CommentModel.find({ newsId }).sort({ createdAt:-1 }).lean()) as unknown as DBComment[];
    }
    return sortDesc(getJsonDB().comments).filter((c:DBComment)=>c.newsId===newsId);
  },
  async insert(c: DBComment): Promise<void> {
    if (USE_MONGO) {
      const { CommentModel } = await mongoQuery();
      await CommentModel.create(c);
    } else {
      const db = getJsonDB(); db.comments.unshift(c); saveJson(db);
    }
  },
  async updateStatus(id: string, status: DBComment["status"]): Promise<void> {
    if (USE_MONGO) {
      const { CommentModel } = await mongoQuery();
      await CommentModel.updateOne({ id }, { $set: { status } });
    } else {
      const db = getJsonDB(); const c=db.comments.find((x:DBComment)=>x.id===id);
      if(c){c.status=status;saveJson(db);}
    }
  },
  async delete(id: string): Promise<void> {
    if (USE_MONGO) {
      const { CommentModel } = await mongoQuery();
      await CommentModel.deleteOne({ id });
    } else {
      const db = getJsonDB(); db.comments=db.comments.filter((c:DBComment)=>c.id!==id); saveJson(db);
    }
  },
};

export const categoryQueries = {
  async getAll(): Promise<DBCategory[]> {
    if (USE_MONGO) {
      const { CategoryModel } = await mongoQuery();
      return (await CategoryModel.find().lean()) as unknown as DBCategory[];
    }
    return getJsonDB().categories || [];
  },
  async getActive(): Promise<DBCategory[]> {
    const all = await this.getAll();
    return all.filter(c=>c.isActive);
  },
  async findById(id: string): Promise<DBCategory|undefined> {
    if (USE_MONGO) {
      const { CategoryModel } = await mongoQuery();
      const doc = await CategoryModel.findOne({ id }).lean();
      return doc ? doc as unknown as DBCategory : undefined;
    }
    return (getJsonDB().categories||[]).find((c:DBCategory)=>c.id===id);
  },
  async findByKey(key: string): Promise<DBCategory|undefined> {
    if (USE_MONGO) {
      const { CategoryModel } = await mongoQuery();
      const doc = await CategoryModel.findOne({ key }).lean();
      return doc ? doc as unknown as DBCategory : undefined;
    }
    return (getJsonDB().categories||[]).find((c:DBCategory)=>c.key===key);
  },
  async insert(cat: DBCategory): Promise<void> {
    if (USE_MONGO) {
      const { CategoryModel } = await mongoQuery();
      await CategoryModel.create(cat);
    } else {
      const db = getJsonDB(); if(!db.categories)db.categories=[]; db.categories.push(cat); saveJson(db);
    }
  },
  async update(id: string, u: Partial<DBCategory>): Promise<void> {
    if (USE_MONGO) {
      const { CategoryModel } = await mongoQuery();
      await CategoryModel.updateOne({ id }, { $set: u });
    } else {
      const db = getJsonDB(); const i=(db.categories||[]).findIndex((c:DBCategory)=>c.id===id);
      if(i!==-1){db.categories[i]={...db.categories[i],...u};saveJson(db);}
    }
  },
  async delete(id: string): Promise<void> {
    if (USE_MONGO) {
      const { CategoryModel } = await mongoQuery();
      await CategoryModel.deleteOne({ id });
    } else {
      const db = getJsonDB(); db.categories=(db.categories||[]).filter((c:DBCategory)=>c.id!==id); saveJson(db);
    }
  },
};

export const pinnedQueries = {
  async getAll(): Promise<string[]> {
    if (USE_MONGO) {
      const { ConfigModel } = await mongoQuery();
      const doc = await ConfigModel.findOne({ key:"pinnedIds" }).lean() as any;
      return doc ? JSON.parse(doc.value) : [];
    }
    return getJsonDB().pinnedIds || [];
  },
  async set(ids: string[]): Promise<void> {
    const val = JSON.stringify(ids.slice(0,4));
    if (USE_MONGO) {
      const { ConfigModel } = await mongoQuery();
      await ConfigModel.findOneAndUpdate({ key:"pinnedIds" }, { value:val }, { upsert:true });
    } else {
      const db = getJsonDB(); db.pinnedIds=ids.slice(0,4); saveJson(db);
    }
  },
  async add(id: string): Promise<void> {
    const cur = await this.getAll();
    if (!cur.includes(id)) await this.set([id,...cur]);
  },
  async remove(id: string): Promise<void> {
    const cur = await this.getAll();
    await this.set(cur.filter(x=>x!==id));
  },
};

// ─── Seed data ────────────────────────────────────────────────────
const SEED_NEWS: DBNews[] = [
  { id:"news-1", category:"tech", status:"published", views:12400, readingTime:"۵ دقیقه", createdAt:"2026-06-07T06:00:00Z", author:"دکتر علی رضایی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=3", image:"https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80", tags:["هوش مصنوعی","AGI","MIT","فناوری"], title:"هوش مصنوعی AGI: دانشمندان اعلام کردند مرز بین هوش مصنوعی و هوش انسانی در حال محو شدن است", titleEn:"AGI: Scientists Say the Line Between AI and Human Intelligence Is Fading", titleAr:"الذكاء الاصطناعي العام: العلماء يعلنون تلاشي الحدود", excerpt:"گروهی از محققان دانشگاه MIT اعلام کردند که آخرین نسل مدل‌های هوش مصنوعی توانایی انجام بیش از ۹۵٪ وظایف شناختی انسانی را دارند.", excerptEn:"MIT researchers announced that the latest AI models can perform over 95% of human cognitive tasks.", excerptAr:"أعلن باحثو MIT أن أحدث نماذج الذكاء الاصطناعي قادرة على أداء أكثر من 95٪ من المهام.", body:"<p>محققان MIT اعلام کردند مرز AGI و هوش انسانی محو می‌شود.</p><h3>چه چیزی تغییر کرده؟</h3><p>مدل‌های جدید در موقعیت‌های کاملاً جدید راه‌حل ارائه می‌دهند.</p>", bodyEn:"<p>MIT researchers say AI models now outperform average humans on 95%+ of cognitive benchmarks.</p>", bodyAr:"<p>نشر باحثو MIT نتائج مذهلة في مجال الذكاء الاصطناعي.</p>" },
  { id:"news-2", category:"economy", status:"published", views:8200, readingTime:"۴ دقیقه", createdAt:"2026-06-07T05:15:00Z", author:"مهندس سارا احمدی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=5", image:"https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=900&q=80", tags:["نفت","اقتصاد","اوپک"], title:"بازار جهانی نفت با رکورد تاریخی جدید مواجه شد؛ قیمت هر بشکه از ۱۲۰ دلار گذشت", titleEn:"Global Oil Market Hits New Record: Barrel Price Exceeds $120", titleAr:"سوق النفط العالمي يواجه رقماً قياسياً جديداً", excerpt:"اوپک پلاس تولید نفت را محدود نگه داشت.", excerptEn:"OPEC+ kept oil production limited.", excerptAr:"قررت أوبك+ تحديد إنتاج النفت.", body:"<p>قیمت نفت از ۱۲۰ دلار گذشت.</p>", bodyEn:"<p>Brent crossed $120/barrel.</p>", bodyAr:"<p>تجاوز خام برنت 120 دولاراً.</p>" },
  { id:"news-3", category:"sport", status:"published", views:45100, readingTime:"۳ دقیقه", createdAt:"2026-06-07T04:00:00Z", author:"رضا ملکی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=8", image:"https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=900&q=80", tags:["فوتبال","تیم ملی","جام جهانی"], title:"تیم ملی فوتبال ایران با پیروزی قاطع ۳ بر صفر راهی جام جهانی ۲۰۲۶ شد", titleEn:"Iran National Football Team Qualifies for 2026 World Cup with 3-0 Victory", titleAr:"المنتخب الإيراني يتأهل لكأس العالم 2026", excerpt:"ایران سهمیه جام جهانی را کسب کرد.", excerptEn:"Iran secured a World Cup spot.", excerptAr:"ضمن إيران مكاناً في كأس العالم.", body:"<p>ایران با ۳-۰ صعود کرد.</p>", bodyEn:"<p>Iran qualified 3-0.</p>", bodyAr:"<p>تأهل إيران بنتيجة 3-0.</p>" },
  { id:"news-4", category:"world", status:"published", views:6700, readingTime:"۶ دقیقه", createdAt:"2026-06-07T03:00:00Z", author:"لیلا کریمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=10", image:"https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&q=80", tags:["آب","خاورمیانه"], title:"سازمان ملل: بحران آب در خاورمیانه به نقطه بحرانی رسیده", titleEn:"UN: Middle East Water Crisis Reaches Critical Point", titleAr:"الأمم المتحدة: أزمة المياه وصلت نقطة حرجة", excerpt:"۲۰۰ میلیون نفر با کمبود آب مواجه می‌شوند.", excerptEn:"200M people face water shortages.", excerptAr:"200 مليون شخص يواجهون شحاً في المياه.", body:"<p>سازمان ملل هشدار داد.</p>", bodyEn:"<p>UN issued a critical warning.</p>", bodyAr:"<p>حذّرت الأمم المتحدة.</p>" },
  { id:"news-5", category:"tech", status:"published", views:28900, readingTime:"۴ دقیقه", createdAt:"2026-06-06T22:00:00Z", author:"آرش محمودی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=15", image:"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=900&q=80", tags:["اپل","آیفون"], title:"اپل از iPhone 18 رونمایی کرد: صفحه هولوگرافیک و باتری ۵ روزه", titleEn:"Apple Unveils iPhone 18: Holographic Display and 5-Day Battery", titleAr:"آبل تكشف عن iPhone 18", excerpt:"مدل جدید با فناوری انقلابی.", excerptEn:"New model with revolutionary tech.", excerptAr:"النموذج الجديد بتقنية ثورية.", body:"<p>iPhone 18 با صفحه هولوگرافیک.</p>", bodyEn:"<p>iPhone 18 features holographic display.</p>", bodyAr:"<p>iPhone 18 بشاشة هولوغرافية.</p>" },
  { id:"news-6", category:"politics", status:"published", views:4100, readingTime:"۵ دقیقه", createdAt:"2026-06-06T18:00:00Z", author:"فرزانه کاظمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=20", image:"https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=900&q=80", tags:["بریکس"], title:"نشست بریکس: ۲۴ کشور جدید درخواست عضویت دادند", titleEn:"BRICS Summit: 24 New Countries Apply for Membership", titleAr:"قمة بريكس: 24 دولة تتقدم", excerpt:"۲۴ کشور جدید عضویت خواستند.", excerptEn:"24 new countries applied.", excerptAr:"24 دولة طلبت العضوية.", body:"<p>اجلاس بریکس.</p>", bodyEn:"<p>BRICS summit news.</p>", bodyAr:"<p>أخبار قمة بريكس.</p>" },
  { id:"news-7", category:"culture", status:"published", views:18300, readingTime:"۳ دقیقه", createdAt:"2026-06-06T14:00:00Z", author:"نیلوفر رحیمی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=25", image:"https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=900&q=80", tags:["سینما","جشنواره کن"], title:"جشنواره فیلم کن: فیلم ایرانی جایزه نخل طلایی را گرفت", titleEn:"Cannes: Iranian Film Wins Palme d'Or", titleAr:"كان: فيلم إيراني يفوز", excerpt:"کارگردان ایرانی نخل طلا گرفت.", excerptEn:"Iranian director wins Palme d'Or.", excerptAr:"مخرج إيراني يفوز بالسعفة.", body:"<p>کارگردان ایرانی نخل طلا گرفت.</p>", bodyEn:"<p>Iranian director wins top prize.</p>", bodyAr:"<p>فاز مخرج إيراني بالسعفة الذهبية.</p>" },
  { id:"news-8", category:"economy", status:"published", views:9800, readingTime:"۳ دقیقه", createdAt:"2026-06-06T10:00:00Z", author:"علیرضا تهرانی", authorId:"admin-1", authorAvatar:"https://i.pravatar.cc/80?img=30", image:"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80", tags:["بورس","اقتصاد"], title:"بورس تهران ۳.۸ درصد رشد کرد", titleEn:"Tehran Stock Exchange Grows 3.8%", titleAr:"بورصة طهران ترتفع 3.8٪", excerpt:"شاخص کل رشد کرد.", excerptEn:"Main index grew.", excerptAr:"ارتفع المؤشر.", body:"<p>بورس تهران رشد کرد.</p>", bodyEn:"<p>TSE had a great day.</p>", bodyAr:"<p>ارتفعت بورصة طهران.</p>" },
];
const SEED_COMMENTS: DBComment[] = [
  { id:"c-1", newsId:"news-1", newsTitle:"هوش مصنوعی", userId:"user-1", userName:"سارا احمدی", userAvatar:"https://i.pravatar.cc/40?img=5", text:"مقاله جالبی بود!", status:"approved", createdAt:"2026-06-07T07:00:00Z" },
  { id:"c-2", newsId:"news-2", newsTitle:"بازار نفت",   userId:"user-2", userName:"رضا ملکی",   userAvatar:"https://i.pravatar.cc/40?img=8", text:"چرا نفت گران شد؟",  status:"pending",  createdAt:"2026-06-07T06:30:00Z" },
];
