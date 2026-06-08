"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import { Comment } from "@/types";
import { Check, X, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCommentsPage() {
  const { locale } = useApp();
  const t = translations[locale].admin;
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/comments").then((r) => r.json()).then((d) => { setComments(d.comments || []); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: string) {
    const res = await fetch("/api/comments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      setComments((p) => p.map((c) => c.id === id ? { ...c, status: status as any } : c));
      toast.success(t.commentApproved);
    }
  }

  async function deleteComment(id: string) {
    const res = await fetch("/api/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { setComments((p) => p.filter((c) => c.id !== id)); toast.success(t.commentDeleted); }
  }

  const pending = comments.filter((c) => c.status === "pending");
  const approved = comments.filter((c) => c.status === "approved");

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>{t.comments}</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>
          {pending.length} {locale === "fa" ? "نظر در انتظار تأیید" : "comments pending approval"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: locale === "fa" ? "کل نظرات" : "Total", val: comments.length, color: "var(--blue)" },
          { label: locale === "fa" ? "در انتظار" : "Pending", val: pending.length, color: "var(--gold)" },
          { label: locale === "fa" ? "تأیید شده" : "Approved", val: approved.length, color: "var(--green)" },
        ].map((s, i) => (
          <div key={i} className="card2 p-4 text-center">
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs" style={{ color: "var(--text3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12" style={{ color: "var(--text3)" }}>Loading...</div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start gap-3">
                <img src={c.userAvatar || "https://i.pravatar.cc/40"} alt={c.userName} className="w-9 h-9 rounded-full object-cover border shrink-0" style={{ borderColor: "var(--border2)" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{c.userName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--bg3)", color: "var(--text3)" }}>
                      {locale === "fa" ? "در خبر:" : "On:"} {c.newsTitle}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text3)" }}>{c.createdAt?.slice(0, 10)}</span>
                    <span className={`status-badge ${c.status === "approved" ? "status-published" : c.status === "rejected" ? "status-draft" : "status-review"}`}>
                      {c.status === "approved" ? t.approve : c.status === "rejected" ? t.reject : (locale === "fa" ? "در انتظار" : "Pending")}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text2)" }}>{c.text}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {c.status !== "approved" && (
                    <button onClick={() => updateStatus(c.id, "approved")} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-green-500/20" style={{ border: "1px solid var(--green)", color: "var(--green)" }}>
                      <Check size={13} />
                    </button>
                  )}
                  {c.status !== "rejected" && (
                    <button onClick={() => updateStatus(c.id, "rejected")} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-yellow-500/20" style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}>
                      <X size={13} />
                    </button>
                  )}
                  <button onClick={() => deleteComment(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20" style={{ border: "1px solid var(--accent)", color: "var(--accent)" }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-16" style={{ color: "var(--text3)" }}>
              {locale === "fa" ? "نظری ثبت نشده است" : "No comments yet"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
