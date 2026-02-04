import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { isFirebaseConfigured, getFirebaseAuth } from './firebase';

const AUTH_KEY = 'lensflow_auth';
const USER_KEY = 'lensflow_user';
const ROLE_KEY = 'lensflow_role';
const CURRENT_USERNAME_KEY = 'lensflow_current_username';
const LOCAL_USERS_KEY = 'lensflow_local_users';
const PREDEFINED_ROLE_OVERRIDES_KEY = 'lensflow_predefined_role_overrides';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface StoredUser {
  username: string;
  passwordHash: string;
}

/** أدمن: صلاحيات كاملة. Staff: بدون إعدادات. */
export type LocalRole = 'admin' | 'staff';

export type AuthUser = { uid: string } | { local: true; role?: LocalRole };

/** حسابات ثابتة (وضع محلي فقط): Admin بكل الصلاحيات، Staff بدون تبويب الإعدادات */
const PREDEFINED_ACCOUNTS: { username: string; password: string; role: LocalRole }[] = [
  { username: 'Admin', password: 'Mahmoud@2026', role: 'admin' },
  { username: 'Mahmoud', password: '12345678', role: 'staff' },
];

export interface LocalUserWithRole {
  username: string;
  passwordHash: string;
  role: LocalRole;
}

function getLocalUsersFromStorage(): LocalUserWithRole[] {
  try {
    const raw = getItem(LOCAL_USERS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (u): u is LocalUserWithRole =>
        u && typeof u === 'object' && typeof (u as LocalUserWithRole).username === 'string' && typeof (u as LocalUserWithRole).passwordHash === 'string' && ((u as LocalUserWithRole).role === 'admin' || (u as LocalUserWithRole).role === 'staff')
    );
  } catch {
    return [];
  }
}

function setLocalUsersToStorage(users: LocalUserWithRole[]): void {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    /* ignore */
  }
}

function getPredefinedRoleOverride(username: string): LocalRole | null {
  try {
    const raw = getItem(PREDEFINED_ROLE_OVERRIDES_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw) as Record<string, string>;
    const r = obj[username];
    return r === 'admin' || r === 'staff' ? r : null;
  } catch {
    return null;
  }
}

function setPredefinedRoleOverrideToStorage(username: string, role: LocalRole): void {
  try {
    const raw = getItem(PREDEFINED_ROLE_OVERRIDES_KEY);
    const obj: Record<string, string> = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    obj[username] = role;
    localStorage.setItem(PREDEFINED_ROLE_OVERRIDES_KEY, JSON.stringify(obj));
  } catch {
    /* ignore */
  }
}

function getItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** جلسة التبويب فقط — تُمسح عند إغلاق التبويب فيفتح التطبيق على صفحة تسجيل الدخول */
function getSessionItem(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function setSessionItem(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

function removeSessionItem(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function getAuthErrorCode(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') {
    return (err as { code: string }).code;
  }
  return '';
}

function getAuthErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return '';
}

export const authService = {
  isFirebaseConfigured,

  isAuthenticated(): boolean {
    return getSessionItem(AUTH_KEY) === 'true';
  },

  hasStoredUser(): boolean {
    try {
      const raw = getItem(USER_KEY);
      return !!raw && !!JSON.parse(raw)?.username;
    } catch {
      return false;
    }
  },

  getStoredUsername(): string | null {
    try {
      const raw = getItem(USER_KEY);
      const user = raw ? (JSON.parse(raw) as StoredUser) : null;
      return user?.username ?? null;
    } catch {
      return null;
    }
  },

  getStoredRole(): LocalRole | null {
    const r = getSessionItem(ROLE_KEY);
    if (r === 'admin' || r === 'staff') return r;
    return null;
  },

  async login(identifier: string, password: string): Promise<{ ok: boolean; error?: string }> {
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (!auth) return { ok: false, error: 'لم يتم تهيئة Firebase.' };
      try {
        await signInWithEmailAndPassword(auth, identifier.trim(), password);
        return { ok: true };
      } catch (err: unknown) {
        const code = getAuthErrorCode(err);
        if (import.meta.env.DEV) console.error('Firebase login error:', code, err);
        if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
          return { ok: false, error: 'البريد أو كلمة المرور غير صحيحة.' };
        }
        if (code === 'auth/invalid-email') return { ok: false, error: 'البريد الإلكتروني غير صالح.' };
        if (code === 'auth/operation-not-allowed') {
          return { ok: false, error: 'تسجيل الدخول بالبريد غير مفعّل. فعّل "Email/Password" في Firebase Console.' };
        }
        if (code === 'auth/network-request-failed') {
          return { ok: false, error: 'خطأ في الشبكة. تحقق من اتصالك وحاول مرة أخرى.' };
        }
        if (code === 'auth/invalid-api-key' || code?.includes('api-key-not-valid')) {
          return {
            ok: false,
            error: 'مفتاح Firebase مرفوض. في Google Cloud: Credentials → Browser key → API restrictions: اختر "Don\'t restrict key" أو أضف "Identity Toolkit API".',
          };
        }
        const hint = code ? ` (${code})` : '';
        return { ok: false, error: `فشل تسجيل الدخول. حاول لاحقاً.${hint}` };
      }
    }
    const trimmed = identifier.trim();
    for (const acc of PREDEFINED_ACCOUNTS) {
      if (acc.username === trimmed && acc.password === password) {
        const effectiveRole = getPredefinedRoleOverride(acc.username) ?? acc.role;
        try {
          setSessionItem(AUTH_KEY, 'true');
          setSessionItem(ROLE_KEY, effectiveRole);
          setSessionItem(CURRENT_USERNAME_KEY, acc.username);
        } catch {
          return { ok: false, error: 'تعذر حفظ الجلسة (تخزين غير متاح).' };
        }
        return { ok: true };
      }
    }
    const localUsers = getLocalUsersFromStorage();
    const hash = await hashPassword(password);
    for (const u of localUsers) {
      if (u.username === trimmed && u.passwordHash === hash) {
        try {
          setSessionItem(AUTH_KEY, 'true');
          setSessionItem(ROLE_KEY, u.role);
          setSessionItem(CURRENT_USERNAME_KEY, u.username);
        } catch {
          return { ok: false, error: 'تعذر حفظ الجلسة (تخزين غير متاح).' };
        }
        return { ok: true };
      }
    }
    return { ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' };
  },

  async createAccount(
    identifier: string,
    password: string,
    confirmPassword: string
  ): Promise<{ ok: boolean; error?: string }> {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return { ok: false, error: isFirebaseConfigured() ? 'أدخل البريد الإلكتروني.' : 'أدخل اسم المستخدم.' };
    }
    if (password.length < 6 && isFirebaseConfigured()) {
      return { ok: false, error: 'كلمة المرور 6 أحرف على الأقل.' };
    }
    if (password.length < 4 && !isFirebaseConfigured()) {
      return { ok: false, error: 'كلمة المرور 4 أحرف على الأقل.' };
    }
    if (password !== confirmPassword) return { ok: false, error: 'كلمتا المرور غير متطابقتين.' };

    if (!isFirebaseConfigured()) {
      return { ok: false, error: 'التسجيل معطّل. استخدم حساب Admin أو Mahmoud.' };
    }

    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (!auth) return { ok: false, error: 'لم يتم تهيئة Firebase.' };
      try {
        await createUserWithEmailAndPassword(auth, trimmed, password);
        return { ok: true };
      } catch (err: unknown) {
        const code = getAuthErrorCode(err);
        const message = getAuthErrorMessage(err);
        if (import.meta.env.DEV) console.error('Firebase createAccount error:', code, message, err);
        if (code === 'auth/email-already-in-use') {
          return { ok: false, error: 'هذا البريد مسجل مسبقاً.' };
        }
        if (code === 'auth/invalid-email') return { ok: false, error: 'البريد الإلكتروني غير صالح.' };
        if (code === 'auth/weak-password') return { ok: false, error: 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.' };
        if (code === 'auth/operation-not-allowed') {
          return { ok: false, error: 'التسجيل بالبريد غير مفعّل. فعّل "Email/Password" في Firebase Console → Authentication.' };
        }
        if (code === 'auth/network-request-failed') {
          return { ok: false, error: 'خطأ في الشبكة. تحقق من اتصالك وحاول مرة أخرى.' };
        }
        if (code === 'auth/too-many-requests') {
          return { ok: false, error: 'محاولات كثيرة. انتظر قليلاً ثم حاول مرة أخرى.' };
        }
        if (code === 'auth/invalid-api-key' || code?.includes('api-key-not-valid')) {
          return {
            ok: false,
            error: 'مفتاح Firebase مرفوض. في Google Cloud: Credentials → Browser key → API restrictions: اختر "Don\'t restrict key" أو أضف "Identity Toolkit API".',
          };
        }
        // Show code in UI so we can debug (e.g. auth/configuration-not-found, CORS, etc.)
        const hint = code ? ` (${code})` : '';
        return { ok: false, error: `فشل إنشاء الحساب. حاول لاحقاً.${hint}` };
      }
    }

    const passwordHash = await hashPassword(password);
    const user: StoredUser = { username: trimmed, passwordHash };
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setSessionItem(AUTH_KEY, 'true');
    } catch {
      return { ok: false, error: 'تعذر حفظ الحساب (تخزين غير متاح).' };
    }
    return { ok: true };
  },

  async logout(): Promise<void> {
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (auth) await signOut(auth);
    }
    try {
      removeSessionItem(AUTH_KEY);
      removeSessionItem(ROLE_KEY);
      removeSessionItem(CURRENT_USERNAME_KEY);
    } catch {
      /* ignore */
    }
  },

  getCurrentUsername(): string | null {
    return getSessionItem(CURRENT_USERNAME_KEY);
  },

  getPredefinedAccounts(): { username: string; role: LocalRole }[] {
    return PREDEFINED_ACCOUNTS.map(({ username, role }) => ({
      username,
      role: getPredefinedRoleOverride(username) ?? role,
    }));
  },

  setPredefinedRoleOverride(username: string, role: LocalRole): void {
    if (username === 'Admin') return;
    if (!PREDEFINED_ACCOUNTS.some((a) => a.username === username)) return;
    setPredefinedRoleOverrideToStorage(username, role);
  },

  getLocalUsers(): { username: string; role: LocalRole }[] {
    return getLocalUsersFromStorage().map(({ username, role }) => ({ username, role }));
  },

  async addLocalUser(username: string, password: string, role: LocalRole): Promise<{ ok: boolean; error?: string }> {
    const trimmed = username.trim();
    if (!trimmed) return { ok: false, error: 'أدخل اسم المستخدم.' };
    if (password.length < 4) return { ok: false, error: 'كلمة المرور 4 أحرف على الأقل.' };
    const exists = PREDEFINED_ACCOUNTS.some((a) => a.username === trimmed);
    if (exists) return { ok: false, error: 'اسم المستخدم محجوز (حساب ثابت).' };
    const users = getLocalUsersFromStorage();
    if (users.some((u) => u.username === trimmed)) return { ok: false, error: 'اسم المستخدم مستخدم مسبقاً.' };
    const passwordHash = await hashPassword(password);
    users.push({ username: trimmed, passwordHash, role });
    setLocalUsersToStorage(users);
    return { ok: true };
  },

  async updateLocalUserRole(username: string, role: LocalRole): Promise<{ ok: boolean; error?: string }> {
    const users = getLocalUsersFromStorage();
    const idx = users.findIndex((u) => u.username === username);
    if (idx === -1) return { ok: false, error: 'المستخدم غير موجود.' };
    users[idx] = { ...users[idx], role };
    setLocalUsersToStorage(users);
    return { ok: true };
  },

  async removeLocalUser(username: string): Promise<{ ok: boolean; error?: string }> {
    if (PREDEFINED_ACCOUNTS.some((a) => a.username === username)) {
      return { ok: false, error: 'لا يمكن حذف الحساب الثابت.' };
    }
    const users = getLocalUsersFromStorage().filter((u) => u.username !== username);
    setLocalUsersToStorage(users);
    return { ok: true };
  },

  subscribeToAuth(callback: (user: AuthUser | null) => void): () => void {
    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (!auth) {
        callback(null);
        return () => {};
      }
      return onAuthStateChanged(auth, (fbUser: User | null) => {
        callback(fbUser ? { uid: fbUser.uid } : null);
      });
    }
    if (getSessionItem(AUTH_KEY) === 'true') {
      const role = getSessionItem(ROLE_KEY);
      callback({ local: true, role: role === 'admin' || role === 'staff' ? role : undefined });
    } else {
      callback(null);
    }
    return () => {};
  },
};
