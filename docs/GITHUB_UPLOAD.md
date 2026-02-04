# رفع المشروع على GitHub

## ١ — إنشاء مستودع جديد على GitHub

1. ادخل إلى **https://github.com** وسجّل الدخول.
2. اضغط **+** (أعلى يمين) ثم **New repository**.
3. اختر **Repository name** مثل: `lensflow` أو `lensflow-creative-studio`.
4. اختر **Public**.
5. **لا تضف** README أو .gitignore أو رخصة (المشروع عنده بالفعل).
6. اضغط **Create repository**.

بعد الإنشاء ستظهر صفحة فيها رابط المستودع، مثل:
`https://github.com/اسم-المستخدم/lensflow.git`

---

## ٢ — ربط المشروع ورفعه من الطرفية

افتح **Terminal** (أو Cursor Terminal) وانتقل لمجلد المشروع ثم نفّذ:

```bash
# الانتقال لمجلد المشروع (غيّر المسار إذا كان مختلفاً)
cd /Users/mahmoudelgamal/Desktop/Apps/lensflow---creative-studio-manager

# تهيئة Git إذا لم يكن المشروع تحت Git بعد
git init

# إضافة كل الملفات (node_modules و .env تُتجاهل تلقائياً بسبب .gitignore)
git add .

# أول commit
git commit -m "إضافة مشروع LensFlow — مدير استوديو الإبداع"

# ربط المستودع على GitHub (غيّر الرابط لرابط مستودعك)
git remote add origin https://github.com/اسم-المستخدم/اسم-المستودع.git

# رفع الفرع الرئيسي
git branch -M main
git push -u origin main
```

استبدل `اسم-المستخدم` و `اسم-المستودع` برابط المستودع الذي أنشأته (مثلاً `https://github.com/mahmoudelgamal/lensflow.git`).

---

## إذا كان المشروع تحت Git مسبقاً وتريد رفعه لمستودع جديد

```bash
cd /Users/mahmoudelgamal/Desktop/Apps/lensflow---creative-studio-manager

# إضافة الرابط الجديد (إذا كان فيه origin قديم، احذفه أولاً: git remote remove origin)
git remote add origin https://github.com/اسم-المستخدم/اسم-المستودع.git

git branch -M main
git push -u origin main
```

---

## ملاحظات

- **كلمة المرور:** GitHub لا يقبل كلمة مرور الحساب في `git push`. استخدم **Personal Access Token** (Settings → Developer settings → Personal access tokens) أو **SSH key**.
- **ملفات حساسة:** ملف `.env.local` **لا يُرفع** لأنه داخل `.gitignore` — لا تزله من `.gitignore`.
- بعد الرفع يمكنك ربط المستودع بـ **Vercel** أو **Netlify** للنشر والحصول على رابط HTTPS للتطبيق على الهاتف.
