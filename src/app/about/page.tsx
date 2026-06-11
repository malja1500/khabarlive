"use client";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/store";

const TEAM = [
  { name:"علی رضایی", role:"سردبیر ارشد", nameEn:"Ali Rezaei", roleEn:"Editor-in-Chief", img:"https://i.pravatar.cc/120?img=3" },
  { name:"سارا احمدی", role:"خبرنگار اقتصادی", nameEn:"Sara Ahmadi", roleEn:"Economics Reporter", img:"https://i.pravatar.cc/120?img=5" },
  { name:"رضا ملکی", role:"خبرنگار ورزشی", nameEn:"Reza Maleki", roleEn:"Sports Reporter", img:"https://i.pravatar.cc/120?img=8" },
  { name:"لیلا کریمی", role:"عکاس و خبرنگار", nameEn:"Leila Karimi", roleEn:"Photographer & Reporter", img:"https://i.pravatar.cc/120?img=10" },
  { name:"آرش محمودی", role:"خبرنگار فناوری", nameEn:"Arash Mahmoudi", roleEn:"Tech Reporter", img:"https://i.pravatar.cc/120?img=15" },
  { name:"نیلوفر رحیمی", role:"خبرنگار فرهنگی", nameEn:"Niloufar Rahimi", roleEn:"Culture Reporter", img:"https://i.pravatar.cc/120?img=25" },
];

const STATS = [
  { fa:"۱۲۸۴", en:"1,284", label_fa:"خبر روزانه", label_en:"Daily Articles" },
  { fa:"۴۸", en:"48", label_fa:"خبرنگار فعال", label_en:"Active Reporters" },
  { fa:"۲.۴M", en:"2.4M", label_fa:"بازدید روزانه", label_en:"Daily Visits" },
  { fa:"۷", en:"7", label_fa:"دسته‌بندی", label_en:"Categories" },
];

export default function AboutPage() {
  const { locale } = useApp();
  const isRtl = locale !== "en";

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <div className="relative overflow-hidden py-24 px-4 text-center" style={{ background: "linear-gradient(135deg,#0a0a0f 0%,#1a0a0e 50%,#0a0a0f 100%)" }}>
          <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at 50% 50%, #e63946 0%, transparent 70%)" }} />
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-bold border" style={{ background: "rgba(230,57,70,0.1)", borderColor: "rgba(230,57,70,0.3)", color: "var(--accent)" }}>
              {locale === "fa" ? "🏢 درباره ما" : locale === "ar" ? "🏢 من نحن" : "🏢 About Us"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-6 text-white leading-tight">
              {locale === "fa" ? <>خبر<span style={{ color: "var(--accent)" }}>لایو</span></> : locale === "ar" ? <>خبر<span style={{ color: "var(--accent)" }}> لايف</span></> : <>Khabar<span style={{ color: "var(--accent)" }}>Live</span></>}
            </h1>
            <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
              {locale === "fa"
                ? "پلتفرم اخبار لحظه‌ای با تیمی از بهترین روزنامه‌نگاران ایران. متعهد به ارائه اخبار دقیق، سریع و بی‌طرفانه از ایران و جهان."
                : locale === "ar"
                ? "منصة الأخبار الفورية مع فريق من أفضل الصحفيين الإيرانيين، ملتزمون بتقديم أخبار دقيقة وسريعة ومحايدة."
                : "A live news platform with a team of Iran's best journalists. Committed to delivering accurate, fast, and unbiased news from Iran and the world."}
            </p>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-16">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
            {STATS.map((s, i) => (
              <div key={i} className="card p-6 text-center">
                <div className="text-3xl font-black mb-2" style={{ background: "linear-gradient(135deg,#e63946,#f4a261)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {locale === "en" ? s.en : s.fa}
                </div>
                <div className="text-xs" style={{ color: "var(--text3)" }}>{locale === "en" ? s.label_en : s.label_fa}</div>
              </div>
            ))}
          </div>

          {/* Mission */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20 items-center">
            <div>
              <h2 className="text-2xl font-black mb-4" style={{ color: "var(--text)" }}>
                {locale === "fa" ? "مأموریت ما" : locale === "ar" ? "مهمتنا" : "Our Mission"}
              </h2>
              <p className="leading-relaxed mb-4" style={{ color: "var(--text2)", lineHeight: 2 }}>
                {locale === "fa"
                  ? "خبرلایو در سال ۱۴۰۲ با هدف ایجاد یک پلتفرم خبری مستقل و معتبر تأسیس شد. ما باور داریم که مردم حق دارند از رویدادهای جهان با دقت و سرعت مطلع شوند."
                  : locale === "ar"
                  ? "تأسست خبر لايف عام 2023 بهدف إنشاء منصة إخبارية مستقلة وموثوقة. نؤمن بحق الناس في الاطلاع على أحداث العالم بدقة وسرعة."
                  : "KhabarLive was founded in 2023 with the goal of creating an independent and credible news platform. We believe people have the right to be informed about world events with accuracy and speed."}
              </p>
              <p className="leading-relaxed" style={{ color: "var(--text2)", lineHeight: 2 }}>
                {locale === "fa"
                  ? "تیم ما از بیش از ۴۸ خبرنگار و روزنامه‌نگار حرفه‌ای تشکیل شده که ۲۴ ساعت شبانه‌روز اخبار ایران و جهان را پوشش می‌دهند."
                  : locale === "ar"
                  ? "يتكون فريقنا من أكثر من 48 صحفياً محترفاً يغطون أخبار إيران والعالم على مدار الساعة."
                  : "Our team consists of more than 48 professional journalists covering Iran and world news 24/7."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon:"🎯", fa:"دقت و صداقت", en:"Accuracy & Honesty" },
                { icon:"⚡", fa:"سرعت در خبررسانی", en:"Speed in Reporting" },
                { icon:"🌍", fa:"پوشش جهانی", en:"Global Coverage" },
                { icon:"🔒", fa:"استقلال رسانه‌ای", en:"Media Independence" },
              ].map((v, i) => (
                <div key={i} className="card p-4 text-center">
                  <div className="text-3xl mb-2">{v.icon}</div>
                  <div className="text-xs font-bold" style={{ color: "var(--text)" }}>{locale === "en" ? v.en : v.fa}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-16">
            <h2 className="text-2xl font-black mb-8 text-center" style={{ color: "var(--text)" }}>
              {locale === "fa" ? "تیم ما" : locale === "ar" ? "فريقنا" : "Our Team"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
              {TEAM.map((m, i) => (
                <div key={i} className="card p-4 text-center group cursor-pointer transition-all hover:-translate-y-1" style={{ border: "1px solid var(--border)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.img} alt={m.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 transition-all group-hover:border-[--accent]" style={{ borderColor: "var(--border2)" }} />
                  <div className="text-xs font-bold mb-1" style={{ color: "var(--text)" }}>{locale === "en" ? m.nameEn : m.name}</div>
                  <div className="text-[10px]" style={{ color: "var(--text3)" }}>{locale === "en" ? m.roleEn : m.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center card p-10" style={{ background: "linear-gradient(135deg,rgba(230,57,70,0.1),rgba(244,162,97,0.05))", border: "1px solid rgba(230,57,70,0.2)" }}>
            <h3 className="text-xl font-black mb-3" style={{ color: "var(--text)" }}>
              {locale === "fa" ? "با ما در تماس باشید" : locale === "ar" ? "تواصل معنا" : "Get in Touch"}
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text2)" }}>
              {locale === "fa" ? "هرگونه سوال، پیشنهاد یا انتقاد داری؟ خوشحال می‌شیم بشنویم." : locale === "ar" ? "هل لديك سؤال أو اقتراح؟ يسعدنا الاستماع." : "Have a question, suggestion or feedback? We'd love to hear it."}
            </p>
            <Link href="/contact" className="btn-primary inline-block py-3 px-8 rounded-xl text-sm font-bold">
              {locale === "fa" ? "تماس با ما →" : locale === "ar" ? "تواصل معنا ←" : "Contact Us →"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
