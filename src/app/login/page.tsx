"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useApp, useAuth } from "@/store";
import { translations } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useApp();
  const { login } = useAuth();
  const t = translations[locale].auth;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError(t.wrongCredentials);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(t.wrongCredentials);
        setLoading(false);
        return;
      }
      login(data.user);
      toast.success(t.loginSuccess);
      if (data.user.role === "admin") router.push("/admin");
      else router.push("/");
    } catch {
      setError(t.wrongCredentials);
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-66px)] flex items-center justify-center p-4">
        <div
          className="w-full max-w-[900px] rounded-2xl overflow-hidden flex"
          style={{
            border: "1px solid var(--border2)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
          }}
        >
          {/* Left panel */}
          <div
            className="hidden md:flex flex-col justify-between p-12 flex-1 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg,#e63946 0%,#7c1926 60%,#3d0a11 100%)",
            }}
          >
            <div
              className="absolute -top-20 -start-20 w-72 h-72 rounded-full opacity-10"
              style={{ background: "#fff" }}
            />
            <div
              className="absolute -bottom-16 -end-16 w-56 h-56 rounded-full opacity-10"
              style={{ background: "#fff" }}
            />
            <div className="relative z-10">
              <div className="text-3xl font-black text-white mb-3">
                {locale === "fa" ? (
                  <>
                    خبر<span className="font-light">لایو</span>
                  </>
                ) : locale === "ar" ? (
                  "خبر لايف"
                ) : (
                  "KhabarLive"
                )}
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                {locale === "fa"
                  ? "پلتفرم اخبار لحظه‌ای با تیمی از بهترین روزنامه‌نگاران"
                  : locale === "ar"
                    ? "منصة الأخبار الفورية مع أفضل الصحفيين"
                    : "Live news platform with top journalists"}
              </p>
            </div>
            <div className="relative z-10 space-y-4">
              {[
                {
                  icon: "⚡",
                  text:
                    locale === "fa"
                      ? "اخبار لحظه‌ای ۲۴/۷"
                      : locale === "ar"
                        ? "أخبار فورية 24/7"
                        : "Live News 24/7",
                },
                {
                  icon: "🌍",
                  text:
                    locale === "fa"
                      ? "پوشش اخبار جهانی"
                      : locale === "ar"
                        ? "تغطية أخبار دولية"
                        : "Global News Coverage",
                },
                {
                  icon: "🔔",
                  text:
                    locale === "fa"
                      ? "اعلان‌های فوری"
                      : locale === "ar"
                        ? "إشعارات فورية"
                        : "Instant Notifications",
                },
                {
                  icon: "🔒",
                  text:
                    locale === "fa"
                      ? "امنیت کامل"
                      : locale === "ar"
                        ? "أمان كامل"
                        : "Full Security",
                },
              ].map((f) => (
                <div
                  key={f.text}
                  className="flex items-center gap-3 text-white/90 text-sm"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-base"
                    style={{ background: "rgba(255,255,255,0.2)" }}
                  >
                    {f.icon}
                  </div>
                  {f.text}
                </div>
              ))}
            </div>
            <p className="relative z-10 text-white/40 text-xs">
              © ۱۴۰۵ خبرلایو
            </p>
          </div>

          {/* Right panel */}
          <div
            className="flex-1 p-8 sm:p-12"
            style={{ background: "var(--card)" }}
          >
            <h1
              className="text-2xl font-black mb-2"
              style={{ color: "var(--text)" }}
            >
              {t.loginTitle}
            </h1>
            <p className="text-sm mb-6" style={{ color: "var(--text2)" }}>
              {t.loginSub}
            </p>

            {/* Demo hint */}
            {/* <div className="p-3 rounded-xl text-xs text-center mb-6" style={{ background: "rgba(230,57,70,0.08)", border: "1px solid rgba(230,57,70,0.2)", color: "var(--text2)" }}>
              {locale === "fa" ? "دمو ادمین:" : locale === "ar" ? "حساب المشرف:" : "Admin demo:"}{" "}
              <strong style={{ color: "var(--accent)" }}>admin@khabarlive.ir</strong> / <strong style={{ color: "var(--accent)" }}>Admin@1234</strong>
            </div> */}

            {error && (
              <div
                className="p-3 rounded-xl text-xs mb-4"
                style={{
                  background: "rgba(230,57,70,0.1)",
                  border: "1px solid rgba(230,57,70,0.3)",
                  color: "var(--accent)",
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-xs font-semibold mb-2"
                  style={{ color: "var(--text2)" }}
                >
                  {t.email}
                </label>
                <input
                  className="input-field"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-2"
                  style={{ color: "var(--text2)" }}
                >
                  {t.password}
                </label>
                <div className="relative">
                  <input
                    className="input-field pe-10"
                    type={showPass ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 end-3 flex items-center"
                    style={{ color: "var(--text3)" }}
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs hover:text-[--accent] transition-colors"
                  style={{ color: "var(--text3)" }}
                >
                  {t.forgotPass}
                </Link>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl text-sm font-bold mt-2"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "..." : t.loginBtn}
              </button>
            </form>

            <div
              className="my-5 flex items-center gap-3 text-xs"
              style={{ color: "var(--text3)" }}
            >
              <div
                className="flex-1 h-px"
                style={{ background: "var(--border2)" }}
              />
              {locale === "fa" ? "یا" : locale === "ar" ? "أو" : "or"}
              <div
                className="flex-1 h-px"
                style={{ background: "var(--border2)" }}
              />
            </div>

            <p
              className="text-center text-xs"
              style={{ color: "var(--text2)" }}
            >
              {t.noAccount}{" "}
              <Link
                href="/register"
                className="font-bold hover:underline"
                style={{ color: "var(--accent)" }}
              >
                {t.registerBtn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
