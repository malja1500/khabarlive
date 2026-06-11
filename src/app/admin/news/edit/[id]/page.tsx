"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import { categoryQueries } from "@/lib/database";
import toast from "react-hot-toast";

export default function EditNewsPage() {
  const params   = useParams();
  const router   = useRouter();
  const { locale } = useApp();
  const t = translations[locale].admin;

  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [cats, setCats]       = useState<any[]>([]);
  const [form, setForm]       = useState({
    title:"", titleEn:"", titleAr:"",
    excerpt:"", excerptEn:"", excerptAr:"",
    newsBody:"", category:"tech", image:"", tags:"", status:"published",
  });

  useEffect(() => {
    // load categories
    fetch("/api/admin/categories")
      .then(r=>r.json()).then(d=>setCats(d.categories||[]));
    // load news
    fetch(`/api/news/${params.id}`)
      .then(r=>r.json())
      .then(d => {
        if (!d.news) { toast.error("خبر یافت نشد"); router.push("/admin/news"); return; }
        const n = d.news;
        setForm({
          title:    n.title    || "",
          titleEn:  n.titleEn  || "",
          titleAr:  n.titleAr  || "",
          excerpt:  n.excerpt  || "",
          excerptEn:n.excerptEn|| "",
          excerptAr:n.excerptAr|| "",
          newsBody: n.body     || "",
          category: n.category || "tech",
          image:    n.image    || "",
          tags:     (n.tags||[]).join(", "),
          status:   n.status   || "published",
        });
        setLoading(false);
      });
  }, [params.id]);

  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(f=>({...f,[k]:e.target.value}));

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { toast.error(locale==="fa"?"عنوان الزامی است":"Title required"); return; }
    setSaving(true);
    const res = await fetch(`/api/news/${params.id}`, {
      method:"PATCH",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({
        title:     form.title,
        titleEn:   form.titleEn,
        titleAr:   form.titleAr,
        excerpt:   form.excerpt,
        excerptEn: form.excerptEn,
        excerptAr: form.excerptAr,
        body:      form.newsBody,
        category:  form.category,
        image:     form.image,
        status:    form.status,
        tags:      form.tags.split(",").map((t:string)=>t.trim()).filter(Boolean),
      }),
    });
    if (res.ok) { toast.success(locale==="fa"?"خبر ذخیره شد":"Saved"); router.push("/admin/news"); }
    else { toast.error(locale==="fa"?"خطا در ذخیره":"Save error"); setSaving(false); }
  }

  if (loading) return <div className="p-8 text-center" style={{color:"var(--text3)"}}>Loading...</div>;

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{color:"var(--text)"}}>
          ✏️ {locale==="fa"?"ویرایش خبر":locale==="ar"?"تعديل الخبر":"Edit Article"}
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FA */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{color:"var(--text)"}}>🇮🇷 فارسی</h3>
          <div className="space-y-3">
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>عنوان *</label>
              <input className="input-field text-sm" value={form.title} onChange={set("title")} required /></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>خلاصه</label>
              <input className="input-field text-sm" value={form.excerpt} onChange={set("excerpt")} /></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>متن کامل</label>
              <textarea className="input-field text-sm resize-none" rows={6} value={form.newsBody} onChange={set("newsBody")} /></div>
          </div>
        </div>
        {/* EN */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{color:"var(--text)"}}>🇬🇧 English</h3>
          <div className="space-y-3">
            <input className="input-field text-sm" placeholder="English title" value={form.titleEn} onChange={set("titleEn")} dir="ltr"/>
            <input className="input-field text-sm" placeholder="English excerpt" value={form.excerptEn} onChange={set("excerptEn")} dir="ltr"/>
          </div>
        </div>
        {/* AR */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{color:"var(--text)"}}>🇸🇦 العربية</h3>
          <div className="space-y-3">
            <input className="input-field text-sm" placeholder="العنوان بالعربية" value={form.titleAr} onChange={set("titleAr")}/>
            <input className="input-field text-sm" placeholder="الملخص بالعربية" value={form.excerptAr} onChange={set("excerptAr")}/>
          </div>
        </div>
        {/* Meta */}
        <div className="card p-5">
          <h3 className="text-sm font-bold mb-4" style={{color:"var(--text)"}}>⚙️ {t.newsCategory} & {t.newsStatus}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{t.newsCategory}</label>
              <select className="input-field text-sm" value={form.category} onChange={set("category")}>
                {cats.filter(c=>c.isActive).map((c:any)=>(
                  <option key={c.key} value={c.key}>{c.icon} {c.labelFa}</option>
                ))}
              </select></div>
            <div><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{t.newsStatus}</label>
              <select className="input-field text-sm" value={form.status} onChange={set("status")}>
                <option value="published">✅ {t.published}</option>
                <option value="draft">📝 {t.draft}</option>
                <option value="review">🔍 {t.review}</option>
              </select></div>
            <div className="sm:col-span-2"><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{t.newsImage}</label>
              <input className="input-field text-sm" value={form.image} onChange={set("image")} dir="ltr"/></div>
            {form.image && <div className="sm:col-span-2 h-40 rounded-xl overflow-hidden card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="" className="w-full h-full object-cover" onError={(e)=>{(e.target as HTMLImageElement).style.display="none"}}/>
            </div>}
            <div className="sm:col-span-2"><label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{t.newsTags}</label>
              <input className="input-field text-sm" value={form.tags} onChange={set("tags")} placeholder="تگ ۱, تگ ۲, تگ ۳"/></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={()=>router.back()} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-bold">{t.cancel}</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 rounded-xl text-sm font-bold" style={{opacity:saving?0.7:1}}>
            {saving?"...":"💾 " + (locale==="fa"?"ذخیره تغییرات":locale==="ar"?"حفظ التغييرات":"Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
