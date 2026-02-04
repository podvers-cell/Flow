import React, { useState } from 'react';
import { Camera, Loader2, User, Lock, LogIn, UserPlus, Mail, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const useFirebase = authService.isFirebaseConfigured();
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'create') {
        const result = await authService.createAccount(identifier, password, confirmPassword);
        if (result.ok) onSuccess();
        else setError(result.error ?? 'حدث خطأ.');
      } else {
        const result = await authService.login(identifier, password);
        if (result.ok) onSuccess();
        else setError(result.error ?? 'حدث خطأ.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('حدث خطأ غير متوقع. تحقق من الاتصال وحاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === 'login' ? 'create' : 'login'));
    setError('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const label = useFirebase ? 'البريد الإلكتروني' : 'اسم المستخدم';
  const placeholder = useFirebase ? 'البريد الإلكتروني الرسمي' : 'اسم المستخدم أو البريد الإلكتروني';
  const Icon = useFirebase ? Mail : User;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-100 via-white to-slate-50" dir="rtl">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass-modal rounded-[28px] overflow-hidden shadow-xl transition-shadow hover:shadow-2xl">
          <div className="p-10 pb-6 text-center border-b border-white/40">
            <div className="inline-flex p-4 bg-indigo-50 rounded-2xl mb-5">
              <Camera className="text-indigo-600" size={38} />
            </div>
            <h1 className="text-2xl text-slate-800 font-medium tracking-tight">LensFlow</h1>
            <p className="text-slate-500 text-sm mt-1.5">مدير استوديو الإبداع — سجّل دخولك للبدء</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
            {error && (
              <div className="p-4 bg-rose-50/80 border border-rose-100 rounded-2xl text-rose-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-600 mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={useFirebase ? 'email' : 'text'}
                  required
                  autoComplete={useFirebase ? 'email' : 'username'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-4 pr-12 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400"
                  placeholder={placeholder}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400"
                  placeholder={mode === 'create' ? (useFirebase ? 'كلمة مرور قوية (6 أحرف فأكثر)' : 'كلمة مرور قوية (4 أحرف فأكثر)') : 'كلمة المرور'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50/50 transition-all"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {mode === 'create' && (
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">
                  تأكيد كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl pl-12 pr-12 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400"
                    placeholder="تأكيد كلمة المرور"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50/50 transition-all"
                    title={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    aria-label={showConfirmPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl text-base font-medium shadow-lg shadow-indigo-200/50 hover:bg-indigo-700 hover:shadow-indigo-300/50 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={22} />
                  تسجيل الدخول
                </>
              ) : (
                <>
                  <UserPlus size={22} />
                  إنشاء الحساب
                </>
              )}
            </button>

            {useFirebase && (
              <button
                type="button"
                onClick={switchMode}
                className="w-full text-slate-500 text-sm hover:text-indigo-600 transition-colors py-2 rounded-lg hover:bg-indigo-50/50 active:scale-[0.99]"
              >
                {mode === 'login'
                  ? 'ليس لديك حساب؟ إنشاء حساب جديد'
                  : 'لديك حساب بالفعل؟ تسجيل الدخول'}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
