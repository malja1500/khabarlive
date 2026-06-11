"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/store";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

interface Cat { id:string;key:string;labelFa:string;labelEn:string;labelAr:string;icon:string;color:string;bg:string;isActive:boolean }

export default function AdminCategoriesPage() {
  const { locale } = useApp();
  const [cats, setCats]     = useState<Cat[]>([]);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState<Cat|null>(null);
  const [form, setForm]     = useState({ key:"", labelFa:"", labelEn:"", labelAr:"", icon:"📰", color:"#666666" });

  useEffect(()=>{ fetch("/api/admin/categories").then(r=>r.json()).then(d=>setCats(d.categories||[])); },[]);

  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement>) => setForm(f=>({...f,[k]:e.target.value}));

  async function toggle(cat: Cat) {
    const res = await fetch("/api/admin/categories",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:cat.id,isActive:!cat.isActive})});
    if(res.ok){ setCats(p=>p.map(c=>c.id===cat.id?{...c,isActive:!c.isActive}:c)); toast.success(locale==="fa"?`${!cat.isActive?"فعال":"غیرفعال"} شد`:"Updated"); }
  }

  async function remove(cat: Cat) {
    if (!confirm(locale==="fa"?"حذف شود؟":"Delete?")) return;
    const res = await fetch("/api/admin/categories",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:cat.id})});
    if(res.ok){ setCats(p=>p.filter(c=>c.id!==cat.id)); toast.success(locale==="fa"?"حذف شد":"Deleted"); }
    else { const d=await res.json(); toast.error(d.error||"Error"); }
  }

  async function save() {
    if (!form.labelFa||!form.key) { toast.error(locale==="fa"?"نام و کلید الزامی است":"Name and key required"); return; }
    if (editing) {
      const res = await fetch("/api/admin/categories",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editing.id,...form,bg:`rgba(${hexToRgb(form.color)},0.85)`})});
      if(res.ok){ const d=await res.json(); if(d.success){setCats(p=>p.map(c=>c.id===editing.id?{...c,...form}:c)); toast.success(locale==="fa"?"ذخیره شد":"Saved"); setModal(false); }}
    } else {
      const res = await fetch("/api/admin/categories",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,bg:`rgba(${hexToRgb(form.color)},0.85)`})});
      if(res.ok){ const d=await res.json(); if(d.category){ setCats(p=>[...p,d.category]); toast.success(locale==="fa"?"دسته اضافه شد":"Category added"); setModal(false); } }
      else { const d=await res.json(); toast.error(d.error==="key_exists"?(locale==="fa"?"این کلید قبلاً وجود دارد":"Key already exists"):"Error"); }
    }
  }

  function hexToRgb(hex:string):string {
    const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  const builtIn = ["cat-1","cat-2","cat-3","cat-4","cat-5","cat-6"];

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black" style={{color:"var(--text)"}}>
            {locale==="fa"?"مدیریت دسته‌بندی‌ها":locale==="ar"?"إدارة التصنيفات":"Manage Categories"}
          </h1>
          <p className="text-xs mt-1" style={{color:"var(--text3)"}}>{cats.length} {locale==="fa"?"دسته‌بندی":"categories"}</p>
        </div>
        <button onClick={()=>{setEditing(null);setForm({key:"",labelFa:"",labelEn:"",labelAr:"",icon:"📰",color:"#666666"});setModal(true);}} className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-2">
          <Plus size={14}/>{locale==="fa"?"+ دسته جدید":locale==="ar"?"+ تصنيف جديد":"+ New Category"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cats.map(cat=>(
          <div key={cat.id} className="card p-4 flex items-center gap-4" style={{opacity:cat.isActive?1:0.55}}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{background:`${cat.color}22`}}>{cat.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm" style={{color:"var(--text)"}}>{cat.labelFa}</div>
              <div className="text-xs" style={{color:"var(--text3)"}}>{cat.key}</div>
              <span className={`status-badge mt-1 inline-block ${cat.isActive?"status-published":"status-draft"}`}>{cat.isActive?(locale==="fa"?"فعال":"Active"):(locale==="fa"?"غیرفعال":"Inactive")}</span>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button onClick={()=>toggle(cat)} className="text-[11px] w-8 h-8 rounded-lg border flex items-center justify-center transition-all" style={{border:"1px solid var(--border)",color:cat.isActive?"var(--green)":"var(--text3)",background:"var(--bg3)"}} title={cat.isActive?"غیرفعال کن":"فعال کن"}>
                {cat.isActive?<ToggleRight size={14}/>:<ToggleLeft size={14}/>}
              </button>
              <button onClick={()=>{setEditing(cat);setForm({key:cat.key,labelFa:cat.labelFa,labelEn:cat.labelEn,labelAr:cat.labelAr,icon:cat.icon,color:cat.color});setModal(true);}} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:border-[--accent] hover:text-[--accent]" style={{border:"1px solid var(--border)",color:"var(--text2)",background:"var(--bg3)"}}>
                <Pencil size={12}/>
              </button>
              {!builtIn.includes(cat.id) && (
                <button onClick={()=>remove(cat)} className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all hover:border-[--accent] hover:text-[--accent]" style={{border:"1px solid var(--border)",color:"var(--text2)",background:"var(--bg3)"}}>
                  <Trash2 size={12}/>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-backdrop" onClick={()=>setModal(false)}>
          <div className="card p-6 max-w-md w-full animate-fade-up" style={{boxShadow:"var(--shadow)"}} onClick={e=>e.stopPropagation()}>
            <h3 className="text-lg font-black mb-4" style={{color:"var(--text)"}}>{editing?(locale==="fa"?"ویرایش دسته":"Edit Category"):(locale==="fa"?"دسته جدید":"New Category")}</h3>
            <div className="space-y-3">
              <div><label className="block text-xs font-semibold mb-1" style={{color:"var(--text2)"}}>کلید (key) *</label><input className="input-field text-sm" placeholder="e.g. sports" value={form.key} onChange={set("key")} disabled={!!editing} dir="ltr"/></div>
              <div><label className="block text-xs font-semibold mb-1" style={{color:"var(--text2)"}}>نام فارسی *</label><input className="input-field text-sm" placeholder="ورزش" value={form.labelFa} onChange={set("labelFa")}/></div>
              <div><label className="block text-xs font-semibold mb-1" style={{color:"var(--text2)"}}>English name</label><input className="input-field text-sm" placeholder="Sports" value={form.labelEn} onChange={set("labelEn")} dir="ltr"/></div>
              <div><label className="block text-xs font-semibold mb-1" style={{color:"var(--text2)"}}>الاسم بالعربية</label><input className="input-field text-sm" placeholder="الرياضة" value={form.labelAr} onChange={set("labelAr")}/></div>
              <div className="flex gap-3">
                <div className="flex-1"><label className="block text-xs font-semibold mb-1" style={{color:"var(--text2)"}}>آیکون</label><input className="input-field text-sm" placeholder="💻" value={form.icon} onChange={set("icon")}/></div>
                <div className="flex-1"><label className="block text-xs font-semibold mb-1" style={{color:"var(--text2)"}}>رنگ</label>
                  <div className="flex gap-2 items-center"><input type="color" value={form.color} onChange={set("color")} className="w-10 h-10 rounded cursor-pointer border" style={{borderColor:"var(--border2)"}}/><input className="input-field text-sm flex-1" value={form.color} onChange={set("color")} dir="ltr"/></div></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={()=>setModal(false)} className="btn-secondary flex-1 py-2.5 rounded-xl text-sm">{locale==="fa"?"انصراف":"Cancel"}</button>
              <button onClick={save} className="btn-primary flex-1 py-2.5 rounded-xl text-sm font-bold">{locale==="fa"?"ذخیره":"Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
