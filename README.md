# ذكاء تك - Zeka Tech

## منصة اختبارات الذكاء مع نظام Backend حقيقي

## متطلبات التشغيل

- Node.js (v16 أو أحدث)
- npm (يأتي مع Node.js)

## خطوات التثبيت

### 1. تثبيت Dependencies

```bash
npm install
```

### 2. إعداد البيئة

ملف `.env` موجود بالفعل مع الإعدادات الافتراضية. يمكنك تعديله حسب احتياجاتك:

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-this
```

### 3. تشغيل السيرفر

```bash
# للتشغيل العادي
npm start

# للتطوير (مع إعادة التشغيل التلقائي)
npm run dev
```

### 4. فتح الموقع

افتح المتصفح على:
```
http://localhost:3000
```

## حساب الأدمن الافتراضي

- **البريد:** admin@zakatech.com
- **كلمة المرور:** admin123

**مهم:** غيّر كلمة مرور الأدمن في الإنتاج!

## النشر على Vercel + Supabase (موصى به)

### 1. إنشاء قاعدة بيانات Supabase

1. سجّل دخول في [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. اذهب إلى Settings > Database > Connection String
4. انسخ `URI` (تبدأ بـ `postgresql://postgres:...`)

### 2. إعداد Vercel

1. اربط GitHub repository بـ Vercel
2. في إعدادات المشروع، أضف Environment Variable:
   - `DATABASE_URL` = رابط Supabase
   - `JWT_SECRET` = مفتاح سري طويل (أنشئ واحدًا عشوائيًا)
   - `ADMIN_EMAIL` = admin@zakatech.com
   - `ADMIN_PASSWORD` = كلمة مرور قوية

3. اضغط Deploy!

### 3. بعد النشر

الجداول ستُنشأ تلقائياً عند أول تشغيل.

## مميزات الـ Backend

### ✅ Authentication حقيقي
- تسجيل المستخدمين مع تخزين آمن للبيانات
- تشفير كلمات المرور بـ bcrypt
- JWT tokens للمصادقة
- حماية من هجمات brute force

### ✅ قاعدة بيانات PostgreSQL (Supabase)
- تخزين مستخدمين ونتائج الاختبارات
- متوافق مع Vercel و Serverless
- قاعدة بيانات سحابية دائمة
- لا يحتاج سيرفر قاعدة بيانات خارجي
- سهل النسخ الاحتياطي

### ✅ API RESTful
```
POST   /api/auth/register          - تسجيل مستخدم جديد
POST   /api/auth/login             - تسجيل الدخول
GET    /api/auth/me                - بيانات المستخدم الحالي
POST   /api/results                - حفظ نتيجة اختبار
GET    /api/results/my             - نتائج المستخدم
GET    /api/admin/users            - كل المستخدمين (أدمن فقط)
GET    /api/admin/results          - كل النتائج (أدمن فقط)
GET    /api/admin/stats            - إحصائيات (أدمن فقط)
```

### ✅ أمان
- Helmet.js للحماية من الثغرات الشائعة
- Rate limiting للحماية من الهجمات
- CORS configured
- XSS protection

## هيكل المشروع

```
ذكاء تك/
├── server.js              # السيرفر الرئيسي
├── database.js            # قاعدة البيانات والاستعلامات
├── middleware/
│   └── auth.js           # middleware المصادقة
├── api/
│   └── client.js         # API client للـ frontend
├── data/
│   └── zeka_tech.db      # قاعدة البيانات SQLite
├── index.html            # الصفحة الرئيسية
├── script.js             # JavaScript للـ frontend
├── admin.html            # لوحة الأدمن
├── admin.js              # JavaScript للأدمن
├── style.css             # الأنماط
└── popup-styles.css      # أنماط الـ popup
```

## الانتقال من LocalStorage إلى Backend

### ما تغير:

1. **التسجيل/الدخول:**
   - قبل: يخزن في localStorage
   - بعد: يرسل إلى السيرفر ويستخدم JWT tokens

2. **نتائج الاختبارات:**
   - قبل: تخزن في localStorage
   - بعد: تخزن في SQLite database

3. **لوحة الأدمن:**
   - قبل: تقرأ من localStorage
   - بعد: تستدعي API endpoints

## تخصيص الإعدادات

### تغيير المنفذ (Port)

في ملف `.env`:
```env
PORT=8080
```

### تغيير مفتاح JWT

في ملف `.env`:
```env
JWT_SECRET=your-very-long-and-secure-secret-key-here
```

### تغيير بيانات الأدمن

عدل ملف `database.js` في دالة `createAdminUser()`.

## النشر على الإنتاج (Production)

### 1. تغيير إعدادات الأمان

```env
NODE_ENV=production
JWT_SECRET=very-long-random-string-here
```

### 2. استخدام reverse proxy (مثل Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. تشغيل بـ PM2 (للاستمرارية)

```bash
npm install -g pm2
pm2 start server.js --name "zeka-tech"
pm2 save
pm2 startup
```

## استكشاف الأخطاء

### مشكلة: السيرفر لا يعمل

```bash
# التحقق من المنفذ
netstat -ano | findstr :3000

# تغيير المنفذ في .env
PORT=3001
```

### مشكلة: قاعدة البيانات لا تعمل

```bash
# حذف قاعدة البيانات وإعادة إنشائها
rm data/zeka_tech.db
npm start
```

### مشكلة: CORS errors

تأكد من أن `API_BASE_URL` في `api/client.js` يطابق URL السيرفر.

## دعم

للمشاكل والاقتراحات، يرجى فتح issue في المستودع.

---

**تم إنشاؤه بـ ❤️ لذكاء تك**
"# ZakaTech" 
