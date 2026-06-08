"use client";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useApp } from "@/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const { theme, locale } = useApp();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark", "light");
    html.classList.add(theme);
    html.setAttribute("dir", locale === "en" ? "ltr" : "rtl");
    html.setAttribute("lang", locale);
  }, [theme, locale]);

  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "var(--card2)",
            color: "var(--text)",
            border: "1px solid var(--border2)",
            fontFamily: "Vazirmatn, sans-serif",
            fontSize: "13px",
            fontWeight: "600",
          },
        }}
      />
    </>
  );
}
