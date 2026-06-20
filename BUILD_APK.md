# كيفية بناء APK لـ PHANTOM Mobile

## الطريقة الأسرع — EAS Build (مجاني، 10 دقائق فقط)

### الخطوة 1 — حمّل المشروع
افك ضغط ملف `phantom-mobile-app.tar.gz` ثم:
```bash
cd artifacts/phantom-mobile
```

### الخطوة 2 — ثبّت المكتبات
```bash
npm install
```

### الخطوة 3 — ثبّت EAS CLI
```bash
npm install -g eas-cli
```

### الخطوة 4 — سجّل دخولك (حساب Expo مجاني)
```bash
eas login
```
أنشئ حساباً مجانياً على https://expo.dev إذا لم يكن لديك

### الخطوة 5 — ابنِ الـ APK
```bash
eas build --platform android --profile preview
```

### الخطوة 6 — احصل على رابط التحميل
بعد 5-15 دقيقة ستحصل على رابط مثل:
```
https://expo.dev/artifacts/eas/xxxx.apk
```
حمّله مباشرة على هاتفك Android!

---

## ملاحظات مهمة
- يجب تفعيل "تثبيت من مصادر غير معروفة" في إعدادات الأمان على هاتفك
- الـ APK يعمل على أي Android 8.0+
- لا يحتاج Google Play Store
- لبناء نسخة iOS: `eas build --platform ios --profile preview`
