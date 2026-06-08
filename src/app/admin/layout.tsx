"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Newspaper, PlusCircle, Users,
  MessageSquare, Tag, BarChart2, Settings, Home,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { useApp, useAuth } from "@/store";
import { translations } from "@/lib/i18n";
import { LogoutModal } from "@/components/shared/LogoutModal";
import toast from "react-hot-toast";

const menuItems = [
  { key: "dashboard",  href: "/admin",             icon: LayoutDashboard },
  { key: "manageNews", href: "/admin/news",         icon: Newspaper,      badge: null },
  { key: "addNews",    href: "/admin/news/add",     icon: PlusCircle },
  { key: "users",      href: "/admin/users",        icon: Users },
  { key: "comments",   href: "/admin/comments",     icon: MessageSquare,  badge: 5 },
  { key: "categories", href: "/admin/categories",   icon: Tag },
  { key: "analytics",  href: "/admin/analytics",    icon: BarChart2 },
  { key: "settings",   href: "/admin/settings",     icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { locale } = useApp();
  const { user, isLoggedIn, logout } = useAuth();
  const t = translations[locale].admin;

  const [showLogout,  setShowLogout]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile drawer

  // Guard: only admin can access
  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.replace("/login");
    }
  }, [isLoggedIn, user, router]);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (!isLoggedIn || user?.role !== "admin") return null;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    logout();
    router.push("/");
    toast.success(locale === "fa" ? "خارج شدید" : "Logged out");
  }

  const labels: Record<string, string> = {
    dashboard:  t.dashboard,
    manageNews: t.manageNews,
    addNews:    t.addNews,
    users:      t.users,
    comments:   t.comments,
    categories: t.categories,
    analytics:  t.analytics,
    settings:   t.settings,
  };

  /* ── shared sidebar content ── */
  const SidebarContent = () => (
    <div className="flex flex-col h-full" style={{ background: "var(--card)" }}>
      {/* Logo */}
      <div className="p-5 pb-4 flex items-center justify-between"
           style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <div className="text-sm font-black" style={{ color: "var(--accent)" }}>
            🔴 {locale === "fa" ? "پنل مدیریت" : locale === "ar" ? "لوحة الإدارة" : "Admin Panel"}
          </div>
          <div className="text-[10px] mt-0.5" style={{ color: "var(--text3)" }}>KhabarLive v1.0</div>
        </div>
        {/* Close button — only visible on mobile */}
        <button
          className="md:hidden w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: "var(--bg3)", color: "var(--text2)" }}
          onClick={() => setSidebarOpen(false)}
        >
          <X size={14} />
        </button>
      </div>

      {/* User info */}
      <div className="mx-3 my-3 p-3 rounded-xl flex items-center gap-2"
           style={{ background: "var(--bg3)" }}>
        <img
          src={user!.avatar || "https://i.pravatar.cc/40"}
          alt={user!.name}
          className="w-8 h-8 rounded-full object-cover border-2"
          style={{ borderColor: "var(--accent)" }}
        />
        <div className="min-w-0">
          <div className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>
            {user!.name}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text3)" }}>Admin</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {menuItems.map(({ key, href, icon: Icon, badge }) => {
          const isActive =
            href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link key={key} href={href}>
              <div
                className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium
                  cursor-pointer transition-all
                  ${isActive ? "admin-nav-active" : "hover:bg-[--bg3]"}`}
                style={{ color: isActive ? "var(--text)" : "var(--text2)" }}
              >
                <Icon size={15} className="shrink-0" />
                <span className="flex-1">{labels[key]}</span>
                {badge != null && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    {badge}
                  </span>
                )}
                {isActive && <ChevronRight size={12} style={{ color: "var(--accent)" }} />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        <Link href="/">
          <div
            className="flex items-center gap-2.5 px-4 py-3 text-xs font-medium
              cursor-pointer hover:bg-[--bg3] transition-all"
            style={{ color: "var(--text2)" }}
          >
            <Home size={15} />
            {t.backToSite}
          </div>
        </Link>
        <button
          onClick={() => setShowLogout(true)}
          className="w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium
            hover:bg-[--bg3] transition-all"
          style={{ color: "var(--text2)" }}
        >
          <LogOut size={15} />
          {locale === "fa" ? "خروج" : locale === "ar" ? "خروج" : "Logout"}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="flex min-h-screen"
      style={{ direction: locale === "en" ? "ltr" : "rtl" }}
    >
      {/* ── Desktop sidebar (always visible ≥ md) ── */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ borderInlineEnd: "1px solid var(--border)" }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile drawer ── */}
      <aside
        className="fixed top-0 bottom-0 z-50 w-64 flex flex-col md:hidden
          transition-transform duration-300"
        style={{
          insetInlineStart: 0,
          transform: sidebarOpen ? "translateX(0)" : locale === "en" ? "translateX(-100%)" : "translateX(100%)",
          borderInlineEnd: "1px solid var(--border)",
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main
        className="flex-1 overflow-y-auto min-h-screen"
        style={{ background: "var(--bg)" }}
      >
        {/* ── Mobile top bar ── */}
        <div
          className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--bg3)", color: "var(--text2)" }}
          >
            <Menu size={18} />
          </button>

          <div className="text-sm font-black" style={{ color: "var(--accent)" }}>
            🔴 {locale === "fa" ? "پنل مدیریت" : locale === "ar" ? "لوحة الإدارة" : "Admin"}
          </div>

          <div className="flex items-center gap-2">
            <img
              src={user!.avatar || "https://i.pravatar.cc/40"}
              alt={user!.name}
              className="w-7 h-7 rounded-full object-cover border-2"
              style={{ borderColor: "var(--accent)" }}
            />
          </div>
        </div>

        {children}
      </main>

      <LogoutModal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={handleLogout}
        locale={locale}
      />
    </div>
  );
}
