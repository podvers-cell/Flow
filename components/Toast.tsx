import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const styles = {
    success: 'bg-emerald-500/95 text-white border-emerald-400/30',
    error: 'bg-rose-500/95 text-white border-rose-400/30',
    info: 'bg-indigo-500/95 text-white border-indigo-400/30',
  };

  const icons = {
    success: <CheckCircle size={20} className="shrink-0" />,
    error: <AlertCircle size={20} className="shrink-0" />,
    info: <Info size={20} className="shrink-0" />,
  };

  return (
    <div
      role="alert"
      className={`fixed left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl border backdrop-blur-sm animate-toast-in max-w-[calc(100vw-2rem)] w-max min-w-0 ${styles[type]}`}
      style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
    >
      {icons[type]}
      <span className="font-medium text-sm truncate flex-1 min-w-0">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="mr-1 p-2 rounded-lg hover:bg-white/20 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
        aria-label="إغلاق"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Toast;
