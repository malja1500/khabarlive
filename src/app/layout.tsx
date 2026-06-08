import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "خبرلایو — اخبار لحظه‌ای",
  description: "پلتفرم اخبار لحظه‌ای با پوشش کامل اخبار ایران و جهان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-vazir antialiased bg-[--bg] text-[--text] transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
