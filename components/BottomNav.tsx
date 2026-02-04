import React from 'react';
import {
  LayoutDashboard,
  Camera,
  Wallet,
  Package,
  Settings,
  LogOut
} from 'lucide-react';
import { authService } from '../services/authService';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
  /** إخفاء تبويب الإعدادات (مثلاً لحساب Staff) */
  hideSettings?: boolean;
}

const navItems = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'projects', label: 'المشاريع', icon: Camera },
  { id: 'finances', label: 'المالية', icon: Wallet },
  { id: 'assets', label: 'الأصول', icon: Package },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
] as const;

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onLogout, hideSettings }) => {
  const items = hideSettings
    ? navItems.filter((item) => item.id !== 'settings')
    : navItems;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around gap-0 px-3 py-2 mobile-bottom-nav"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      aria-label="تنقل الصفحات"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`nav-item flex flex-col items-center justify-center min-w-[52px] min-h-[52px] touch-manipulation ${
              isActive ? 'nav-item-active' : 'text-slate-400 active:bg-slate-100/80'
            }`}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} className="shrink-0" />
          </button>
        );
      })}
      <button
        type="button"
        onClick={async () => {
          await authService.logout();
          onLogout?.();
        }}
        className="nav-item flex flex-col items-center justify-center min-w-[52px] min-h-[52px] text-slate-400 touch-manipulation active:bg-slate-100/80"
        aria-label="تسجيل الخروج"
      >
        <LogOut size={22} strokeWidth={1.75} className="shrink-0" />
      </button>
    </nav>
  );
};

export default BottomNav;
