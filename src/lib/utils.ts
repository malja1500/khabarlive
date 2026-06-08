import { Category } from "@/types";

export const CATEGORY_META: Record<Category, { fa: string; en: string; ar: string; color: string; bg: string; icon: string }> = {
  tech:     { fa: "فناوری",   en: "Technology", ar: "التكنولوجيا", color: "#457b9d", bg: "rgba(69,123,157,0.85)",  icon: "💻" },
  economy:  { fa: "اقتصاد",   en: "Economy",    ar: "الاقتصاد",    color: "#f4a261", bg: "rgba(244,162,97,0.85)", icon: "📈" },
  sport:    { fa: "ورزش",     en: "Sports",     ar: "الرياضة",     color: "#2d9a6b", bg: "rgba(45,154,107,0.85)", icon: "⚽" },
  world:    { fa: "جهان",     en: "World",      ar: "العالم",      color: "#7c3aed", bg: "rgba(124,58,237,0.85)", icon: "🌍" },
  politics: { fa: "سیاسی",   en: "Politics",   ar: "السياسة",     color: "#ea580c", bg: "rgba(234,88,12,0.85)",  icon: "🏛" },
  culture:  { fa: "فرهنگ",   en: "Culture",    ar: "الثقافة",     color: "#db2777", bg: "rgba(219,39,119,0.85)", icon: "🎨" },
};

export function getCatLabel(cat: Category, locale: "fa" | "en" | "ar"): string {
  return CATEGORY_META[cat][locale];
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(
      locale === "fa" ? "fa-IR" : locale === "ar" ? "ar" : "en-US",
      { year: "numeric", month: "long", day: "numeric" }
    );
  } catch {
    return iso;
  }
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
