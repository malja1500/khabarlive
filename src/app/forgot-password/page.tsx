"use client";
import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useApp } from "@/store";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

type Step = "email" | "sent";

export default function ForgotPasswordPage() {
  const { locale } = useApp();
  const [step, setStep]   = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate API call
    setLoading(false);
    setStep("sent");
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-66px)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {step === "email" ? (
            <div className="card p-8 sm:p-10 animate-fade-up" style={{ border: "1px solid var(--border2)", boxShadow: "var(--shadow)" }}>
              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(230,57,70,0.1)" }}>
                <Mail size={28} style={{ color: "var(--accent)" }} />
              </div>

              <h1 className="text-2xl font-black text-center mb-2" style={{ color: "var(--text)" }}>
                {locale === "fa" ? "فراموشی رمز عبور" : locale === "ar" ? "نسيت كلمة المرور" : "Forgot Password"}
              </h1>
              <p className="text-sm text-center mb-8" style={{ color: "var(--text2)", lineHeight: 1.8 }}>
                {locale === "fa"
                  ? "ایمیل حساب خود را وارد کنید. لینک بازیابی رمز برایتان ارسال می‌شود."
                  : locale === "ar"
                  ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور."
                  : "Enter your account email. We'll send you a password reset link."}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text2)" }}>
                    {locale === "fa" ? "آدرس ایمیل" : locale === "ar" ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    className="input-field"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    dir="ltr"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading
                    ? (locale === "fa" ? "در حال ارسال..." : "Sending...")
                    : (locale === "fa" ? "ارسال لینک بازیابی" : locale === "ar" ? "إرسال رابط الاسترداد" : "Send Reset Link")}
                </button>
              </form>

              <p className="text-center text-xs mt-6" style={{ color: "var(--text2)" }}>
                <Link href="/login" className="font-bold flex items-center justify-center gap-1 hover:text-[--accent] transition-colors" style={{ color: "var(--text2)" }}>
                  <ArrowRight size={14} />
                  {locale === "fa" ? "بازگشت به ورود" : locale === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
                </Link>
              </p>
            </div>
          ) : (
            <div className="card p-8 sm:p-10 text-center animate-fade-up" style={{ border: "1px solid var(--border2)", boxShadow: "var(--shadow)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(45,154,107,0.1)" }}>
                <CheckCircle size={32} style={{ color: "var(--green)" }} />
              </div>
              <h2 className="text-xl font-black mb-3" style={{ color: "var(--text)" }}>
                {locale === "fa" ? "ایمیل ارسال شد!" : locale === "ar" ? "تم إرسال البريد!" : "Email Sent!"}
              </h2>
              <p className="text-sm mb-2" style={{ color: "var(--text2)", lineHeight: 1.8 }}>
                {locale === "fa"
                  ? `لینک بازیابی رمز به آدرس`
                  : locale === "ar"
                  ? `تم إرسال رابط إعادة التعيين إلى`
                  : "A password reset link was sent to"}
              </p>
              <p className="font-bold mb-6" style={{ color: "var(--accent)" }} dir="ltr">{email}</p>
              <p className="text-xs mb-8" style={{ color: "var(--text3)", lineHeight: 1.8 }}>
                {locale === "fa"
                  ? "لطفاً صندوق ورودی (و پوشه اسپم) خود را بررسی کنید. لینک ۳۰ دقیقه اعتبار دارد."
                  : locale === "ar"
                  ? "يرجى التحقق من صندوق الوارد (ومجلد البريد العشوائي). الرابط صالح لمدة 30 دقيقة."
                  : "Please check your inbox (and spam folder). The link is valid for 30 minutes."}
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => setStep("email")} className="btn-secondary w-full py-3 rounded-xl text-sm">
                  {locale === "fa" ? "ارسال مجدد" : locale === "ar" ? "إعادة الإرسال" : "Resend Email"}
                </button>
                <Link href="/login" className="btn-primary w-full py-3 rounded-xl text-sm font-bold text-center block">
                  {locale === "fa" ? "بازگشت به ورود" : locale === "ar" ? "العودة لتسجيل الدخول" : "Back to Login"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
