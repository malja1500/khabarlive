"use client";
import { useState } from "react";
import { useApp, useAuth } from "@/store";
import { translations } from "@/lib/i18n";
import { Sun, Moon, Globe } from "lucide-react";
import { Locale } from "@/lib/i18n";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { locale, theme, setTheme, setLocale } = useApp();
  const { user } = useAuth();
  const t = translations[locale].admin;

  const [siteName, setSiteName] = useState("خبرلایو");
  const [siteDesc, setSiteDesc] = useState("پلتفرم اخبار لحظه‌ای");
  const [adminEmail, setAdminEmail] = useState(user?.email || "admin@khabarlive.ir");
  const [notifications, setNotifications] = useState({ email: true, sms: false, comments: true, weekly: true });

  function save() { toast.success(t.settingsSaved); }

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>{t.settings}</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>
          {locale === "fa" ? "پیکربندی کلی سیستم" : "System configuration"}
        </p>
      </div>

      {/* Site info */}
      <div className="card p-5 mb-4">
        <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text)" }}>🌐 {locale === "fa" ? "اطلاعات سایت" : "Site Info"}</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text2)" }}>{locale === "fa" ? "نام سایت" : "Site Name"}</label>
            <input className="input-field text-sm" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text2)" }}>{locale === "fa" ? "توضیحات" : "Description"}</label>
            <input className="input-field text-sm" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text2)" }}>{locale === "fa" ? "ایمیل مدیر" : "Admin Email"}</label>
            <input className="input-field text-sm" type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} dir="ltr" />
          </div>
          <button onClick={save} className="btn-primary text-xs py-2 px-5 rounded-xl">{t.save}</button>
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-5 mb-4">
        <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text)" }}>🎨 {locale === "fa" ? "ظاهر و زبان" : "Appearance & Language"}</h3>
        <div className="space-y-4">
          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text2)" }}>{locale === "fa" ? "تم" : "Theme"}</label>
            <div className="flex gap-3">
              {(["dark", "light"] as const).map((th) => (
                <button key={th} onClick={() => setTheme(th)} className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all border" style={{ background: theme === th ? "var(--accent)" : "var(--bg3)", color: theme === th ? "#fff" : "var(--text2)", borderColor: theme === th ? "var(--accent)" : "var(--border)" }}>
                  {th === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                  {th === "dark" ? (locale === "fa" ? "تاریک" : "Dark") : (locale === "fa" ? "روشن" : "Light")}
                </button>
              ))}
            </div>
          </div>
          {/* Language */}
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text2)" }}>{locale === "fa" ? "زبان" : "Language"}</label>
            <div className="flex gap-3">
              {(["fa", "en", "ar"] as Locale[]).map((l) => (
                <button key={l} onClick={() => setLocale(l)} className="flex-1 py-3 rounded-xl text-xs font-bold transition-all border" style={{ background: locale === l ? "var(--accent)" : "var(--bg3)", color: locale === l ? "#fff" : "var(--text2)", borderColor: locale === l ? "var(--accent)" : "var(--border)" }}>
                  {l === "fa" ? "🇮🇷 فارسی" : l === "en" ? "🇬🇧 English" : "🇸🇦 العربية"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-5">
        <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text)" }}>🔔 {locale === "fa" ? "اعلان‌ها" : "Notifications"}</h3>
        <div className="space-y-3">
          {Object.entries({
            email: locale === "fa" ? "اعلان ایمیل برای خبر جدید" : "Email for new articles",
            sms: locale === "fa" ? "پیام کوتاه اخبار فوری" : "SMS for breaking news",
            comments: locale === "fa" ? "اعلان نظرات جدید" : "New comment notifications",
            weekly: locale === "fa" ? "گزارش هفتگی آمار" : "Weekly analytics report",
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm" style={{ color: "var(--text2)" }}>{label}</span>
              <button
                onClick={() => setNotifications((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: notifications[key as keyof typeof notifications] ? "var(--accent)" : "var(--bg3)", border: "1px solid var(--border2)" }}
              >
                <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ insetInlineStart: notifications[key as keyof typeof notifications] ? "calc(100% - 1.1rem)" : "2px" }} />
              </button>
            </div>
          ))}
          <button onClick={save} className="btn-primary text-xs py-2 px-5 rounded-xl mt-2">{t.save}</button>
        </div>
      </div>
    </div>
  );
}
