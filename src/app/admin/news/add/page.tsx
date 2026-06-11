"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import toast from "react-hot-toast";

interface Cat { id:string; key:string; labelFa:string; labelEn:string; labelAr:string; icon:string }

export default function AddNewsPage() {
  const router  = useRouter();
  const { locale } = useApp();
  const t = translations[locale].admin;
  const [cats, setCats]   = useState<Cat[]>([]);
  const [loading, setLoading] = useState(false);
  const [imagePreviewOk, setImagePreviewOk] = useState(false);
  const [form, setForm]   = useState({
    title:"", titleEn:"", titleAr:"",
    excerpt:"", excerptEn:"", excerptAr:"",
    newsBody:"", category:"tech",
    image:"", tags:"", status:"published",
  });

  useEffect(() => {
    fetch("/api/admin/categories").then(r=>r.json()).then(d=>{
      setCats((d.categories||[]).filter((c:any)=>c.isActive));
    });
  }, []);

  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f=>({...f,[k]:e.target.value}));

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error(locale==="fa"?"عنوان الزامی است":"Title required"); return; }
    setLoading(true);
    const res = await fetch("/api/news",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(form),
    });
    if (res.ok) { toast.success(t.newsAdded); router.push("/admin/news"); }
    else { toast.error(locale==="fa"?"خطا در افزودن خبر":"Error adding article"); setLoading(false); }
  }

  const catLabel = (c: Cat) => locale==="en"?c.labelEn:locale==="ar"?c.labelAr:c.labelFa;

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{color:"var(--text)"}}>➕ {t.addNewsTitle}</h1>
        <p className="text-xs mt-1" style={{color:"var(--text3)"}}>{locale==="fa"?"اطلاعات خبر جدید را وارد کنید":"Fill in the details for the new article"}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FA */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{color:"var(--text)"}}>🇮🇷 فارسی</h3>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>عنوان *</label>
              <input className="input-field text-sm" placeholder="عنوان خبر..." value={form.title} onChange={set("title")} required/></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>خلاصه</label>
              <input className="input-field text-sm" placeholder="یک جمله کوتاه..." value={form.excerpt} onChange={set("excerpt")}/></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>متن کامل *</label>
              <textarea className="input-field text-sm resize-none" rows={6} placeholder="متن کامل خبر..." value={form.newsBody} onChange={set("newsBody")} required/></div>
          </div>
        </div>
        {/* EN */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{color:"var(--text)"}}>🇬🇧 English</h3>
          <div className="space-y-3">
            <input className="input-field text-sm" placeholder="English title..." value={form.titleEn} onChange={set("titleEn")} dir="ltr"/>
            <input className="input-field text-sm" placeholder="English excerpt..." value={form.excerptEn} onChange={set("excerptEn")} dir="ltr"/>
          </div>
        </div>
        {/* AR */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{color:"var(--text)"}}>🇸🇦 العربية</h3>
          <div className="space-y-3">
            <input className="input-field text-sm" placeholder="العنوان بالعربية..." value={form.titleAr} onChange={set("titleAr")}/>
            <input className="input-field text-sm" placeholder="الملخص بالعربية..." value={form.excerptAr} onChange={set("excerptAr")}/>
          </div>
        </div>
        {/* Meta */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{color:"var(--text)"}}>⚙️ {locale==="fa"?"اطلاعات خبر":"Article Meta"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{t.newsCategory} *</label>
              <select className="input-field text-sm" value={form.category} onChange={set("category")}>
                {cats.map(c=><option key={c.key} value={c.key}>{c.icon} {catLabel(c)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{t.newsStatus}</label>
              <select className="input-field text-sm" value={form.status} onChange={set("status")}>
                <option value="published">✅ {t.published}</option>
                <option value="draft">📝 {t.draft}</option>
                <option value="review">🔍 {t.review}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{t.newsImage}</label>
              <input className="input-field text-sm" placeholder="https://images.unsplash.com/..." value={form.image} onChange={e=>{set("image")(e);setImagePreviewOk(false);}} dir="ltr"/>
              <p className="text-[10px] mt-1" style={{color:"var(--text3)"}}>
                {locale==="fa"?"لینک مستقیم عکس — پیشنهاد: unsplash.com یا هر CDN دیگری":"Direct image URL — Suggested: unsplash.com or any CDN"}
              </p>
            </div>
            {form.image && (
              <div className="sm:col-span-2 h-44 rounded-xl overflow-hidden card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.image} alt="preview" className="w-full h-full object-cover"
                  onLoad={()=>setImagePreviewOk(true)}
                  onError={e=>{(e.target as HTMLImageElement).style.display="none";setImagePreviewOk(false);}}/>
                {!imagePreviewOk && <div className="flex items-center justify-center h-full text-xs" style={{color:"var(--text3)"}}>
                  {locale==="fa"?"در حال بارگذاری پیش‌نمایش...":"Loading preview..."}
                </div>}
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{t.newsTags}</label>
              <input className="input-field text-sm" placeholder={locale==="fa"?"مثال: هوش مصنوعی, فناوری, MIT":"e.g. AI, Technology, MIT"} value={form.tags} onChange={set("tags")}/>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={()=>router.back()} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-bold">{t.cancel}</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold" style={{opacity:loading?0.7:1}}>
            {loading?"...":"✓ " + t.publishNews}
          </button>
        </div>
      </form>
    </div>
  );
}
