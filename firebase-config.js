// ضع هنا بيانات مشروع Firebase بتاعك (من Project settings > Your apps > Web app)
// الـ apiKey هنا عادي يكون ظاهر - الأمان بييجي من Firestore Rules (ملف firestore.rules).
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// اليوزر نيم بتاع الداشبورد (hexam_store) بيتحول داخليًا لإيميل: username@ADMIN_DOMAIN
// (مش لازم الدومين ده يكون حقيقي، بس لازم تنشئ المستخدم في Firebase بنفس الشكل)
export const ADMIN_DOMAIN = "hexam-panel.app";
