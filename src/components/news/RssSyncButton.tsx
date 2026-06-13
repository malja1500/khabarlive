"use client";
import { useState } from "react";

export function RssSyncButton() {
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<{ saved?: number; fetched?: number; errors?: string[] } | null>(null);

  async function handleSync() {
    setLoading(true);
    setResult(null);
    try {
      const res  = await fetch("/api/rss-fetch", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ errors: ["خطا در اتصال به سرور"] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 font-bold" style={{ color: "var(--text)" }}>
        📡 همگام‌سازی RSS خبرگزاری‌ها
      </div>
      <p className="text-xs" style={{ color: "var(--text3)" }}>
        خبرهای جدید از صدا و سیما و باشگاه خبرنگاران رو دریافت و در دیتابیس ذخیره می‌کند.
      </p>
      <button onClick={handleSync} disabled={loading}
        className="btn-primary text-sm py-2 px-4 rounded-xl w-fit flex items-center gap-2">
        {loading ? <><span className="animate-spin">🔄</span> در حال دریافت...</> : "🔄 دریافت اخبار RSS"}
      </button>
      {result && (
        <div className="text-xs rounded-xl p-3 mt-1"
          style={{ background: result.errors?.length ? "rgba(230,57,70,0.08)" : "rgba(45,154,107,0.08)",
                   color: result.errors?.length ? "var(--accent)" : "#2d9a6b" }}>
          {result.saved !== undefined && (
            <p>✅ {result.saved} خبر جدید ذخیره شد / {result.fetched} خبر دریافت شد</p>
          )}
          {result.errors?.map((e, i) => <p key={i}>⚠️ {e}</p>)}
        </div>
      )}
    </div>
  );
}
