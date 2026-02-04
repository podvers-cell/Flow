<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LensFlow — مدير استوديو الإبداع

Creative studio manager: projects, finances, and deadlines. Works **offline** on your Mac.

View your app in AI Studio: https://ai.studio/apps/drive/1aSc2VhsThaNwaDv2nVu180MnI4Vp9Dad

## Use as an offline app on your Mac

1. **Install dependencies** (once):
   ```bash
   npm install
   ```

2. **Build and run locally**:
   ```bash
   npm run offline
   ```
   This builds the app and serves it at **http://localhost:4173** (or the port shown).

3. **Install the app on your Mac** (so it works like a desktop app and offline):
   - **Chrome:** Open http://localhost:4173 → menu (⋮) → **Install LensFlow** / **Create shortcut** → check **Open as window**.
   - **Safari:** Open the same URL → **File → Add to Dock** (or **Add to Home Screen** on iPad).
   - **Edge:** Open the URL → **Apps → Install this site as an app**.

4. **Use it offline**  
   After installing, open the installed “LensFlow” app. It will work without the internet. All data is stored on your Mac (IndexedDB).

### خطوات نقله على الهاتف الآن

**الطريقة ١ — تجربة فورية (نفس الواي فاي)**

1. على **الكمبيوتر** في مجلد المشروع:
   ```bash
   npm install
   npm run dev:network
   ```
2. في الطرفية ستظهر عنوان مثل: `http://192.168.1.x:5173` (استبدل `x` برقم الشبكة عندك).
3. تأكد أن **الهاتف والكمبيوتر على نفس شبكة الواي فاي**.
4. على **iPhone** افتح **Safari** واكتب في شريط العنوان: `http://192.168.1.x:5173` (نفس العنوان الذي ظهر عندك).
5. اضغط **انتقال** — التطبيق يفتح ويمكنك التجربة فوراً.

> هذه للتجربة فقط. لإضافة أيقونة على الشاشة الرئيسية تحتاج الطريقة ٢ (نشر بـ HTTPS).

---

**الطريقة ٢ — تثبيت على الشاشة الرئيسية (PWA)**

1. **انشر التطبيق** على استضافة تعمل بـ **HTTPS**:
   - [Vercel](https://vercel.com): اربط مستودع GitHub ثم Deploy.
   - أو [Netlify](https://netlify.com): نفس الفكرة — اربط المستودع ثم Deploy.
2. بعد النشر تحصل على رابط مثل: `https://اسم-المشروع.vercel.app`.
3. على **iPhone** افتح **Safari** وادخل هذا الرابط.
4. اضغط زر **المشاركة** (المربع مع السهم للأعلى).
5. اختر **«إضافة إلى الشاشة الرئيسية»** ثم **«إضافة»**.

بعد ذلك تظهر أيقونة LensFlow على الشاشة الرئيسية. عند فتحها يعمل التطبيق بملء الشاشة ويمكن استخدامه دون إنترنت بعد التحميل الأول. البيانات تُخزَّن على الجهاز (IndexedDB).

> للتوزيع عبر **App Store** كتطبيق أصلي تحتاج [Capacitor](https://capacitorjs.com/) وحساب Apple Developer مدفوع.

Optional: set `GEMINI_API_KEY` in [.env.local](.env.local) if you want AI features (they require internet when used).

## Firebase database (optional)

To store data in **Firebase** (Auth + Firestore) instead of local IndexedDB:

1. **Create a Firebase project** at [Firebase Console](https://console.firebase.google.com/).
2. **Enable Authentication** → Sign-in method → **Email/Password**.
3. **Create a Firestore database** (Start in test mode or production; you’ll add rules next).
4. **Add a Web app** in Project settings → Your apps → get the config object.
5. **Copy [.env.example](.env.example)** to `.env.local` and set:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. **Deploy Firestore rules** so each user can only read/write their own data:
   ```bash
   firebase deploy --only firestore:rules
   ```
   (Install [Firebase CLI](https://firebase.google.com/docs/cli) and run `firebase init` first; choose Firestore and use the `firestore.rules` file in this repo.)
7. **Restart the app** (`npm run dev`). The login page will use **email + password** and data will be stored in Firestore under `users/{uid}/projects`, `users/{uid}/transactions`, `users/{uid}/notifications`.

If you don’t set these env vars, the app keeps using **local auth + IndexedDB** (username + password, data on device only).

## Run in development

```bash
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Serve the built app locally |
| `npm run offline` | Build + preview (then install as PWA on Mac) |

**Prerequisites:** Node.js
