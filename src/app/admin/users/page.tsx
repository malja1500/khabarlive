"use client";
import { useEffect, useState } from "react";
import { useApp } from "@/store";
import { translations } from "@/lib/i18n";
import { User } from "@/types";
import { formatDate } from "@/lib/utils";
import { Trash2, Shield, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminUsersPage() {
  const { locale } = useApp();
  const t = translations[locale].admin;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users").then((r) => r.json()).then((d) => { setUsers(d.users || []); setLoading(false); });
  }, []);

  async function deleteUser(id: string) {
    if (!confirm(locale === "fa" ? "آیا مطمئن هستید؟" : "Are you sure?")) return;
    const res = await fetch("/api/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) { setUsers((p) => p.filter((u) => u.id !== id)); toast.success(t.userDeleted); }
    else toast.error(locale === "fa" ? "خطا در حذف" : "Error deleting user");
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-xl font-black" style={{ color: "var(--text)" }}>{t.users}</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text3)" }}>{users.length} {locale === "fa" ? "کاربر ثبت‌شده" : "registered users"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: locale === "fa" ? "کل کاربران" : "Total", val: users.length, color: "var(--blue)" },
          { label: locale === "fa" ? "ادمین" : "Admins", val: users.filter((u) => u.role === "admin").length, color: "var(--accent)" },
          { label: locale === "fa" ? "کاربر عادی" : "Users", val: users.filter((u) => u.role === "user").length, color: "var(--green)" },
        ].map((s, i) => (
          <div key={i} className="card2 p-4 text-center">
            <div className="text-2xl font-black mb-1" style={{ color: s.color }}>{s.val}</div>
            <div className="text-xs" style={{ color: "var(--text3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrap">
          {loading ? (
            <div className="p-8 text-center" style={{ color: "var(--text3)" }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{locale === "fa" ? "کاربر" : "User"}</th>
                  <th>{locale === "fa" ? "ایمیل" : "Email"}</th>
                  <th>{locale === "fa" ? "نقش" : "Role"}</th>
                  <th>{locale === "fa" ? "تاریخ عضویت" : "Joined"}</th>
                  <th>{locale === "fa" ? "وضعیت" : "Status"}</th>
                  <th>{locale === "fa" ? "عملیات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={u.avatar || "https://i.pravatar.cc/40"} alt={u.name} className="w-7 h-7 rounded-full object-cover border" style={{ borderColor: "var(--border2)" }} />
                        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{u.name}</span>
                      </div>
                    </td>
                    <td className="text-xs" style={{ color: "var(--text3)" }} dir="ltr">{u.email}</td>
                    <td>
                      <span className="flex items-center gap-1 text-xs font-bold" style={{ color: u.role === "admin" ? "var(--accent)" : "var(--blue)" }}>
                        {u.role === "admin" ? <Shield size={12} /> : <UserIcon size={12} />}
                        {u.role === "admin" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="text-xs" style={{ color: "var(--text3)" }}>{u.createdAt?.slice(0, 10)}</td>
                    <td>
                      <span className={`status-badge ${u.isActive ? "status-published" : "status-draft"}`}>
                        {u.isActive ? (locale === "fa" ? "فعال" : "Active") : (locale === "fa" ? "غیرفعال" : "Inactive")}
                      </span>
                    </td>
                    <td>
                      {u.role !== "admin" && (
                        <button onClick={() => deleteUser(u.id)} className="text-xs px-2 py-1 rounded border transition-all hover:border-[--accent] hover:text-[--accent]" style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)" }}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
