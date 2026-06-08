"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useApp, useAuth } from "@/store";
import { translations } from "@/lib/i18n";
import { Navbar } from "@/components/layout/Navbar";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useApp();
  const { login } = useAuth();
  const t = translations[locale].auth;

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name || !form.email || !form.password) { setError(locale === "fa" ? "همه فیلدها الزامی است" : "All fields required"); return; }
    if (form.password !== form.confirm) { setError(locale === "fa" ? "رمز عبور با تأییدیه مطابقت ندارد" : "Passwords do not match"); return; }
    if (form.password.length < 6) { setError(locale === "fa" ? "رمز عبور باید حداقل ۶ کاراکتر باشد" : "Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (res.status === 409) { setError(t.emailExists); setLoading(false); return; }
      if (!res.ok) { setError(locale === "fa" ? "خطایی رخ داد" : "An error occurred"); setLoading(false); return; }
      login(data.user);
      toast.success(t.registerSuccess);
      router.push("/");
    } catch {
      setError(locale === "fa" ? "خطا در اتصال به سرور" : "Connection error");
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-66px)] flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md">
          <div className="card p-8 sm:p-10" style={{ border: "1px solid var(--border2)", boxShadow: "var(--shadow)" }}>
            <div className="text-center mb-8">
              <div className="text-3xl font-black mb-2" style={{ background: "linear-gradient(135deg,#e63946,#f4a261)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {locale === "fa" ? <>خبر<span className="font-light">لایو</span></> : "KhabarLive"}
              </div>
              <h1 className="text-xl font-black mb-1" style={{ color: "var(--text)" }}>{t.registerBtn}</h1>
              <p className="text-xs" style={{ color: "var(--text2)" }}>{locale === "fa" ? "حساب کاربری جدید بسازید" : locale === "ar" ? "إنشاء حساب جديد" : "Create a new account"}</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl text-xs mb-4" style={{ background: "rgba(230,57,70,0.1)", border: "1px solid rgba(230,57,70,0.3)", color: "var(--accent)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text2)" }}>{t.name}</label>
                <input className="input-field" type="text" placeholder={t.namePlaceholder} value={form.name} onChange={set("name")} required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text2)" }}>{t.email}</label>
                <input className="input-field" type="email" placeholder={t.emailPlaceholder} value={form.email} onChange={set("email")} required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text2)" }}>{t.password}</label>
                <div className="relative">
                  <input className="input-field pe-10" type={showPass ? "text" : "password"} placeholder={t.passwordPlaceholder} value={form.password} onChange={set("password")} required />
                  <button type="button" className="absolute inset-y-0 end-3 flex items-center" style={{ color: "var(--text3)" }} onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text2)" }}>{t.confirmPassword}</label>
                <input className="input-field" type="password" placeholder={t.passwordPlaceholder} value={form.confirm} onChange={set("confirm")} required />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3 rounded-xl text-sm font-bold mt-2" style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "..." : t.registerBtn}
              </button>
            </form>

            <p className="text-center text-xs mt-6" style={{ color: "var(--text2)" }}>
              {t.hasAccount}{" "}
              <Link href="/login" className="font-bold hover:underline" style={{ color: "var(--accent)" }}>{t.loginBtn}</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
