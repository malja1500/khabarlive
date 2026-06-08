# 🔴 خبرلایو — KhabarLive News Platform

یک پلتفرم کامل خبری با Next.js 14, TypeScript, Tailwind CSS

---

## ✅ پیش‌نیازها (Prerequisites)

لطفاً قبل از شروع مطمئن شوید که اینها نصب هستند:

- **Node.js** نسخه 18 یا بالاتر → https://nodejs.org
- **npm** (همراه Node.js نصب می‌شود)

برای چک کردن:
```bash
node --version    # باید v18 یا بالاتر باشد
npm --version     # باید v8 یا بالاتر باشد
```

---

## 🚀 مراحل نصب و راه‌اندازی

### مرحله ۱ — اکسترکت فایل زیپ

فایل `khabarlive.zip` را دانلود و extract کنید.

### مرحله ۲ — باز کردن ترمینال در پوشه پروژه

```bash
cd khabarlive
```

### مرحله ۳ — نصب dependencies

```bash
npm install
```

⏳ این ممکن است ۱-۳ دقیقه طول بکشد. صبر کنید تا کامل شود.

### مرحله ۴ — ساخت فایل environment

یک فایل `.env.local` در root پروژه بسازید:

```bash
# Windows (PowerShell):
echo JWT_SECRET=khabarlive-super-secret-2026-change-me > .env.local

# Mac/Linux:
echo "JWT_SECRET=khabarlive-super-secret-2026-change-me" > .env.local
```

یا دستی یک فایل `.env.local` بسازید با این محتوا:
```
JWT_SECRET=khabarlive-super-secret-2026-change-me
```

### مرحله ۵ — اجرای پروژه در Development

```bash
npm run dev
```

سپس مرورگر را باز کنید و بروید به:
**http://localhost:3000**

---

## 🔐 اطلاعات ورود

### ادمین (Admin)
- **Email:** admin@khabarlive.ir
- **Password:** Admin@1234

### کاربر عادی (User)
- **Email:** sara@example.com
- **Password:** password

---

## 📱 صفحات سایت

| آدرس | توضیح |
|------|-------|
| `/` | صفحه اصلی |
| `/news` | لیست همه اخبار با سرچ و فیلتر |
| `/news/[id]` | جزئیات خبر + کامنت |
| `/login` | صفحه ورود |
| `/register` | صفحه ثبت‌نام |
| `/admin` | داشبورد ادمین (نیاز به لاگین ادمین) |
| `/admin/news` | مدیریت اخبار |
| `/admin/news/add` | افزودن خبر جدید |
| `/admin/users` | مدیریت کاربران |
| `/admin/comments` | مدیریت نظرات |
| `/admin/categories` | دسته‌بندی‌ها |
| `/admin/analytics` | آمار و تحلیل |
| `/admin/settings` | تنظیمات |

---

## ✨ امکانات

- 🌙 **Dark/Light Mode** — تغییر تم از ناوبار
- 🌍 **سه زبانه** — فارسی، انگلیسی، عربی
- 📱 **کاملاً Responsive** — برای موبایل، تبلت و دسکتاپ
- 🔐 **احراز هویت** — JWT + Cookie
- 📰 **CRUD کامل** — اخبار، کاربران، کامنت‌ها
- 🔍 **جستجو و فیلتر** — در صفحه اخبار
- 💬 **سیستم کامنت** — با تأیید ادمین
- 📊 **داشبورد ادمین** — با نمودار و آمار

---

## ⚠️ نکات مهم

1. **دیتابیس در حافظه است** — بعد از ری‌استارت سرور، داده‌های جدید پاک می‌شوند. برای production باید از PostgreSQL یا MongoDB استفاده کنید.

2. **برای production** دستور زیر را بزنید:
```bash
npm run build
npm start
```

3. **پورت پیش‌فرض** 3000 است. اگر این پورت در دسترس نیست:
```bash
npm run dev -- --port 3001
```

---

## 🗂️ ساختار پروژه

```
khabarlive/
├── src/
│   ├── app/
│   │   ├── page.tsx              # صفحه اصلی
│   │   ├── login/page.tsx        # صفحه لاگین
│   │   ├── register/page.tsx     # صفحه ثبت‌نام
│   │   ├── news/
│   │   │   ├── page.tsx          # لیست اخبار
│   │   │   └── [id]/page.tsx     # جزئیات خبر
│   │   ├── admin/
│   │   │   ├── layout.tsx        # لایه‌آوت ادمین
│   │   │   ├── page.tsx          # داشبورد
│   │   │   ├── news/             # مدیریت اخبار
│   │   │   ├── users/            # مدیریت کاربران
│   │   │   ├── comments/         # مدیریت نظرات
│   │   │   ├── categories/       # دسته‌بندی‌ها
│   │   │   ├── analytics/        # آمار
│   │   │   └── settings/         # تنظیمات
│   │   └── api/
│   │       ├── auth/login/       # API لاگین
│   │       ├── auth/register/    # API ثبت‌نام
│   │       ├── auth/logout/      # API خروج
│   │       ├── news/             # API اخبار
│   │       ├── users/            # API کاربران
│   │       └── comments/         # API کامنت‌ها
│   ├── components/
│   │   ├── layout/Navbar.tsx
│   │   ├── layout/Footer.tsx
│   │   ├── layout/Providers.tsx
│   │   ├── news/NewsCard.tsx
│   │   └── shared/LogoutModal.tsx
│   ├── lib/
│   │   ├── db.ts                 # دیتابیس در حافظه
│   │   ├── auth.ts               # احراز هویت JWT
│   │   ├── i18n.ts               # ترجمه‌ها
│   │   └── utils.ts              # توابع کمکی
│   ├── store/index.ts            # Zustand store
│   └── types/index.ts            # TypeScript types
└── package.json
```

---

## 🆘 مشکلات رایج

### خطای "port already in use"
```bash
npm run dev -- --port 3001
```

### خطای npm install
```bash
npm install --legacy-peer-deps
```

### خطای Module not found
```bash
rm -rf node_modules
npm install
```
