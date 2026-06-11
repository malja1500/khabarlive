"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Sun, Moon, Globe, Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useApp, useAuth } from "@/store";
import { translations, Locale } from "@/lib/i18n";
import { LogoutModal } from "@/components/shared/LogoutModal";
import toast from "react-hot-toast";

export function Navbar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, locale, setTheme, setLocale } = useApp();
  const { user, isLoggedIn, logout } = useAuth();
  const t = translations[locale];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const isAdmin = pathname.startsWith("/admin");

  async function handleLogout() {
    await fetch("/api/auth/logout", { method:"POST" });
    logout();
    router.push("/");
    toast.success(locale==="fa"?"خارج شدید":"Logged out");
  }

  const cats = [
    { key:"all",      label:t.categories.all },
    { key:"tech",     label:t.categories.tech },
    { key:"economy",  label:t.categories.economy },
    { key:"sport",    label:t.categories.sport },
    { key:"world",    label:t.categories.world },
    { key:"politics", label:t.categories.politics },
    { key:"culture",  label:t.categories.culture },
  ];

  const navLinkStyle = { color:"var(--text2)" };
  const navLinkClass = "text-xs font-medium transition-colors hover:text-[--accent] whitespace-nowrap";

  return (
    <>
      {/* Ticker */}
      {!isAdmin && (
        <div className="bg-[--accent] overflow-hidden py-2 relative">
          <div className="absolute inset-y-0 end-0 w-16 bg-gradient-to-l from-[--accent] to-transparent z-10 pointer-events-none"/>
          <div className="flex whitespace-nowrap ticker-animate">
            {["بورس تهران ۲.۳٪ رشد کرد","ایران ۱۲ سهمیه المپیک ۲۰۲۸ کسب کرد","گوگل Gemini Ultra 2 رونمایی کرد","اجلاس بریکس با ۴۸ کشور","توافق‌نامه آب‌وهوایی جنوا امضا شد","بورس تهران ۲.۳٪ رشد کرد","ایران ۱۲ سهمیه المپیک ۲۰۲۸ کسب کرد","گوگل Gemini Ultra 2 رونمایی کرد","اجلاس بریکس با ۴۸ کشور","توافق‌نامه آب‌وهوایی جنوا امضا شد"].map((item,i)=>(
              <span key={i} className="px-8 text-white text-xs font-medium"><span className="opacity-60 mx-2 text-[8px]">●</span>{item}</span>
            ))}
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 border-b" style={{ background:"var(--bg2)", backdropFilter:"blur(24px)", borderColor:"var(--border2)" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 flex items-center h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="text-xl font-black shrink-0" style={{ background:"linear-gradient(135deg,#e63946,#f4a261)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            {locale==="fa"?<>خبر<span className="font-light">لایو</span></>:locale==="ar"?<>خبر<span className="font-light"> لايف</span></>:<>Khabar<span className="font-light">Live</span></>}
          </Link>

          {/* Category tabs - desktop */}
          {!isAdmin && (
            <div className="hidden md:flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
              {cats.map(c=>(
                <Link key={c.key} href={c.key==="all"?"/news":`/news?category=${c.key}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all hover:bg-[--accent] hover:text-white"
                  style={{ color:"var(--text2)" }}>
                  {c.label}
                </Link>
              ))}
            </div>
          )}
          {isAdmin && <div className="flex-1"/>}

          {/* Right links — desktop */}
          {!isAdmin && (
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <Link href="/agencies" className={navLinkClass} style={navLinkStyle}>{locale==="fa"?"خبرگزاری‌ها":locale==="ar"?"وكالات":"Agencies"}</Link>
              <Link href="/about"   className={navLinkClass} style={navLinkStyle}>{locale==="fa"?"درباره ما":locale==="ar"?"من نحن":"About"}</Link>
              <Link href="/contact" className={navLinkClass} style={navLinkStyle}>{locale==="fa"?"تماس با ما":locale==="ar"?"تواصل":"Contact"}</Link>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme */}
            <button onClick={()=>setTheme(theme==="dark"?"light":"dark")} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-[--bg3]" style={{ color:"var(--text2)" }}>
              {theme==="dark"?<Sun size={16}/>:<Moon size={16}/>}
            </button>

            {/* Language */}
            <div className="relative">
              <button onClick={()=>setLangOpen(!langOpen)} className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-[--bg3]" style={{ color:"var(--text2)" }}>
                <Globe size={16}/>
              </button>
              {langOpen && (
                <div className="absolute top-10 end-0 card py-2 min-w-[130px] shadow-lg z-50 animate-slide-down" style={{ boxShadow:"var(--shadow)" }}>
                  {(["fa","en","ar"] as Locale[]).map(l=>(
                    <button key={l} onClick={()=>{setLocale(l);setLangOpen(false);}} className="w-full text-start px-4 py-2 text-sm transition-all hover:bg-[--bg3]" style={{ color:locale===l?"var(--accent)":"var(--text2)", fontWeight:locale===l?"700":"400" }}>
                      {l==="fa"?"فارسی 🇮🇷":l==="en"?"English 🇬🇧":"العربية 🇸🇦"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth */}
            {isLoggedIn && user ? (
              <div className="flex items-center gap-2">
                {user.role==="admin" && (
                  <Link href="/admin" className="hidden sm:block btn-primary text-xs py-1.5 px-3 rounded-lg">{t.nav.admin}</Link>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar||"https://i.pravatar.cc/40"} alt="" className="w-8 h-8 rounded-full object-cover border-2 cursor-pointer" style={{ borderColor:"var(--accent)" }}/>
                <button onClick={()=>setShowLogout(true)} className="hidden sm:flex items-center gap-1.5 text-xs font-medium transition-all hover:text-[--accent]" style={{ color:"var(--text2)" }}>
                  <LogOut size={14}/>{t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <Link href="/login"    className="btn-secondary text-xs py-1.5 px-3 rounded-lg">{t.nav.login}</Link>
                <Link href="/register" className="btn-primary  text-xs py-1.5 px-3 rounded-lg">{t.nav.register}</Link>
              </div>
            )}

            {/* Mobile menu */}
            <button className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-[--bg3]" style={{ color:"var(--text2)" }} onClick={()=>setMobileOpen(!mobileOpen)}>
              {mobileOpen?<X size={18}/>:<Menu size={18}/>}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="sm:hidden border-t px-4 py-4 flex flex-col gap-3" style={{ borderColor:"var(--border)", background:"var(--card)" }}>
            <div className="flex flex-wrap gap-2">
              {cats.map(c=>(
                <Link key={c.key} href={c.key==="all"?"/news":`/news?category=${c.key}`} onClick={()=>setMobileOpen(false)} className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all" style={{ color:"var(--text2)", borderColor:"var(--border2)" }}>
                  {c.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-3 pt-2 border-t" style={{ borderColor:"var(--border)" }}>
              <Link href="/agencies" onClick={()=>setMobileOpen(false)} className="text-xs" style={{ color:"var(--text2)" }}>{locale==="fa"?"خبرگزاری‌ها":"Agencies"}</Link>
              <Link href="/about"   onClick={()=>setMobileOpen(false)} className="text-xs" style={{ color:"var(--text2)" }}>{locale==="fa"?"درباره ما":"About"}</Link>
              <Link href="/contact" onClick={()=>setMobileOpen(false)} className="text-xs" style={{ color:"var(--text2)" }}>{locale==="fa"?"تماس با ما":"Contact"}</Link>
            </div>
            <div className="flex gap-2 pt-2 border-t" style={{ borderColor:"var(--border)" }}>
              {isLoggedIn && user ? (
                <>
                  {user.role==="admin" && <Link href="/admin" onClick={()=>setMobileOpen(false)} className="btn-primary text-xs flex-1 text-center py-2">{t.nav.admin}</Link>}
                  <button onClick={()=>{setShowLogout(true);setMobileOpen(false);}} className="btn-secondary text-xs flex-1 py-2">{t.nav.logout}</button>
                </>
              ) : (
                <>
                  <Link href="/login"    onClick={()=>setMobileOpen(false)} className="btn-secondary text-xs flex-1 text-center py-2">{t.nav.login}</Link>
                  <Link href="/register" onClick={()=>setMobileOpen(false)} className="btn-primary  text-xs flex-1 text-center py-2">{t.nav.register}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <LogoutModal open={showLogout} onClose={()=>setShowLogout(false)} onConfirm={handleLogout} locale={locale}/>
    </>
  );
}
