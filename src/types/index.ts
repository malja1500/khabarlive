export type Category = "tech" | "economy" | "sport" | "world" | "politics" | "culture";
export type Locale = "fa" | "en" | "ar";
export type Theme = "dark" | "light";
export type Role = "admin" | "user";
export type NewsStatus = "published" | "draft" | "review";
export type CommentStatus = "approved" | "pending" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  newsCount?: number;
  isActive: boolean;
}

export interface NewsItem {
  id: string;
  title: string;
  titleEn?: string;
  titleAr?: string;
  excerpt: string;
  excerptEn?: string;
  excerptAr?: string;
  body: string;
  bodyEn?: string;
  bodyAr?: string;
  category: Category;
  image: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  status: NewsStatus;
  views: number;
  createdAt: string;
  tags: string[];
  readingTime: string;
}

export interface Comment {
  id: string;
  newsId: string;
  newsTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  status: CommentStatus;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export interface AppState {
  theme: Theme;
  locale: Locale;
  setTheme: (t: Theme) => void;
  setLocale: (l: Locale) => void;
}

export type CategoryMeta = {
  label: { fa: string; en: string; ar: string };
  color: string;
  icon: string;
};
