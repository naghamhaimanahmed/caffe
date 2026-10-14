# Taste & Fun — Operations & Cost Control (UI Demo)

نسخة عرض تفاعلية لنظام التشغيل والتحكم بالتكاليف لمطاعم **تيست آند فن** (فرعا القصر الملكي ولؤلؤة بحري).
Next.js (App Router) + React + TypeScript + Tailwind CSS v4. واجهة عربية بالكامل باتجاه RTL. لا يوجد backend: كل البيانات وهمية.

## التشغيل

```bash
cd taste-fun
npm install
npm run dev     # http://localhost:3000
npm run build   # production build + type check
```

## تسجيل الدخول والصلاحيات (RBAC)

- `/` شاشة الدخول: زر "الدخول كـ المالك".
- أدوار مدير المطعم والمحاسب والشيف ومسؤول المشتريات ستُضاف لاحقًا في نظام كل مطعم، والذي سيُربط بعد ذلك بلوحة المالك.
- الدور النشط محفوظ في `AuthProvider` (React Context) في `lib/auth.tsx`، ويُحفظ في `sessionStorage` حتى لا تُفقد الجلسة عند تحديث الصفحة.
- كل صفحة ملفوفة بـ `<RoleGuard allow="…">`. أي دخول لصفحة لا يملك المستخدم صلاحيتها يُعاد توجيهه إلى `/`.
- زر "تسجيل الخروج" موجود في كل صفحة.

| المسار | الدور | التخطيط | المحتوى |
|---|---|---|---|
| `/owner` | المالك | سطح المكتب، قائمة جانبية | مؤشرات (مبيعات اليوم، متوسط الفاتورة، تكلفة الطعام %، الموافقات)، مقارنة إغلاق الفرعين، رسم مبيعات 14 يوم (مع عرض جدول)، اعتماد/رفض الموافقات |

## البنية

```
app/                 layout (RTL + AuthProvider) والصفحات لكل دور
components/          DesktopShell, RoleGuard, SalesChart, ui (Card, Button, Field…)
lib/auth.tsx         سياق المصادقة والأدوار
lib/mock-data.ts     كل البيانات الوهمية
lib/format.ts        تنسيق الأرقام والعملة (د.إ)
```
