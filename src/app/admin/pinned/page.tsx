"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/store";
import { Pin, PinOff, Search } from "lucide-react";
import toast from "react-hot-toast";

interface NewsItem { id:string;title:string;image:string;category:string;views:number;createdAt:string }

export default function AdminPinnedPage() {
  const { locale } = useApp();
  const [news,      setNews]      = useState<NewsItem[]>([]);
  const [pinned,    setPinned]    = useState<string[]>([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(true);

  useEffect(()=>{
    Promise.all([
      fetch("/api/news?limit=100").then(r=>r.json()),
      fetch("/api/admin/pinned").then(r=>r.json()),
    ]).then(([nd,pd])=>{ setNews(nd.news||[]); setPinned(pd.pinnedIds||[]); setLoading(false); });
  },[]);

  async function togglePin(id:string) {
    const action = pinned.includes(id) ? "remove" : "add";
    if (action==="add" && pinned.length>=4) { toast.error(locale==="fa"?"حداکثر ۴ خبر می‌توان پین کرد":"Max 4 pinned articles"); return; }
    const res = await fetch("/api/admin/pinned",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,id})});
    if(res.ok){ const d=await res.json(); setPinned(d.pinnedIds); toast.success(action==="add"?(locale==="fa"?"پین شد 📌":"Pinned 📌"):(locale==="fa"?"پین برداشته شد":"Unpinned")); }
  }

  const filtered = search ? news.filter(n=>n.title.toLowerCase().includes(search.toLowerCase())) : news;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{color:"var(--text)"}}>
          📌 {locale==="fa"?"مدیریت اخبار پین‌شده":locale==="ar"?"إدارة الأخبار المثبتة":"Manage Pinned News"}
        </h1>
        <p className="text-xs mt-1" style={{color:"var(--text3)"}}>
          {locale==="fa"?`${pinned.length}/4 خبر پین شده — این‌ها در بخش هیرو صفحه اول نشون داده می‌شن`:`${pinned.length}/4 articles pinned — shown in homepage hero section`}
        </p>
      </div>

      {/* Pinned preview */}
      {pinned.length > 0 && (
        <div className="card p-4 mb-6">
          <h3 className="text-sm font-bold mb-3" style={{color:"var(--text)"}}>{locale==="fa"?"اخبار پین‌شده فعلی:":"Currently Pinned:"}</h3>
          <div className="flex gap-3 flex-wrap">
            {pinned.map((id,i)=>{ const n=news.find(x=>x.id===id); return n?(
              <div key={id} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs" style={{background:"rgba(230,57,70,0.1)",border:"1px solid rgba(230,57,70,0.2)"}}>
                <span className="font-bold" style={{color:"var(--accent)"}}>#{i+1}</span>
                <span className="max-w-[150px] truncate" style={{color:"var(--text)"}}>{n.title}</span>
                <button onClick={()=>togglePin(id)} className="hover:text-[--accent] transition-colors" style={{color:"var(--text3)"}}><PinOff size={12}/></button>
              </div>
            ):null;})}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search size={14} className="absolute start-3 top-1/2 -translate-y-1/2" style={{color:"var(--text3)"}}/>
        <input className="input-field ps-8 text-sm" placeholder={locale==="fa"?"جستجو در عنوان...":"Search title..."} value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      {/* News list */}
      {loading ? <div className="text-center py-12" style={{color:"var(--text3)"}}>Loading...</div> : (
        <div className="card overflow-hidden">
          <div className="table-wrap">
            <table>
              <thead><tr>
                <th>{locale==="fa"?"وضعیت":"Status"}</th>
                <th>{locale==="fa"?"تصویر":"Image"}</th>
                <th>{locale==="fa"?"عنوان":"Title"}</th>
                <th>{locale==="fa"?"دسته":"Category"}</th>
                <th>{locale==="fa"?"تاریخ":"Date"}</th>
                <th>{locale==="fa"?"پین":"Pin"}</th>
              </tr></thead>
              <tbody>
                {filtered.map(n=>{
                  const isPinned = pinned.includes(n.id);
                  const pinPos   = pinned.indexOf(n.id)+1;
                  return (
                    <tr key={n.id} style={{background:isPinned?"rgba(230,57,70,0.05)":""}}>
                      <td>
                        {isPinned
                          ? <span className="status-badge status-published flex items-center gap-1 w-fit"><Pin size={9}/>#{pinPos}</span>
                          : <span className="text-xs" style={{color:"var(--text3)"}}>—</span>}
                      </td>
                      <td>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={n.image} alt="" className="w-12 h-8 object-cover rounded" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                      </td>
                      <td style={{maxWidth:260}}>
                        <div className="truncate text-sm font-semibold" style={{color:"var(--text)"}}>{n.title}</div>
                      </td>
                      <td className="text-xs" style={{color:"var(--text2)"}}>{n.category}</td>
                      <td className="text-xs" style={{color:"var(--text3)"}}>{n.createdAt?.slice(0,10)}</td>
                      <td>
                        <button
                          onClick={()=>togglePin(n.id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
                          style={{
                            background: isPinned?"rgba(230,57,70,0.1)":"var(--bg3)",
                            borderColor: isPinned?"var(--accent)":"var(--border)",
                            color: isPinned?"var(--accent)":"var(--text2)",
                          }}
                        >
                          {isPinned?<><PinOff size={11}/>{locale==="fa"?"بردار":"Unpin"}</>:<><Pin size={11}/>{locale==="fa"?"پین":"Pin"}</>}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
