import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

function env(key: string): string {
  const v = import.meta.env[key];
  return typeof v === 'string' ? v.trim() : '';
}

const firebaseConfig = {
  apiKey: env('VITE_FIREBASE_API_KEY'),
  authDomain: env('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: env('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: env('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('VITE_FIREBASE_APP_ID'),
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export function isFirebaseConfigured(): boolean {
  return !!(
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID
  );
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore | null {
  if (!isFirebaseConfigured()) return null;
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}
