"use client";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useApp } from "@/store";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const { locale } = useApp();
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sending, setSending] = useState(false);

  const set = (k:string) => (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => setForm(f=>({...f,[k]:e.target.value}));

  async function handleSubmit(e:React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise(r=>setTimeout(r,1000)); // simulate
    toast.success(locale==="fa"?"پیام شما ارسال شد. به زودی پاسخ می‌دهیم!":locale==="ar"?"تم إرسال رسالتك. سنرد قريباً!":"Your message has been sent. We'll reply soon!");
    setForm({name:"",email:"",subject:"",message:""});
    setSending(false);
  }

  const info = [
    { icon:<Mail size={20}/>, label:locale==="fa"?"ایمیل":locale==="ar"?"البريد":"Email", value:"info@khabarlive.ir" },
    { icon:<Phone size={20}/>, label:locale==="fa"?"تلفن":locale==="ar"?"الهاتف":"Phone", value:"+98 21 1234 5678" },
    { icon:<MapPin size={20}/>, label:locale==="fa"?"آدرس":locale==="ar"?"العنوان":"Address", value:locale==="fa"?"تهران، خیابان ولیعصر، پلاک ۱۲۳":locale==="ar"?"طهران، شارع وليعصر، رقم 123":"Tehran, Valiasr St., No. 123" },
    { icon:<Clock size={20}/>, label:locale==="fa"?"ساعات کاری":locale==="ar"?"ساعات العمل":"Working Hours", value:locale==="fa"?"شنبه تا پنج‌شنبه، ۸ تا ۱۷":locale==="ar"?"السبت إلى الخميس، 8 إلى 17":"Sat–Thu, 8AM–5PM" },
  ];

  return (
    <>
      <Navbar/>
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="text-center mb-14 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border text-sm font-bold" style={{background:"rgba(230,57,70,0.08)",borderColor:"rgba(230,57,70,0.2)",color:"var(--accent)"}}>📩 {locale==="fa"?"تماس با ما":locale==="ar"?"تواصل معنا":"Contact Us"}</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{color:"var(--text)"}}>
            {locale==="fa"?"ما اینجاییم تا کمک کنیم":locale==="ar"?"نحن هنا للمساعدة":"We're Here to Help"}
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{color:"var(--text2)",lineHeight:1.8}}>
            {locale==="fa"?"هر سوال، انتقاد یا پیشنهادی دارید، با ما در میان بگذارید. تیم خبرلایو آماده پاسخگویی است.":locale==="ar"?"أي سؤال أو اقتراح، شاركنا. فريق خبر لايف جاهز للرد.":"Any question, feedback or suggestion — share it with us. KhabarLive team is ready to respond."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            {info.map((item,i)=>(
              <div key={i} className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:"rgba(230,57,70,0.1)",color:"var(--accent)"}}>{item.icon}</div>
                <div>
                  <div className="text-xs font-bold mb-1" style={{color:"var(--text3)"}}>{item.label}</div>
                  <div className="text-sm font-semibold" style={{color:"var(--text)"}}>{item.value}</div>
                </div>
              </div>
            ))}
            {/* Map placeholder */}
            <div className="card overflow-hidden h-48 flex items-center justify-center" style={{background:"var(--bg3)"}}>
              <div className="text-center">
                <MapPin size={32} style={{color:"var(--accent)"}} className="mx-auto mb-2"/>
                <p className="text-xs" style={{color:"var(--text3)"}}>{locale==="fa"?"نقشه تهران":"Tehran Map"}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="card p-6 sm:p-8">
              <h2 className="text-lg font-black mb-6" style={{color:"var(--text)"}}>
                {locale==="fa"?"فرم تماس":locale==="ar"?"نموذج التواصل":"Contact Form"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{locale==="fa"?"نام کامل":locale==="ar"?"الاسم الكامل":"Full Name"} *</label>
                    <input className="input-field" value={form.name} onChange={set("name")} placeholder={locale==="fa"?"نام و نام خانوادگی":"Full name"} required/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{locale==="fa"?"ایمیل":locale==="ar"?"البريد":"Email"} *</label>
                    <input className="input-field" type="email" value={form.email} onChange={set("email")} placeholder="example@email.com" dir="ltr" required/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{locale==="fa"?"موضوع":locale==="ar"?"الموضوع":"Subject"} *</label>
                  <input className="input-field" value={form.subject} onChange={set("subject")} placeholder={locale==="fa"?"موضوع پیام شما":"Subject of your message"} required/>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{color:"var(--text2)"}}>{locale==="fa"?"پیام":locale==="ar"?"الرسالة":"Message"} *</label>
                  <textarea className="input-field resize-none" rows={6} value={form.message} onChange={set("message")} placeholder={locale==="fa"?"پیام خود را اینجا بنویسید...":"Write your message here..."} required/>
                </div>
                <button type="submit" disabled={sending} className="btn-primary w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2" style={{opacity:sending?0.7:1}}>
                  <Send size={15}/>
                  {sending?(locale==="fa"?"در حال ارسال...":"Sending..."):(locale==="fa"?"ارسال پیام":locale==="ar"?"إرسال الرسالة":"Send Message")}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
