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

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
  /** اسم البرنامج/الاستوديو — يُختار من صفحة الإعدادات ويُعرض في قائمة الصفحات */
  studioName?: string;
  /** صورة الشعار — تظهر فوق الاسم في قائمة الصفحات */
  studioImageUrl?: string;
  /** إخفاء تبويب الإعدادات (مثلاً لحساب Staff) */
  hideSettings?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, studioName, studioImageUrl, hideSettings }) => {
  const allItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'projects', label: 'المشاريع', icon: Camera },
    { id: 'finances', label: 'المالية', icon: Wallet },
    { id: 'assets', label: 'الأصول', icon: Package },
    { id: 'settings', label: 'الإعدادات', icon: Settings },
  ];
  const menuItems = hideSettings ? allItems.filter((item) => item.id !== 'settings') : allItems;

  return (
    <div className="w-64 glass-sidebar text-white h-screen fixed right-0 top-0 flex flex-col">
      <div className="p-6 border-b border-white/10 flex flex-col items-center gap-3">
        {studioImageUrl && (
          <img src={studioImageUrl} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-lg" />
        )}
        <div className="text-center">
          <h1 className="text-xl font-medium text-white/95 truncate max-w-full px-1" title={studioName || 'LensFlow'}>
            {studioName?.trim() || 'LensFlow'}
          </h1>
          <p className="text-xs text-white/60 mt-1">مدير الإبداع الذكي</p>
        </div>
      </div>

      <nav className="flex-1 mt-5 px-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 active:scale-[0.98] ${
                activeTab === item.id
                  ? 'bg-white/20 text-white shadow-lg shadow-black/5'
                  : 'text-white/70 hover:bg-white/10 hover:text-white hover:scale-[1.02]'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={async () => {
            await authService.logout();
            onLogout?.();
          }}
          className="w-full flex items-center gap-3 px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 rounded-2xl transition-all duration-200 active:scale-[0.98]"
        >
          <LogOut size={20} />
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
