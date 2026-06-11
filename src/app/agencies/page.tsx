"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/store";
import { ExternalLink, Globe, ArrowRight } from "lucide-react";

interface Agency { id:string; name:string; name_fa:string; lang:string; logo:string; rss:string }
interface AgencyList { domestic: Agency[]; international: Agency[] }
interface ExternalNews { id:string; title:string; excerpt:string; image:string; category:string; source:string; sourceId:string; sourceLogo:string; sourceUrl:string; publishedAt:string }

function AgenciesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useApp();

  const [agencies,   setAgencies]   = useState<AgencyList>({ domestic:[], international:[] });
  const [news,       setNews]       = useState<ExternalNews[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [activeType, setActiveType] = useState<"all"|"domestic"|"international">(
    (searchParams.get("type") as any) || "all"
  );
  const [activeAgency, setActiveAgency] = useState(searchParams.get("agency") || "");

  // Load agency list
  useEffect(() => {
    fetch("/api/news/external?list=1").then(r=>r.json()).then(d=>setAgencies(d));
  }, []);

  // Load news when filter changes
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeAgency) params.set("agency", activeAgency);
    else params.set("type", activeType);
    params.set("count", "12");
    fetch(`/api/news/external?${params}`).then(r=>r.json()).then(d=>{
      setNews(d.news || []);
      setLoading(false);
    });
  }, [activeType, activeAgency]);

  const allAgencies = [...agencies.domestic, ...agencies.international];
  const currentAgency = allAgencies.find(a => a.id === activeAgency);

  return (
    <>
      <Navbar/>
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold border" style={{ background:"rgba(230,57,70,0.08)", borderColor:"rgba(230,57,70,0.2)", color:"var(--accent)" }}>
            <Globe size={12}/>
            {locale==="fa"?"خبرگزاری‌ها":locale==="ar"?"وكالات الأنباء":"News Agencies"}
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color:"var(--text)" }}>
            {locale==="fa"?"اخبار خبرگزاری‌ها":locale==="ar"?"أخبار وكالات الأنباء":"Agency News"}
          </h1>
          <p className="text-sm" style={{ color:"var(--text2)" }}>
            {locale==="fa"?"اخبار مستقیم از خبرگزاری‌های داخلی و بین‌المللی":"Direct news from domestic and international agencies"}
          </p>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { key:"all",           fa:"همه خبرگزاری‌ها", en:"All Agencies" },
            { key:"domestic",      fa:"خبرگزاری‌های داخلی", en:"Domestic" },
            { key:"international", fa:"خبرگزاری‌های خارجی", en:"International" },
          ] as const).map(tab=>(
            <button key={tab.key} onClick={()=>{setActiveType(tab.key);setActiveAgency("");}} className="px-4 py-2 rounded-full text-xs font-bold transition-all border" style={{ background:activeType===tab.key&&!activeAgency?"var(--accent)":"var(--card)", color:activeType===tab.key&&!activeAgency?"#fff":"var(--text2)", borderColor:activeType===tab.key&&!activeAgency?"var(--accent)":"var(--border)" }}>
              {locale==="en"?tab.en:tab.fa}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Agency list */}
          <div className="lg:col-span-1">
            {/* Domestic */}
            <div className="card p-4 mb-4">
              <h3 className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color:"var(--text3)" }}>
                🇮🇷 {locale==="fa"?"داخلی":"Domestic"}
              </h3>
              <div className="space-y-1">
                {agencies.domestic.map(a=>(
                  <button key={a.id} onClick={()=>{setActiveAgency(a.id);setActiveType("domestic");}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-start" style={{ background:activeAgency===a.id?"rgba(230,57,70,0.1)":"", color:activeAgency===a.id?"var(--accent)":"var(--text2)", border:activeAgency===a.id?"1px solid rgba(230,57,70,0.2)":"1px solid transparent" }}>
                    <span>{a.logo}</span>
                    <span className="flex-1">{a.name_fa}</span>
                    {activeAgency===a.id && <ArrowRight size={10}/>}
                  </button>
                ))}
              </div>
            </div>
            {/* International */}
            <div className="card p-4">
              <h3 className="text-xs font-bold mb-3 flex items-center gap-2" style={{ color:"var(--text3)" }}>
                🌍 {locale==="fa"?"بین‌المللی":"International"}
              </h3>
              <div className="space-y-1">
                {agencies.international.map(a=>(
                  <button key={a.id} onClick={()=>{setActiveAgency(a.id);setActiveType("international");}} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all text-start" style={{ background:activeAgency===a.id?"rgba(230,57,70,0.1)":"", color:activeAgency===a.id?"var(--accent)":"var(--text2)", border:activeAgency===a.id?"1px solid rgba(230,57,70,0.2)":"1px solid transparent" }}>
                    <span>{a.logo}</span>
                    <span className="flex-1">{a.name}</span>
                    {activeAgency===a.id && <ArrowRight size={10}/>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* News grid */}
          <div className="lg:col-span-3">
            {currentAgency && (
              <div className="flex items-center gap-3 mb-5 p-4 card" style={{ border:"1px solid var(--border)" }}>
                <span className="text-3xl">{currentAgency.logo}</span>
                <div>
                  <div className="font-black text-base" style={{ color:"var(--text)" }}>{currentAgency.name_fa}</div>
                  <div className="text-xs" style={{ color:"var(--text3)" }}>{currentAgency.name} • {currentAgency.lang==="fa"?"فارسی":currentAgency.lang==="ar"?"عربی":"English"}</div>
                </div>
                <a href={currentAgency.rss} target="_blank" rel="noopener noreferrer" className="ms-auto btn-secondary text-xs py-1.5 px-3 rounded-lg flex items-center gap-1">
                  <ExternalLink size={11}/>RSS
                </a>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({length:6}).map((_,i)=><div key={i} className="card h-52 shimmer"/>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {news.map(item=>(
                  <div key={item.id} className="card news-card-hover overflow-hidden cursor-pointer" style={{ border:"1px solid var(--border)" }}>
                    <div className="relative h-40 overflow-hidden bg-[--bg3]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                      <div className="absolute top-2 end-2 px-2 py-1 rounded-lg text-xs font-bold" style={{ background:"rgba(0,0,0,0.7)", color:"#fff" }}>
                        {item.sourceLogo} {item.source}
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-bold leading-relaxed line-clamp-2 mb-2" style={{ color:"var(--text)" }}>{item.title}</div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs" style={{ color:"var(--text3)" }}>{new Date(item.publishedAt).toLocaleDateString(locale==="fa"?"fa-IR":locale==="ar"?"ar":"en-US")}</div>
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center gap-1 hover:text-[--accent] transition-colors" style={{ color:"var(--text3)" }}>
                          <ExternalLink size={10}/>
                          {locale==="fa"?"منبع":"Source"}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}

export default function AgenciesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ color:"var(--text3)" }}>Loading...</div>}>
      <AgenciesContent/>
    </Suspense>
  );
}
