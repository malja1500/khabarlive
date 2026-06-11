"use client";
import Link from "next/link";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";

export function Footer() {
  const { locale } = useApp();
  const t = translations[locale];

  return (
    <footer className="border-t mt-16" style={{ background:"var(--card)", borderColor:"var(--border)" }}>
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="text-2xl font-black mb-4" style={{ background:"linear-gradient(135deg,#e63946,#f4a261)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              {locale==="fa"?<>خبر<span className="font-light">لایو</span></>:locale==="ar"?"خبر لايف":"KhabarLive"}
            </div>
            <p className="text-sm mb-6" style={{ color:"var(--text2)", lineHeight:1.8 }}>
              {locale==="fa"?"پلتفرم اخبار لحظه‌ای با تیمی از بهترین روزنامه‌نگاران ایران.":locale==="ar"?"منصة الأخبار الفورية مع فريق من أفضل الصحفيين الإيرانيين.":"A live news platform with a team of top journalists."}
            </p>
            <div className="flex gap-2">
              {["𝕏","📸","✈","▶"].map((icon,i)=>(
                <button key={i} className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all hover:bg-[--accent] hover:text-white" style={{ background:"var(--bg3)", border:"1px solid var(--border)", color:"var(--text2)" }}>{icon}</button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold mb-4 text-sm" style={{ color:"var(--text)" }}>{locale==="fa"?"دسته‌بندی‌ها":locale==="ar"?"التصنيفات":"Categories"}</h4>
            <ul className="space-y-2">
              {Object.entries(t.categories).filter(([k])=>k!=="all").map(([key,label])=>(
                <li key={key}>
                  <Link href={`/news?category=${key}`} className="text-sm transition-colors hover:text-[--accent]" style={{ color:"var(--text2)" }}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold mb-4 text-sm" style={{ color:"var(--text)" }}>{locale==="fa"?"خبرلایو":locale==="ar"?"عن خبر لايف":"KhabarLive"}</h4>
            <ul className="space-y-2">
              <li><Link href="/about"   className="text-sm transition-colors hover:text-[--accent]" style={{ color:"var(--text2)" }}>{locale==="fa"?"درباره ما":locale==="ar"?"من نحن":"About Us"}</Link></li>
              <li><Link href="/contact" className="text-sm transition-colors hover:text-[--accent]" style={{ color:"var(--text2)" }}>{locale==="fa"?"تماس با ما":locale==="ar"?"اتصل بنا":"Contact"}</Link></li>
              <li><Link href="/agencies" className="text-sm transition-colors hover:text-[--accent]" style={{ color:"var(--text2)" }}>{locale==="fa"?"خبرگزاری‌ها":locale==="ar"?"وكالات الأنباء":"Agencies"}</Link></li>
              <li><a href="#" className="text-sm transition-colors hover:text-[--accent]" style={{ color:"var(--text2)" }}>{locale==="fa"?"خبرنگاران":locale==="ar"?"المراسلون":"Reporters"}</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-4 text-sm" style={{ color:"var(--text)" }}>{locale==="fa"?"قوانین":locale==="ar"?"القوانين":"Legal"}</h4>
            <ul className="space-y-2">
              {(locale==="fa"?["حریم خصوصی","شرایط استفاده","کپی‌رایت"]:locale==="ar"?["سياسة الخصوصية","شروط الاستخدام","حقوق النشر"]:["Privacy Policy","Terms of Use","Copyright"]).map(item=>(
                <li key={item}><a href="#" className="text-sm transition-colors hover:text-[--accent]" style={{ color:"var(--text2)" }}>{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ borderColor:"var(--border)", color:"var(--text3)" }}>
          <span>© ۱۴۰۵ {locale==="fa"?"خبرلایو — ":locale==="ar"?"خبر لايف — ":"KhabarLive — "}{t.footer.rights}</span>
          <span>{t.footer.madeIn}</span>
        </div>
      </div>
    </footer>
  );
}
