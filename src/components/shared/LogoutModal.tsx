"use client";
import { translations } from "@/lib/i18n";
import { Locale } from "@/lib/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  locale: Locale;
}

export function LogoutModal({ open, onClose, onConfirm, locale }: Props) {
  const t = translations[locale].auth;
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="card p-8 max-w-sm w-full animate-fade-up"
        style={{ boxShadow: "0 40px 80px rgba(0,0,0,0.7)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-4xl mb-4 text-center">🚪</div>
        <h3 className="text-lg font-black text-center mb-2" style={{ color: "var(--text)" }}>
          {t.logoutConfirm}
        </h3>
        <p className="text-sm text-center mb-8" style={{ color: "var(--text2)" }}>
          {t.logoutMsg}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 py-3 rounded-xl font-bold"
          >
            {t.logoutNo}
          </button>
          <button
            onClick={onConfirm}
            className="btn-primary flex-1 py-3 rounded-xl font-bold"
          >
            {t.logoutYes}
          </button>
        </div>
      </div>
    </div>
  );
}
