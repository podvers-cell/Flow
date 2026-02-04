
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import Toast from './components/Toast';
import { 
  Project, 
  ProjectStatus, 
  ProjectType, 
  Transaction, 
  TransactionType,
  AppNotification,
  Asset
} from './types';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  Clock, 
  Plus,
  Loader2,
  X,
  Trash2,
  Filter,
  Database,
  Layers,
  Bell,
  AlertCircle,
  Briefcase,
  AlertTriangle,
  User,
  UserPlus,
  Settings,
  Save,
  Palette,
  CalendarDays,
  Banknote,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  Check,
  Pencil,
  Car,
  Coffee,
  CreditCard,
  Megaphone,
  Smartphone,
  Wrench,
  Tag,
  ShoppingBag,
  Camera,
  ImagePlus,
  Package,
  Wallet,
  Search,
  FileText,
  Printer,
  Download
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { StorageService } from './services/firestoreService';
import { authService, type AuthUser, type LocalRole } from './services/authService';
import { localDatabase } from './services/localDatabase';
import { MY_GEARS_SEED } from './data/myGearsSeed';

/** تحويل الأرقام العربية (٠١٢٣٤٥٦٧٨٩) والإنجليزية إلى عدد — لاستخدامه في حقول المبالغ */
function parseAmountFromInput(value: string): number {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const westernDigits = '0123456789';
  let s = String(value).trim().replace(/٫/g, '.'); // فاصل عشري عربي
  for (let i = 0; i < arabicDigits.length; i++) s = s.split(arabicDigits[i]).join(westernDigits[i]);
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

// --- المكونات الفرعية المستقرة ---

const Modal = ({ title, subtitle, children, onClose }: { title: string; subtitle?: string; children?: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="glass-modal rounded-[28px] w-full max-w-md overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
      <div className="p-6 pb-4 flex justify-between items-start gap-4 border-b border-white/40">
        <div>
          <h3 className="text-xl text-slate-800 font-medium">{title}</h3>
          {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-white/50 p-2 rounded-xl transition-all shrink-0" aria-label="إغلاق"><X size={20} /></button>
      </div>
      <div className="p-6 pt-4 max-h-[85vh] overflow-y-auto custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

const CustomCalendar = ({ selectedDate, onSelect, onClose }: { selectedDate: string, onSelect: (date: string) => void, onClose: () => void }) => {
  const [currentView, setCurrentView] = useState(selectedDate ? new Date(selectedDate) : new Date());
  
  const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const daysOfWeek = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() + 1, 1));
  };

  const days = [];
  const totalDays = daysInMonth(currentView.getFullYear(), currentView.getMonth());
  const startDay = firstDayOfMonth(currentView.getFullYear(), currentView.getMonth());

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let d = 1; d <= totalDays; d++) {
    days.push(d);
  }

  return (
    <div className="glass-modal p-5 rounded-2xl animate-scale-in">
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleNextMonth} type="button" className="p-2 hover:bg-white/50 rounded-xl text-slate-600 transition-colors">
          <ChevronRightIcon size={20}/>
        </button>
        <h4 className="font-medium text-slate-800 text-sm">
          {monthNames[currentView.getMonth()]} {currentView.getFullYear()}
        </h4>
        <button onClick={handlePrevMonth} type="button" className="p-2 hover:bg-white/50 rounded-xl text-slate-600 transition-colors">
          <ChevronLeftIcon size={20}/>
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {daysOfWeek.map(d => (
          <div key={d} className="text-[10px] font-black text-slate-400 py-1 uppercase">{d}</div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          
          const dateStr = `${currentView.getFullYear()}-${String(currentView.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = selectedDate === dateStr;
          const isToday = new Date().toISOString().split('T')[0] === dateStr;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={`py-2 text-sm font-bold rounded-xl transition-all ${
                isSelected ? 'bg-indigo-600 text-white shadow-lg scale-110' : 
                isToday ? 'text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100' :
                'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 flex gap-2">
        <button 
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-200 transition-all"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
};

// --- المكون الأساسي ---

interface AppProps {
  onLogout?: () => void;
  storage: StorageService;
  authUser?: AuthUser | null;
}

const App: React.FC<AppProps> = ({ onLogout, storage, authUser }) => {
  const isStaff = Boolean(authUser && 'local' in authUser && authUser.role === 'staff');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (isStaff && activeTab === 'settings') setActiveTab('dashboard');
  }, [isStaff, activeTab]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchProjects, setSearchProjects] = useState('');
  const [searchFinances, setSearchFinances] = useState('');
  const [searchAssets, setSearchAssets] = useState('');
  const [filterAssetCategory, setFilterAssetCategory] = useState<string>('all');
  const [filterAssetCondition, setFilterAssetCondition] = useState<string>('all');
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null);
  const [showAssetModal, setShowAssetModal] = useState(false);

  type PendingDelete = { type: 'project'; id: string } | { type: 'transaction'; id: string } | { type: 'asset'; id: string } | { type: 'clearAll' };
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [showAdminAuthModal, setShowAdminAuthModal] = useState(false);
  const [adminAuthUsername, setAdminAuthUsername] = useState('');
  const [adminAuthPassword, setAdminAuthPassword] = useState('');
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [newAsset, setNewAsset] = useState({ name: '', category: 'Camera', value: 0, quantity: 1, brand: '', condition: 'جيد', purchaseDate: '', notes: '' });

  const defaultSettings = {
    studioName: 'LensFlow Studio',
    userName: 'مبدع لنس فلو',
    primaryColor: '#6366f1',
    enableNotifications: true,
    studioImageUrl: '' as string
  };
  const [userSettings, setUserSettings] = useState(() => {
    const saved = localStorage.getItem('lensflow_settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const [editSettings, setEditSettings] = useState(userSettings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportModalData, setReportModalData] = useState<{ title: string; bodyContent: string; reportStyles: string; downloadFilename: string } | null>(null);
  const [notificationFocusProjectId, setNotificationFocusProjectId] = useState<string | null>(null);
  const [localUsersVersion, setLocalUsersVersion] = useState(0);
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<LocalRole>('staff');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const WELCOME_TEXT = 'أهلاً بك يا مبدع، ماذا تريد ان تفعل اليوم؟';
  const [welcomeTypingIndex, setWelcomeTypingIndex] = useState(0);
  const welcomeTypingRef = useRef(0);
  const welcomeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notificationsAreaRef = useRef<HTMLDivElement>(null);

  const PREDEFINED_COLORS = [
    '#6366f1', // Indigo (Default)
    '#3b82f6', // Blue
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#f43f5e', // Rose
    '#8b5cf6', // Violet
    '#d946ef', // Fuchsia
    '#0f172a', // Slate
  ];

  const handleSaveSettings = () => {
    setIsSavingSettings(true);
    setUserSettings(editSettings);
    localStorage.setItem('lensflow_settings', JSON.stringify(editSettings));
    setTimeout(() => {
      setIsSavingSettings(false);
      setToast({ message: 'تم حفظ الإعدادات بنجاح في متصفحك.', type: 'success' });
    }, 600);
  };

  useEffect(() => {
    if (activeTab !== 'dashboard') return;
    welcomeTypingRef.current = 0;
    setWelcomeTypingIndex(0);
    if (welcomeIntervalRef.current) {
      clearInterval(welcomeIntervalRef.current);
      welcomeIntervalRef.current = null;
    }
    const TYPING_SPEED = 70;
    welcomeIntervalRef.current = setInterval(() => {
      welcomeTypingRef.current += 1;
      setWelcomeTypingIndex(welcomeTypingRef.current);
      if (welcomeTypingRef.current >= WELCOME_TEXT.length) {
        if (welcomeIntervalRef.current) {
          clearInterval(welcomeIntervalRef.current);
          welcomeIntervalRef.current = null;
        }
      }
    }, TYPING_SPEED);
    return () => {
      if (welcomeIntervalRef.current) {
        clearInterval(welcomeIntervalRef.current);
        welcomeIntervalRef.current = null;
      }
    };
  }, [activeTab]);

  useEffect(() => {
    const initDB = async () => {
      try {
        const [p, t, n, a] = await Promise.all([
          storage.getProjects(),
          storage.getTransactions(),
          storage.getNotifications(),
          localDatabase.getAssets()
        ]);
        setProjects(p);
        setTransactions(t);
        setNotifications(n);
        setAssets(a);
        
        if (userSettings.enableNotifications) {
          await checkDeadlines(p);
        }
      } catch (err) {
        console.error("خطأ في الاتصال بقاعدة البيانات", err);
      } finally {
        setIsDbLoading(false);
      }
    };
    initDB();
  }, [userSettings.enableNotifications]);

  const checkDeadlines = async (allProjects: Project[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    let hasChanges = false;
    const currentProjects = [...allProjects];

    for (let i = 0; i < currentProjects.length; i++) {
      const project = currentProjects[i];
      if (project.status === ProjectStatus.DELIVERED || project.status === ProjectStatus.CANCELLED) continue;

      const deadlineDate = new Date(project.deadline);
      deadlineDate.setHours(0, 0, 0, 0);

      const isUnpaid = project.paidAmount < project.budget;
      const remaining = project.budget - project.paidAmount;

      if (deadlineDate < today) {
        // Handle Overdue Status
        if (project.status !== ProjectStatus.OVERDUE) {
          await storage.updateProject(project.id, { status: ProjectStatus.OVERDUE });
          currentProjects[i] = { ...project, status: ProjectStatus.OVERDUE };
          hasChanges = true;

          const overdueNotif: AppNotification = {
            id: 'n-overdue-' + project.id,
            title: 'مشروع متأخر!',
            message: `المشروع "${project.title}" تجاوز موعد التسليم النهائي في ${project.deadline}.`,
            date: new Date().toISOString(),
            isRead: false,
            projectId: project.id
          };
          await storage.addNotification(overdueNotif);
        }
        
        // Payment Reminder for Overdue
        if (isUnpaid) {
          const payOverdueNotif: AppNotification = {
            id: 'n-pay-overdue-' + project.id,
            title: '🔴 تنبيه مالي: مستحقات متأخرة',
            message: `مشروع "${project.title}" متأخر ويوجد مبلغ متبقي (${remaining} د.إ) لم يتم تحصيله.`,
            date: new Date().toISOString(),
            isRead: false,
            projectId: project.id
          };
          await storage.addNotification(payOverdueNotif);
        }
      } 
      else if (deadlineDate <= threeDaysFromNow && deadlineDate >= today) {
        // Deadline Warning
        const warningNotif: AppNotification = {
          id: 'n-warn-' + project.id,
          title: '⏳ اقتراب موعد التسليم!',
          message: `المشروع "${project.title}" ينتهي خلال أقل من 3 أيام (${project.deadline}).`,
          date: new Date().toISOString(),
          isRead: false,
          projectId: project.id
        };
        await storage.addNotification(warningNotif);

        // Payment Reminder for Approaching
        if (isUnpaid) {
          const payWarnNotif: AppNotification = {
            id: 'n-pay-warn-' + project.id,
            title: '💰 تذكير بالدفع',
            message: `موعد تسليم "${project.title}" اقترب. يرجى متابعة تحصيل المبلغ المتبقي (${remaining} د.إ).`,
            date: new Date().toISOString(),
            isRead: false,
            projectId: project.id
          };
          await storage.addNotification(payWarnNotif);
        }
      }
    }

    if (hasChanges) {
      setProjects(currentProjects);
    }
    
    const updatedNotifs = await storage.getNotifications();
    setNotifications(updatedNotifs);
  };

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const [newProject, setNewProject] = useState({ title: '', client: '', type: ProjectType.PHOTOGRAPHY, budget: 0, deadline: '', initialPaid: 0 });
  const [newTransaction, setNewTransaction] = useState({ description: '', amount: 0, type: TransactionType.INCOME, category: 'عام', projectId: '' });

  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
    return {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      active: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.OVERDUE).length,
      unreadNotifications: notifications.filter(n => !n.isRead).length
    };
  }, [projects, transactions, notifications]);

  // --- Helpers ---
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('معدات') || cat.includes('كاميرا') || cat.includes('عدس')) return Camera;
    if (cat.includes('تسويق') || cat.includes('إعلان')) return Megaphone;
    if (cat.includes('نقل') || cat.includes('مواصلات') || cat.includes('بنزين') || cat.includes('سيار')) return Car;
    if (cat.includes('طعام') || cat.includes('أكل') || cat.includes('ضياف')) return Coffee;
    if (cat.includes('راتب') || cat.includes('رواتب') || cat.includes('مكافأ')) return User;
    if (cat.includes('اشتراك') || cat.includes('نت') || cat.includes('برامج')) return CreditCard;
    if (cat.includes('صيانة') || cat.includes('إصلاح')) return Wrench;
    if (cat.includes('ملابس') || cat.includes('أزياء')) return ShoppingBag;
    if (cat.includes('جوال') || cat.includes('اتصال')) return Smartphone;
    return Tag;
  };

  // --- العمليات المحسنة ---

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.deadline) {
      setToast({ message: 'الرجاء اختيار تاريخ التسليم', type: 'error' });
      return;
    }
    const projectId = Math.random().toString(36).substr(2, 9);
    const project: Project = {
      id: projectId,
      title: newProject.title,
      client: newProject.client,
      type: newProject.type,
      budget: newProject.budget,
      paidAmount: newProject.initialPaid || 0,
      status: ProjectStatus.UPCOMING,
      startDate: new Date().toISOString().split('T')[0],
      deadline: newProject.deadline
    };

    await storage.addProject(project);

    // إذا تم دفع مبلغ أولي، نقوم بتسجيله في المالية
    if (newProject.initialPaid > 0) {
      const transaction: Transaction = {
        id: 't-init-' + projectId,
        type: TransactionType.INCOME,
        amount: newProject.initialPaid,
        category: 'دفعات مشاريع',
        date: new Date().toISOString().split('T')[0],
        description: `دفعة أولية: ${project.title}`,
        projectId: projectId
      };
      await storage.addTransaction(transaction);
      setTransactions(prev => [transaction, ...prev]);
    }

    setProjects(prev => [project, ...prev]);
    setShowProjectModal(false);
    setNewProject({ title: '', client: '', type: ProjectType.PHOTOGRAPHY, budget: 0, deadline: '', initialPaid: 0 });
  };

  const deleteProject = (id: string) => {
    setProjectToDelete(id);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    setPendingDelete({ type: 'project', id: projectToDelete });
    setProjectToDelete(null);
    setShowAdminAuthModal(true);
  };

  const executeDeleteProject = async (projectId: string) => {
    const linkedTransactions = transactions.filter(t => t.projectId === projectId);
    for (const t of linkedTransactions) await storage.deleteTransaction(t.id);
    const linkedNotifications = notifications.filter(n => n.projectId === projectId);
    for (const n of linkedNotifications) await storage.deleteNotification(n.id);
    await storage.deleteProject(projectId);
    setTransactions(prev => prev.filter(t => t.projectId !== projectId));
    setNotifications(prev => prev.filter(n => n.projectId !== projectId));
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const updateProjectStatus = async (id: string, status: ProjectStatus) => {
    await storage.updateProject(id, { status });
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTransactionId) {
       // Update logic
       const oldTransaction = transactions.find(t => t.id === editingTransactionId);
       if (!oldTransaction) return;

       // 1. Revert changes on project from old transaction
       let updatedProjects = [...projects];
       if (oldTransaction.projectId) {
         const pIndex = updatedProjects.findIndex(p => p.id === oldTransaction.projectId);
         if (pIndex !== -1) {
           const project = { ...updatedProjects[pIndex] };
           if (oldTransaction.type === TransactionType.INCOME) {
             project.paidAmount -= oldTransaction.amount;
           } else {
             project.budget += oldTransaction.amount;
           }
           updatedProjects[pIndex] = project;
         }
       }

       // 2. Apply new changes on project
       if (newTransaction.projectId) {
         const pIndex = updatedProjects.findIndex(p => p.id === newTransaction.projectId);
         if (pIndex !== -1) {
            const project = { ...updatedProjects[pIndex] };
            if (newTransaction.type === TransactionType.INCOME) {
              project.paidAmount += newTransaction.amount;
            } else {
              project.budget -= newTransaction.amount;
            }
            updatedProjects[pIndex] = project;
         }
       }

       // Save projects
       for (const p of updatedProjects) {
         const oldP = projects.find(op => op.id === p.id);
         if (oldP && (oldP.paidAmount !== p.paidAmount || oldP.budget !== p.budget)) {
           await storage.updateProject(p.id, p);
         }
       }
       setProjects(updatedProjects);

       // Save transaction
       const finalTx: Transaction = {
         id: editingTransactionId,
         description: newTransaction.description,
         amount: newTransaction.amount,
         type: newTransaction.type,
         category: newTransaction.category,
         projectId: newTransaction.projectId,
         date: oldTransaction.date // Keep original date
       };

       await storage.updateTransaction(editingTransactionId, finalTx);
       setTransactions(prev => prev.map(t => t.id === editingTransactionId ? finalTx : t));

    } else {
       // Create logic
       const transactionId = 't' + Math.random().toString(36).substr(2, 9);
       const transaction: Transaction = {
         ...newTransaction,
         id: transactionId,
         date: new Date().toISOString().split('T')[0],
         projectId: newTransaction.projectId || undefined
       };

       if (transaction.projectId) {
         const project = projects.find(p => p.id === transaction.projectId);
         if (project) {
           let updatedProject = { ...project };
           if (transaction.type === TransactionType.INCOME) {
             updatedProject.paidAmount += transaction.amount;
           } else {
             updatedProject.budget -= transaction.amount;
           }
           
           await storage.updateProject(project.id, updatedProject);
           setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));
         }
       }

       await storage.addTransaction(transaction);
       setTransactions(prev => [transaction, ...prev]);
    }

    setShowTransactionModal(false);
    resetTransactionForm();
  };

  const openEditTransaction = (t: Transaction) => {
    setNewTransaction({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      projectId: t.projectId || ''
    });
    setEditingTransactionId(t.id);
    setShowTransactionModal(true);
  };

  const resetTransactionForm = () => {
    setNewTransaction({ description: '', amount: 0, type: TransactionType.INCOME, category: 'عام', projectId: '' });
    setEditingTransactionId(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
  };

  const confirmDeleteTransaction = async () => {
    if (!transactionToDelete) return;
    setPendingDelete({ type: 'transaction', id: transactionToDelete });
    setTransactionToDelete(null);
    setShowAdminAuthModal(true);
  };

  const executeDeleteTransaction = async (transactionId: string) => {
    const tx = transactions.find((t) => t.id === transactionId);
    if (tx?.projectId) {
      const project = projects.find((p) => p.id === tx.projectId);
      if (project) {
        const updated = { ...project };
        if (tx.type === TransactionType.INCOME) {
          updated.paidAmount = Math.max(0, (updated.paidAmount ?? 0) - tx.amount);
        } else {
          updated.budget = (updated.budget ?? 0) + tx.amount;
        }
        await storage.updateProject(project.id, updated);
        setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)));
      }
    }
    await storage.deleteTransaction(transactionId);
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
  };

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name.trim()) {
      setToast({ message: 'أدخل اسم الأصل', type: 'error' });
      return;
    }
    const now = new Date().toISOString();
    const quantity = Math.max(0, Number(newAsset.quantity) || 1);
    const brand = newAsset.brand?.trim() ?? '';
    const condition = newAsset.condition ?? 'جيد';
    const value = Number(newAsset.value) || 0;
    const purchaseDate = newAsset.purchaseDate || now.slice(0, 10);
    const notes = newAsset.notes.trim();
    const name = newAsset.name.trim();
    const category = newAsset.category;

    if (editingAssetId) {
      await localDatabase.updateAsset(editingAssetId, {
        name,
        category,
        value,
        quantity,
        brand,
        condition,
        purchaseDate,
        notes,
      });
      setAssets(prev => prev.map(a => a.id === editingAssetId
        ? { ...a, name, category, value, quantity, brand, condition, purchaseDate, notes }
        : a));
      setToast({ message: 'تم تحديث الأصل بنجاح.', type: 'success' });
    } else {
      const id = 'ast-' + Math.random().toString(36).slice(2, 11);
      const asset: Asset = {
        id,
        name,
        category,
        value,
        quantity,
        brand,
        condition,
        purchaseDate,
        notes,
        createdAt: now,
      };
      await localDatabase.addAsset(asset);
      setAssets(prev => [asset, ...prev]);
      setToast({ message: 'تم إضافة الأصل بنجاح.', type: 'success' });
    }
    setShowAssetModal(false);
    resetAssetForm();
  };

  const resetAssetForm = () => {
    setNewAsset({ name: '', category: 'Camera', value: 0, quantity: 1, brand: '', condition: 'جيد', purchaseDate: '', notes: '' });
    setEditingAssetId(null);
  };

  const openEditAsset = (asset: Asset) => {
    setNewAsset({
      name: asset.name,
      category: asset.category,
      value: asset.value,
      quantity: asset.quantity ?? 1,
      brand: asset.brand ?? '',
      condition: mapConditionToArabic(asset.condition ?? '') || 'جيد',
      purchaseDate: asset.purchaseDate,
      notes: asset.notes,
    });
    setEditingAssetId(asset.id);
    setShowAssetModal(true);
  };

  const confirmDeleteAsset = async () => {
    if (!assetToDelete) return;
    setPendingDelete({ type: 'asset', id: assetToDelete });
    setAssetToDelete(null);
    setShowAdminAuthModal(true);
  };

  const executeDeleteAsset = async (assetId: string) => {
    await localDatabase.deleteAsset(assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    setToast({ message: 'تم حذف الأصل.', type: 'success' });
  };

  const ADMIN_USER = 'Admin';
  const ADMIN_PASSWORD = 'Mahmoud@2026';

  const handleAdminAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingDelete) return;
    const userOk = (adminAuthUsername.trim() === ADMIN_USER) && (adminAuthPassword === ADMIN_PASSWORD);
    if (!userOk) {
      setToast({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة.', type: 'error' });
      return;
    }
    try {
      if (pendingDelete.type === 'project') await executeDeleteProject(pendingDelete.id);
      else if (pendingDelete.type === 'transaction') await executeDeleteTransaction(pendingDelete.id);
      else if (pendingDelete.type === 'asset') await executeDeleteAsset(pendingDelete.id);
      else if (pendingDelete.type === 'clearAll') await storage.clearAllData();
    } catch (err) {
      setToast({ message: 'حدث خطأ أثناء الحذف.', type: 'error' });
    }
    setPendingDelete(null);
    setShowAdminAuthModal(false);
    setAdminAuthUsername('');
    setAdminAuthPassword('');
  };

  const importMyGears = async () => {
    const existingNames = new Set(assets.map(a => a.name.trim().toLowerCase()));
    const now = new Date().toISOString();
    let added = 0;
    for (const row of MY_GEARS_SEED) {
      if (existingNames.has(row.name.trim().toLowerCase())) continue;
      const id = 'ast-' + Math.random().toString(36).slice(2, 11);
      const asset: Asset = {
        id,
        name: row.name,
        category: row.type,
        quantity: row.quantity,
        brand: row.brand,
        condition: mapConditionToArabic(row.condition),
        value: 0,
        purchaseDate: '',
        notes: '',
        createdAt: now,
      };
      await localDatabase.addAsset(asset);
      setAssets(prev => [asset, ...prev]);
      existingNames.add(row.name.trim().toLowerCase());
      added++;
    }
    setToast({ message: added > 0 ? `تم استيراد ${added} عنصر من قائمة My Gears.` : 'جميع العناصر موجودة مسبقاً.', type: added > 0 ? 'success' : 'info' });
  };

  const formatAssetDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const markNotificationRead = async (id: string) => {
    await storage.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleNotificationClick = (n: AppNotification) => {
    markNotificationRead(n.id);
    setActiveTab('projects');
    if (n.projectId) setNotificationFocusProjectId(n.projectId);
    setShowNotifications(false);
  };

  useEffect(() => {
    if (!showNotifications) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationsAreaRef.current && !notificationsAreaRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  useEffect(() => {
    if (activeTab !== 'projects' || !notificationFocusProjectId) return;
    const id = notificationFocusProjectId;
    let innerTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(() => {
      const el = document.getElementById(`project-row-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-indigo-400', 'ring-offset-2');
        innerTimer = setTimeout(() => {
          el.classList.remove('ring-2', 'ring-indigo-400', 'ring-offset-2');
          setNotificationFocusProjectId(null);
        }, 2500);
      } else {
        setNotificationFocusProjectId(null);
      }
    }, 100);
    return () => {
      clearTimeout(timer);
      if (innerTimer) clearTimeout(innerTimer);
    };
  }, [activeTab, notificationFocusProjectId]);

  const filteredProjects = useMemo(() => {
    let list = filterStatus === 'all' ? projects : projects.filter(p => p.status === filterStatus);
    const q = searchProjects.trim().toLowerCase();
    if (!q) return list;
    return list.filter(p => {
      const title = (p.title ?? '').toLowerCase();
      const client = (p.client ?? '').toLowerCase();
      const type = (p.type ?? '').toLowerCase();
      const status = (p.status ?? '').toLowerCase();
      const budget = String(p.budget ?? '');
      const deadline = (p.deadline ?? '').toLowerCase();
      return title.includes(q) || client.includes(q) || type.includes(q) || status.includes(q) || budget.includes(q) || deadline.includes(q);
    });
  }, [projects, filterStatus, searchProjects]);

  const filteredTransactions = useMemo(() => {
    const q = searchFinances.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter(t => {
      const desc = (t.description ?? '').toLowerCase();
      const cat = (t.category ?? '').toLowerCase();
      const date = (t.date ?? '').toLowerCase();
      const amount = String(t.amount ?? '');
      const type = (t.type ?? '').toLowerCase();
      const linked = projects.find(p => p.id === t.projectId);
      const projectTitle = (linked?.title ?? '').toLowerCase();
      return desc.includes(q) || cat.includes(q) || date.includes(q) || amount.includes(q) || type.includes(q) || projectTitle.includes(q);
    });
  }, [transactions, searchFinances, projects]);

  const mapConditionToArabicForFilter = (en: string): string => {
    const t = (en ?? '').trim().toLowerCase();
    if (t === 'good') return 'جيد';
    if (t === 'normal') return 'عادي';
    if (t === 'missing' || t === 'messing') return 'مفقود';
    if (t === 'arriving soon') return 'يصل قريباً';
    const trimmed = (en ?? '').trim();
    if (['جيد', 'عادي', 'مفقود', 'مرتجع', 'يصل قريباً'].includes(trimmed)) return trimmed;
    return trimmed || 'جيد';
  };

  const filteredAssets = useMemo(() => {
    let list = assets;
    if (filterAssetCategory !== 'all') {
      list = list.filter(a => (a.category ?? '').trim() === filterAssetCategory);
    }
    if (filterAssetCondition !== 'all') {
      list = list.filter(a => mapConditionToArabicForFilter(a.condition ?? '') === filterAssetCondition);
    }
    const q = searchAssets.trim().toLowerCase();
    if (!q) return list;
    return list.filter(a => {
      const name = (a.name ?? '').toLowerCase();
      const category = (a.category ?? '').toLowerCase();
      const brand = (a.brand ?? '').toLowerCase();
      const condition = (a.condition ?? '').toLowerCase();
      const notes = (a.notes ?? '').toLowerCase();
      const value = String(a.value ?? '');
      const purchaseDate = (a.purchaseDate ?? '').toLowerCase();
      return name.includes(q) || category.includes(q) || brand.includes(q) || condition.includes(q) || notes.includes(q) || value.includes(q) || purchaseDate.includes(q);
    });
  }, [assets, searchAssets, filterAssetCategory, filterAssetCondition]);

  const formatDeadline = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  const reportStyles = `
    .report-wrap { font-family: 'Segoe UI', Tahoma, 'Arabic UI', sans-serif; padding: 16px; color: #1e293b; direction: rtl; text-align: right; box-sizing: border-box; }
    .report-wrap h1 { font-size: 22px; border-bottom: 2px solid #6366f1; padding-bottom: 8px; margin: 0 0 12px 0; }
    .report-wrap h2 { font-size: 16px; margin: 20px 0 10px 0; color: #475569; }
    .report-wrap table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    .report-wrap th, .report-wrap td { border: 1px solid #e2e8f0; padding: 8px 10px; text-align: right; }
    .report-wrap th { background: #f1f5f9; font-weight: 600; }
    .report-wrap .meta { color: #64748b; font-size: 12px; margin-bottom: 16px; }
    .report-wrap .stats { display: flex; flex-wrap: wrap; gap: 12px; margin: 12px 0; }
    .report-wrap .stat { background: #f8fafc; padding: 12px 14px; border-radius: 8px; min-width: 120px; border: 1px solid #e2e8f0; }
    .report-wrap .stat strong { display: block; font-size: 14px; color: #6366f1; margin-top: 4px; }
  `;

  const openReportModal = () => {
    try {
    const date = new Date().toLocaleString('ar-EG', { dateStyle: 'long', timeStyle: 'short' });
    const escape = (s: string) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const projRows = projects.map(p => `
      <tr><td>${escape(p.title)}</td><td>${escape(p.client)}</td><td>${p.budget} د.إ</td><td>${p.paidAmount ?? 0} د.إ</td><td>${formatDeadline(p.deadline)}</td><td>${escape(String(p.status))}</td></tr>`).join('');
    const txRows = transactions.map(t => `
      <tr><td>${escape(t.description)}</td><td>${escape(t.type)}</td><td>${t.amount} د.إ</td><td>${escape(t.category)}</td><td>${escape(t.date)}</td></tr>`).join('');
    const assetRows = assets.map(a => `
      <tr><td>${escape(a.category)}</td><td>${escape(a.name)}</td><td>${a.quantity ?? 1}</td><td>${escape(a.brand ?? '—')}</td><td>${escape(mapConditionToArabicForFilter(a.condition ?? '') || '—')}</td><td>${a.value ?? 0} د.إ</td><td>${formatAssetDate(a.purchaseDate)}</td></tr>`).join('');

    let title = '';
    let bodyContent = '';
    let downloadFilename = '';

    if (activeTab === 'dashboard') {
      title = `تقرير لوحة التحكم — ${escape(userSettings.studioName)}`;
      downloadFilename = `LensFlow_لوحة_التحكم_${new Date().toISOString().slice(0, 10)}.html`;
      bodyContent = `
  <h1>${title}</h1>
  <p class="meta">تاريخ الاستخراج: ${escape(date)}</p>
  <h2>ملخص الأداء</h2>
  <div class="stats">
    <div class="stat">إجمالي الدخل <strong>${stats.totalIncome} د.إ</strong></div>
    <div class="stat">إجمالي المصاريف <strong>${stats.totalExpenses} د.إ</strong></div>
    <div class="stat">صافي الربح <strong>${stats.netProfit} د.إ</strong></div>
    <div class="stat">مشاريع نشطة <strong>${stats.active}</strong></div>
    <div class="stat">عدد المشاريع <strong>${projects.length}</strong></div>
    <div class="stat">عدد المعاملات <strong>${transactions.length}</strong></div>
    <div class="stat">عدد الأصول <strong>${assets.length}</strong></div>
  </div>`;
    } else if (activeTab === 'projects') {
      title = `تقرير المشاريع — ${escape(userSettings.studioName)}`;
      downloadFilename = `LensFlow_المشاريع_${new Date().toISOString().slice(0, 10)}.html`;
      bodyContent = `
  <h1>${title}</h1>
  <p class="meta">تاريخ الاستخراج: ${escape(date)}</p>
  <h2>قائمة المشاريع (${projects.length})</h2>
  <table><thead><tr><th>المشروع</th><th>العميل</th><th>الميزانية</th><th>المدفوع</th><th>الموعد</th><th>الحالة</th></tr></thead><tbody>${projRows || '<tr><td colspan="6">لا توجد مشاريع</td></tr>'}</tbody></table>`;
    } else if (activeTab === 'finances') {
      title = `تقرير المالية والحسابات — ${escape(userSettings.studioName)}`;
      downloadFilename = `LensFlow_المالية_${new Date().toISOString().slice(0, 10)}.html`;
      bodyContent = `
  <h1>${title}</h1>
  <p class="meta">تاريخ الاستخراج: ${escape(date)}</p>
  <h2>خلاصة الخزينة</h2>
  <div class="stats">
    <div class="stat">إجمالي الدخل <strong>${stats.totalIncome} د.إ</strong></div>
    <div class="stat">إجمالي المصاريف <strong>${stats.totalExpenses} د.إ</strong></div>
    <div class="stat">صافي الربح <strong>${stats.netProfit} د.إ</strong></div>
  </div>
  <h2>المعاملات المالية (${transactions.length})</h2>
  <table><thead><tr><th>الوصف</th><th>النوع</th><th>المبلغ</th><th>الفئة</th><th>التاريخ</th></tr></thead><tbody>${txRows || '<tr><td colspan="5">لا توجد معاملات</td></tr>'}</tbody></table>`;
    } else if (activeTab === 'assets') {
      const totalEq = assets.reduce((sum, a) => (conditionExcludedFromTotal(a.condition ?? '') ? sum : sum + (a.quantity ?? 1)), 0);
      const totalVal = assets.reduce((s, a) => s + (a.value || 0), 0);
      title = `تقرير الأصول — ${escape(userSettings.studioName)}`;
      downloadFilename = `LensFlow_الأصول_${new Date().toISOString().slice(0, 10)}.html`;
      bodyContent = `
  <h1>${title}</h1>
  <p class="meta">تاريخ الاستخراج: ${escape(date)}</p>
  <h2>ملخص الأصول</h2>
  <div class="stats">
    <div class="stat">إجمالي عدد المعدات <strong>${totalEq}</strong></div>
    <div class="stat">إجمالي القيمة المسجّلة <strong>${totalVal} د.إ</strong></div>
  </div>
  <h2>قائمة الأصول (${assets.length})</h2>
  <table><thead><tr><th>النوع</th><th>الاسم</th><th>الكمية</th><th>الماركة</th><th>الحالة</th><th>القيمة</th><th>تاريخ الشراء</th></tr></thead><tbody>${assetRows || '<tr><td colspan="7">لا توجد أصول</td></tr>'}</tbody></table>`;
    } else {
      title = `تقرير كامل — ${escape(userSettings.studioName)}`;
      downloadFilename = `LensFlow_تقرير_كامل_${new Date().toISOString().slice(0, 10)}.html`;
      bodyContent = `
  <h1>${title}</h1>
  <p class="meta">تاريخ الاستخراج: ${escape(date)}</p>
  <h2>ملخص لوحة التحكم</h2>
  <div class="stats">
    <div class="stat">إجمالي الدخل <strong>${stats.totalIncome} د.إ</strong></div>
    <div class="stat">إجمالي المصاريف <strong>${stats.totalExpenses} د.إ</strong></div>
    <div class="stat">صافي الربح <strong>${stats.netProfit} د.إ</strong></div>
    <div class="stat">مشاريع نشطة <strong>${stats.active}</strong></div>
  </div>
  <h2>المشاريع (${projects.length})</h2>
  <table><thead><tr><th>المشروع</th><th>العميل</th><th>الميزانية</th><th>المدفوع</th><th>الموعد</th><th>الحالة</th></tr></thead><tbody>${projRows || '<tr><td colspan="6">لا توجد مشاريع</td></tr>'}</tbody></table>
  <h2>المعاملات المالية (${transactions.length})</h2>
  <table><thead><tr><th>الوصف</th><th>النوع</th><th>المبلغ</th><th>الفئة</th><th>التاريخ</th></tr></thead><tbody>${txRows || '<tr><td colspan="5">لا توجد معاملات</td></tr>'}</tbody></table>
  <h2>الأصول (${assets.length})</h2>
  <table><thead><tr><th>النوع</th><th>الاسم</th><th>الكمية</th><th>الماركة</th><th>الحالة</th><th>القيمة</th><th>تاريخ الشراء</th></tr></thead><tbody>${assetRows || '<tr><td colspan="7">لا توجد أصول</td></tr>'}</tbody></table>`;
    }

    setReportModalData({ title, bodyContent, reportStyles, downloadFilename });
    setShowReportModal(true);
    } catch (err) {
      console.error('openReportModal', err);
      setToast({ message: 'حدث خطأ عند فتح التقرير. جرّب مرة أخرى.', type: 'error' });
    }
  };

  const reportPrint = () => {
    if (!reportModalData) return;
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8" /><title>${reportModalData.title}</title><style>${reportModalData.reportStyles}</style></head>
<body><div class="report-wrap">${reportModalData.bodyContent}</div></body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) {
      setToast({ message: 'الرجاء السماح بالنوافذ المنبثقة للطباعة.', type: 'error' });
      return;
    }
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      w.print();
      w.onafterprint = () => w.close();
    };
  };

  const reportDownload = () => {
    if (!reportModalData) return;
    const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8" /><title>${reportModalData.title}</title><style>${reportModalData.reportStyles}</style></head>
<body><div class="report-wrap">${reportModalData.bodyContent}</div></body>
</html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = reportModalData.downloadFilename;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'تم تحميل التقرير بنجاح.', type: 'success' });
  };

  const reportButtonLabel = activeTab === 'dashboard' ? 'تقرير لوحة التحكم' : activeTab === 'projects' ? 'تقرير المشاريع' : activeTab === 'finances' ? 'تقرير المالية' : activeTab === 'assets' ? 'تقرير الأصول' : 'تقرير كامل';

  if (isDbLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-slate-700 bg-gradient-to-br from-slate-100 via-white to-slate-50 p-8">
        <div className="glass-card p-10 rounded-3xl flex flex-col items-center animate-fade-in">
          <Loader2 className="animate-spin text-indigo-500 mb-6" size={52} />
          <h2 className="text-xl font-medium mb-1">LensFlow</h2>
          <p className="text-slate-500 text-sm mb-8">جاري تحميل البيانات...</p>
          <div className="flex gap-4 w-full max-w-2xl justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 flex-1 max-w-[180px] rounded-2xl bg-slate-200/60 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard staggerIndex={0} label="إجمالي الدخل" value={`${stats.totalIncome} د.إ`} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard staggerIndex={1} label="إجمالي المصاريف" value={`${stats.totalExpenses} د.إ`} icon={TrendingDown} color="bg-rose-500" />
        <StatCard staggerIndex={2} label="صافي الربح" value={`${stats.netProfit} د.إ`} icon={CheckCircle} color="bg-indigo-500" />
        <StatCard staggerIndex={3} label="مشاريع نشطة" value={stats.active} icon={Clock} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="glass-card p-6 rounded-2xl min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-medium text-slate-800 flex items-center gap-2 text-lg">
              <TrendingUp size={22} className="text-indigo-500" />
              تحليل الأداء المالي
            </h3>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-full">
              <Database size={12} />
              IndexedDB
            </div>
          </div>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={[
                { name: 'إيرادات', value: stats.totalIncome },
                { name: 'مصاريف', value: stats.totalExpenses },
                { name: 'أرباح', value: stats.netProfit },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.3)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13}} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'rgba(248,250,252,0.9)'}} contentStyle={{borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.08)'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={55}>
                  <Cell fill="#6366f1" />
                  <Cell fill="#f43f5e" />
                  <Cell fill="#10b981" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-card p-8 rounded-3xl flex flex-wrap justify-between items-center gap-6 border-white/50">
        <div className="flex items-center gap-6 text-slate-700">
           <div className="bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
              <Layers size={32} className="text-indigo-500" />
           </div>
           <div>
              <p className="font-medium text-lg">نظام الإدارة المهيكلة</p>
              <p className="text-sm text-slate-500 mt-0.5">كل بياناتك محفوظة محلياً وتعمل بدون إنترنت.</p>
           </div>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200/80 px-6 py-3 rounded-2xl text-sm font-medium text-indigo-600 hover:bg-white transition-all shadow-sm active:scale-[0.98]"
        >
          <Settings size={18} />
          تخصيص النظام
        </button>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="glass-card rounded-3xl overflow-hidden animate-slide-in-bottom">
      <div className="p-8 border-b border-white/40 flex flex-wrap justify-between items-center gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium text-slate-800">سجل المشاريع</h2>
          <div className="flex flex-wrap items-center gap-3 mt-3">
             <div className="relative flex-1 min-w-[200px] max-w-md">
               <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               <input
                 type="text"
                 value={searchProjects}
                 onChange={(e) => setSearchProjects(e.target.value)}
                 placeholder="بحث في المشاريع (العميل، الميزانية، الموعد...)"
                 className="w-full pr-10 pl-4 py-2.5 text-sm font-medium text-slate-700 bg-white/60 border border-slate-200/80 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
               />
             </div>
             <Filter size={16} className="text-slate-500 shrink-0" />
             <select 
                className="text-sm font-medium text-slate-700 bg-white/60 border border-slate-200/80 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
             >
                <option value="all">عرض الكل</option>
                <option value={ProjectStatus.UPCOMING}>مشاريع قادمة</option>
                <option value={ProjectStatus.IN_PROGRESS}>قيد التنفيذ</option>
                <option value={ProjectStatus.OVERDUE}>مشاريع متأخرة ⚠️</option>
                <option value={ProjectStatus.DELIVERED}>مشاريع منتهية</option>
             </select>
          </div>
        </div>
        <button 
          onClick={() => setShowProjectModal(true)}
          className="flex items-center gap-3 bg-indigo-600 text-white px-7 py-3.5 rounded-2xl text-[15px] font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] shrink-0"
        >
          <Plus size={22} />
          مشروع إبداعي جديد
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-white/50 text-slate-500 text-[13px] uppercase tracking-wider font-medium backdrop-blur-sm">
            <tr>
              <th className="px-8 py-5">المشروع / العميل</th>
              <th className="px-8 py-5">الميزانية الكلية</th>
              <th className="px-8 py-5">المدفوع / المتبقي</th>
              <th className="px-8 py-5">الموعد</th>
              <th className="px-8 py-5">الحالة</th>
              <th className="px-8 py-5 text-center">أدوات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[15px]">
            {filteredProjects.length === 0 ? (
              <tr><td colSpan={6} className="px-8 py-16 text-center text-slate-400 font-black text-lg">{projects.length === 0 ? 'لا توجد سجلات حالياً.' : 'لا توجد نتائج تطابق البحث.'}</td></tr>
            ) : filteredProjects.map(project => {
              const remaining = project.budget - (project.paidAmount || 0);
              const isPaidFull = remaining <= 0;
              return (
                <tr id={`project-row-${project.id}`} key={project.id} className={`hover:bg-white/50 transition-all group ${project.status === ProjectStatus.OVERDUE ? 'bg-rose-500/5' : ''} ${notificationFocusProjectId === project.id ? 'ring-2 ring-indigo-400 ring-offset-2 rounded-lg' : ''}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      {project.status === ProjectStatus.OVERDUE && <AlertTriangle size={16} className="text-rose-500 animate-pulse" />}
                      <div>
                        <div className={`font-black text-base ${project.status === ProjectStatus.OVERDUE ? 'text-rose-700' : 'text-slate-900'}`}>{project.title}</div>
                        <div className="text-sm text-slate-500 font-bold mt-0.5">{project.client}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 font-black text-slate-700 text-base">{project.budget} د.إ</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-emerald-600 font-black text-xs">
                        <CheckCircle size={12} /> المدفوع: {project.paidAmount || 0}
                      </div>
                      <div className={`flex items-center gap-2 font-black text-xs ${isPaidFull ? 'text-slate-400' : 'text-rose-500'}`}>
                        {isPaidFull ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                        {isPaidFull ? 'تم السداد' : `المتبقي: ${remaining}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-slate-500 font-black">
                    <span className={new Date(project.deadline) < new Date() && project.status !== ProjectStatus.DELIVERED ? 'text-rose-500 font-black flex items-center gap-1' : ''}>
                      {formatDeadline(project.deadline)}
                      {new Date(project.deadline) < new Date() && project.status !== ProjectStatus.DELIVERED && <Clock size={14} />}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <select 
                      value={project.status}
                      onChange={(e) => updateProjectStatus(project.id, e.target.value as ProjectStatus)}
                      className={`px-4 py-2 rounded-xl text-xs font-black border-none outline-none cursor-pointer transition-all ${
                        project.status === ProjectStatus.DELIVERED ? 'bg-emerald-50 text-emerald-600' :
                        project.status === ProjectStatus.OVERDUE ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        project.status === ProjectStatus.IN_PROGRESS ? 'bg-amber-50 text-amber-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      <option value={ProjectStatus.UPCOMING}>قادم</option>
                      <option value={ProjectStatus.IN_PROGRESS}>جاري العمل</option>
                      <option value={ProjectStatus.OVERDUE}>متأخر ⚠️</option>
                      <option value={ProjectStatus.DELIVERED}>تم التسليم</option>
                    </select>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => {
                          setNewTransaction({ ...newTransaction, type: TransactionType.INCOME, projectId: project.id, amount: remaining > 0 ? remaining : 0, description: `دفعة مشروع: ${project.title}` });
                          setShowTransactionModal(true);
                        }}
                        className="p-3 text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
                        title="تسجيل دفعة جديدة"
                      >
                        <Banknote size={20} />
                      </button>
                      <button 
                        onClick={() => deleteProject(project.id)} 
                        className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFinances = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-scale-in">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <h2 className="text-2xl font-medium text-slate-800">سجل الحسابات</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] max-w-sm">
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchFinances}
                  onChange={(e) => setSearchFinances(e.target.value)}
                  placeholder="بحث (الوصف، الفئة، المبلغ، المشروع...)"
                  className="w-full pr-10 pl-4 py-2.5 text-sm font-medium text-slate-700 bg-white/60 border border-slate-200/80 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
                />
              </div>
              <button 
                onClick={() => setShowTransactionModal(true)}
                className="text-indigo-600 font-medium text-sm bg-indigo-500/10 px-6 py-3 rounded-2xl hover:bg-indigo-500/20 transition-all border border-indigo-200/50 shrink-0"
              >
                + إضافة عملية مالية
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
               <div className="text-center py-20 text-slate-500 text-lg">{transactions.length === 0 ? 'لا توجد عمليات مسجلة.' : 'لا توجد نتائج تطابق البحث.'}</div>
            ) : filteredTransactions.map(t => {
              const linkedProject = projects.find(p => p.id === t.projectId);
              const CategoryIcon = getCategoryIcon(t.category);
              
              return (
                <div key={t.id} className="flex items-center justify-between p-5 bg-white/50 rounded-2xl border border-white/60 hover:bg-white/70 transition-all group backdrop-blur-sm">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      <CategoryIcon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-base">{t.description}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1 uppercase tracking-wider">
                        <span className="text-[11px] text-slate-500 font-black">{t.date} • {t.category}</span>
                        {linkedProject && (
                          <span className="flex items-center gap-1.5 text-[11px] font-black text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100">
                            <Briefcase size={10} />
                            {linkedProject.title}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-black text-xl ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount} د.إ
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => openEditTransaction(t)} 
                        className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="تعديل"
                      >
                        <Pencil size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTransaction(t.id)} 
                        className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="حذف"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="glass-card p-8 rounded-3xl h-fit sticky top-24">
        <h3 className="font-medium text-slate-800 text-lg mb-6 pb-4 border-b border-white/50">خلاصة الخزينة</h3>
        <div className="space-y-4">
           <div className="flex justify-between items-center p-5 bg-emerald-500/10 rounded-2xl border border-emerald-200/50 backdrop-blur-sm">
              <span className="text-[13px] font-medium text-emerald-700">الدخل المكتسب</span>
              <span className="font-medium text-emerald-600 text-xl">{stats.totalIncome} د.إ</span>
           </div>
           <div className="flex justify-between items-center p-5 bg-rose-500/10 rounded-2xl border border-rose-200/50 backdrop-blur-sm">
              <span className="text-[13px] font-medium text-rose-700">إجمالي التكاليف</span>
              <span className="font-medium text-rose-600 text-xl">{stats.totalExpenses} د.إ</span>
           </div>
           <div className="pt-4 border-t border-white/50 mt-2">
              <div className="flex justify-between items-center px-2">
                <span className="font-medium text-slate-600 text-base">الربح المتبقي</span>
                <span className="text-2xl font-medium text-indigo-600">{stats.netProfit} د.إ</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const ASSET_TYPES = ['Camera', 'Lens', 'Battery', 'Lights', 'Monitor', 'Accessories', 'Microphone', 'Drone', 'Storage', 'Drone Accessories', 'Telepromter', 'Laptop', 'ipad', 'iphone', 'Keyboard', 'Mouse'];
  const ASSET_CONDITIONS = ['جيد', 'عادي', 'مفقود', 'مرتجع', 'يصل قريباً'];

  const conditionExcludedFromTotal = (c: string) => {
    const t = (c ?? '').trim();
    return t === 'مرتجع' || t === 'مفقود' || t === 'يصل قريباً' ||
      /missing|messing|arriving\s*soon/i.test(t);
  };

  const totalEquipmentQuantity = assets.reduce(
    (sum, a) => (conditionExcludedFromTotal(a.condition ?? '') ? sum : sum + (a.quantity ?? 1)),
    0
  );
  const totalAssetsValue = assets.reduce((sum, a) => sum + (a.value || 0), 0);

  const getAssetRowBg = (condition: string) => {
    const c = (condition ?? '').trim();
    if (c === 'مرتجع') return 'bg-amber-50 border-r-4 border-amber-400';
    if (c === 'مفقود' || /missing|messing/i.test(c)) return 'bg-rose-50 border-r-4 border-rose-400';
    if (c === 'يصل قريباً' || /arriving\s*soon/i.test(c)) return 'bg-emerald-50 border-r-4 border-emerald-400';
    return '';
  };

  const mapConditionToArabic = (en: string): string => {
    const t = (en ?? '').trim().toLowerCase();
    if (t === 'good') return 'جيد';
    if (t === 'normal') return 'عادي';
    if (t === 'missing' || t === 'messing') return 'مفقود';
    if (t === 'arriving soon') return 'يصل قريباً';
    const trimmed = (en ?? '').trim();
    if (['جيد', 'عادي', 'مفقود', 'مرتجع', 'يصل قريباً'].includes(trimmed)) return trimmed;
    return trimmed || 'جيد';
  };

  const displayCondition = (c: string): string => mapConditionToArabic(c);

  const renderAssets = () => (
    <div className="glass-card rounded-3xl overflow-hidden animate-slide-in-bottom">
      <div className="p-8 border-b border-white/40 flex flex-wrap justify-between items-center gap-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-medium text-slate-800">قائمة الأصول — My Gears</h2>
          <p className="text-slate-500 text-sm mt-1">معدات الاستوديو والأجهزة (النوع، الاسم، الكمية، الماركة، الحالة)</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] max-w-md flex-1">
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchAssets}
                onChange={(e) => setSearchAssets(e.target.value)}
                placeholder="بحث في الأصول (الاسم، النوع، الماركة، الحالة، القيمة...)"
                className="w-full pr-10 pl-4 py-2.5 text-sm font-medium text-slate-700 bg-white/60 border border-slate-200/80 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
              />
            </div>
            <Filter size={16} className="text-slate-500 shrink-0" />
            <select
              value={filterAssetCategory}
              onChange={(e) => setFilterAssetCategory(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-white/60 border border-slate-200/80 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
            >
              <option value="all">كل الأنواع</option>
              {ASSET_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={filterAssetCondition}
              onChange={(e) => setFilterAssetCondition(e.target.value)}
              className="text-sm font-medium text-slate-700 bg-white/60 border border-slate-200/80 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
            >
              <option value="all">كل الحالات</option>
              {ASSET_CONDITIONS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        {!isStaff && (
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={importMyGears}
            className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-3 rounded-2xl text-sm font-medium hover:bg-emerald-700 transition-all active:scale-[0.98]"
          >
            <Package size={20} />
            استيراد قائمة My Gears
          </button>
          <button
            type="button"
            onClick={() => { resetAssetForm(); setShowAssetModal(true); }}
            className="flex items-center gap-3 bg-indigo-600 text-white px-7 py-3.5 rounded-2xl text-[15px] font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
          >
            <Plus size={22} />
            إضافة أصل
          </button>
        </div>
        )}
      </div>
      <div className="px-8 py-6 border-b border-white/40 bg-slate-50/50">
        <div className="flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm min-w-[220px]">
            <div className="p-2.5 rounded-xl bg-indigo-100">
              <Package size={24} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">إجمالي عدد المعدات</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{totalEquipmentQuantity}</p>
              <p className="text-slate-400 text-xs mt-0.5">مجموع الكمية (المرتجع والمفقود ويصل قريباً لا تُحسب)</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm min-w-[220px]">
            <div className="p-2.5 rounded-xl bg-emerald-100">
              <Wallet size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">إجمالي القيمة المسجّلة</p>
              <p className="text-2xl font-bold text-slate-800 mt-0.5">{totalAssetsValue} د.إ</p>
              <p className="text-slate-400 text-xs mt-0.5">قيمة الأصول بالدرهم</p>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-white/50 text-slate-500 text-[13px] uppercase tracking-wider font-medium backdrop-blur-sm">
            <tr>
              <th className="px-6 py-5">النوع</th>
              <th className="px-6 py-5">الاسم</th>
              <th className="px-6 py-5 text-center">الكمية</th>
              <th className="px-6 py-5">الماركة</th>
              <th className="px-6 py-5">الحالة</th>
              <th className="px-6 py-5">القيمة (د.إ)</th>
              <th className="px-6 py-5">تاريخ الشراء</th>
              {!isStaff && <th className="px-6 py-5 text-center">أدوات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[15px]">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={isStaff ? 7 : 8} className="px-8 py-16 text-center text-slate-400 font-medium text-lg">{assets.length === 0 ? 'لا توجد أصول مسجّلة.' : 'لا توجد نتائج تطابق البحث.'}</td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr key={asset.id} className={`transition-all group ${getAssetRowBg(asset.condition ?? '') || 'hover:bg-white/50'}`}>
                  <td className="px-6 py-5 text-slate-600">{asset.category}</td>
                  <td className="px-6 py-5 font-medium text-slate-900">{asset.name}</td>
                  <td className="px-6 py-5 text-center font-medium text-slate-700">{asset.quantity ?? 1}</td>
                  <td className="px-6 py-5 text-slate-600">{asset.brand ?? '—'}</td>
                  <td className="px-6 py-5 font-medium text-slate-600">{displayCondition(asset.condition ?? '') || '—'}</td>
                  <td className="px-6 py-5 font-medium text-slate-800">{asset.value ? `${asset.value} د.إ` : '—'}</td>
                  <td className="px-6 py-5 text-slate-500">{asset.purchaseDate ? formatAssetDate(asset.purchaseDate) : '—'}</td>
                  {!isStaff && (
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button type="button" onClick={() => openEditAsset(asset)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="تعديل"><Pencil size={20} /></button>
                      <button type="button" onClick={() => setAssetToDelete(asset.id)} className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="حذف"><Trash2 size={20} /></button>
                    </div>
                  </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} studioName={userSettings.studioName} studioImageUrl={userSettings.studioImageUrl || undefined} hideSettings={isStaff} />

      <main className="mr-64 p-8 lg:p-12 transition-all duration-300">
        <header className="glass-header relative z-50 flex justify-between items-center mb-12 rounded-2xl px-8 py-6 -mx-2 lg:-mx-4">
          <div className="animate-slide-in-right flex flex-col gap-4">
            {userSettings.studioImageUrl && activeTab !== 'settings' && (
              <img src={userSettings.studioImageUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-white/60 shadow-md" />
            )}
            <div>
              <h2 className="text-[42px] font-black text-slate-900 tracking-tight leading-none">
                {activeTab === 'dashboard' && userSettings.studioName}
                {activeTab === 'projects' && 'المشاريع'}
                {activeTab === 'finances' && 'المالية والحسابات'}
                {activeTab === 'assets' && 'الأصول'}
                {activeTab === 'settings' && 'الإعدادات والتحكم'}
              </h2>
              <p className="text-slate-500 mt-4 font-black text-xl opacity-80 min-h-[2.5rem] flex items-center">
                {activeTab === 'dashboard' && (
                  <>
                    <span>{WELCOME_TEXT.slice(0, welcomeTypingIndex)}</span>
                    {welcomeTypingIndex < WELCOME_TEXT.length && (
                      <span className="inline-block w-0.5 h-6 bg-indigo-500 mr-0.5 animate-pulse align-middle" aria-hidden style={{ animationDuration: '0.8s' }} />
                    )}
                  </>
                )}
                {activeTab === 'projects' && 'تتبع مشاريعك ومواعيد التسليم والعملاء.'}
                {activeTab === 'finances' && 'سجّل الدخل والمصروفات واربطها بالمشاريع.'}
                {activeTab === 'assets' && 'سجّل معداتك وأصول الاستوديو.'}
                {activeTab === 'settings' && 'خصص واجهتك وأدر بياناتك بكل سهولة.'}
              </p>
            </div>
          </div>
          
          <div className="relative z-[100] flex items-center gap-4">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); openReportModal(); }}
              className="p-4 glass-card rounded-2xl text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-2 cursor-pointer"
              title={reportButtonLabel}
              aria-label={reportButtonLabel}
            >
              <FileText size={24} />
              <span className="font-medium text-sm hidden sm:inline">{reportButtonLabel}</span>
            </button>
            <div ref={notificationsAreaRef} className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-4 glass-card rounded-2xl text-slate-500 hover:text-indigo-600 transition-all relative"
              >
                <Bell size={24} />
                {stats.unreadNotifications > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-medium flex items-center justify-center rounded-full border-2 border-white">
                    {stats.unreadNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="glass-dropdown absolute left-0 mt-3 w-80 rounded-2xl z-[9999] overflow-hidden animate-scale-in top-full shadow-2xl ring-2 ring-white/50">
                <div className="p-5 border-b border-white/40 flex justify-between items-center">
                  <h4 className="font-medium text-slate-800">تنبيهات المواعيد</h4>
                  <button onClick={() => setShowNotifications(false)}><X size={16} className="text-slate-400" /></button>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 text-sm font-bold">لا توجد تنبيهات حالياً</div>
                  ) : notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => handleNotificationClick(n)}
                      className={`p-5 border-b border-white/30 transition-all cursor-pointer hover:bg-white/50 ${n.isRead ? 'opacity-60' : 'bg-indigo-500/5'}`}
                    >
                      <div className="flex items-start gap-3">
                        <AlertCircle size={20} className={n.isRead ? 'text-slate-300' : 'text-amber-500'} />
                        <div>
                          <p className="font-black text-slate-900 text-sm">{n.title}</p>
                          <p className="text-xs text-slate-600 font-bold mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[10px] text-slate-400 font-black mt-2">{new Date(n.date).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'projects' && renderProjects()}
        {activeTab === 'finances' && renderFinances()}
        {activeTab === 'assets' && renderAssets()}
        
        {activeTab === 'settings' && !isStaff && (
          <div className="max-w-4xl space-y-8 animate-slide-in-top pb-20">
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-white/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
                    <User size={24} />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">إعدادات الهوية والمظهر</h2>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                >
                  {isSavingSettings ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  حفظ التغييرات
                </button>
              </div>
              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">اسم الاستوديو</label>
                    <input 
                      value={editSettings.studioName}
                      onChange={(e) => setEditSettings({ ...editSettings, studioName: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                      placeholder="الاسم التجاري للاستوديو"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">الاسم الاحترافي</label>
                    <input 
                      value={editSettings.userName}
                      onChange={(e) => setEditSettings({ ...editSettings, userName: e.target.value })}
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-base font-black text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
                      placeholder="الاسم الاحترافي أو اللقب الفني"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">صورة الاستوديو / الشعار</label>
                  <div className="flex flex-wrap items-center gap-6">
                    {editSettings.studioImageUrl ? (
                      <>
                        <div className="relative">
                          <img src={editSettings.studioImageUrl} alt="شعار الاستوديو" className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-md" />
                          <button
                            type="button"
                            onClick={() => setEditSettings({ ...editSettings, studioImageUrl: '' })}
                            className="absolute -top-2 -left-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                            title="إزالة الصورة"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="text-slate-500 text-sm">تم اختيار صورة. احفظ التغييرات لتطبيقها.</p>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 cursor-pointer hover:bg-slate-100 hover:border-indigo-300 transition-all">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            if (file.size > 1024 * 1024) {
                              setToast({ message: 'حجم الصورة يجب أن يكون أقل من 1 ميجابايت', type: 'error' });
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = () => setEditSettings({ ...editSettings, studioImageUrl: reader.result as string });
                            reader.readAsDataURL(file);
                          }}
                        />
                        <ImagePlus size={28} className="text-slate-400 mb-1" />
                        <span className="text-[10px] font-medium text-slate-500">إضافة صورة</span>
                      </label>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs">يُظهر الشعار بجانب اسم الاستوديو في الرأس. الحجم الأقصى 1 ميجابايت.</p>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                   <label className="text-xs font-black text-slate-500 uppercase tracking-widest mr-1">لون السمة الرئيسي</label>
                   <div className="flex flex-wrap gap-3">
                     {PREDEFINED_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditSettings({ ...editSettings, primaryColor: color })}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                             editSettings.primaryColor === color 
                             ? 'ring-2 ring-offset-2 ring-slate-300 scale-110 shadow-md' 
                             : 'hover:scale-105 hover:shadow-sm'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        >
                          {editSettings.primaryColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                        </button>
                     ))}
                     <div className="relative group">
                         <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all hover:shadow-sm">
                            <Palette size={18} />
                         </button>
                         <input 
                            type="color"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            value={editSettings.primaryColor}
                            onChange={(e) => setEditSettings({ ...editSettings, primaryColor: e.target.value })}
                         />
                     </div>
                   </div>
                </div>

              </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-white/40 flex items-center gap-4">
                <div className="p-3 bg-violet-100 text-violet-600 rounded-2xl">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">المستخدمون والصلاحيات</h3>
                  <p className="text-slate-500 text-sm mt-0.5">إضافة مستخدمين محليين وتحديد صلاحياتهم (مدير كامل أو موظف)</p>
                </div>
              </div>
              <div className="p-8 md:p-10 space-y-10">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-x-6 gap-y-5">
                    <div className="md:col-span-4 space-y-2">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">اسم المستخدم</label>
                      <input
                        value={newUserUsername}
                        onChange={(e) => setNewUserUsername(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-base font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-200 transition-all"
                        placeholder="اسم الدخول"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">كلمة المرور</label>
                      <input
                        type="password"
                        value={newUserPassword}
                        onChange={(e) => setNewUserPassword(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-base font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-200 transition-all"
                        placeholder="4 أحرف على الأقل"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">الصلاحية</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as LocalRole)}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-base font-medium text-slate-900 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-200 cursor-pointer transition-all"
                      >
                        <option value="admin">مدير كامل</option>
                        <option value="staff">موظف</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <button
                      type="button"
                      disabled={isAddingUser}
                      onClick={async () => {
                        if (!newUserUsername.trim()) {
                          setToast({ message: 'أدخل اسم المستخدم.', type: 'error' });
                          return;
                        }
                        setIsAddingUser(true);
                        const result = await authService.addLocalUser(newUserUsername.trim(), newUserPassword, newUserRole);
                        setIsAddingUser(false);
                        if (result.ok) {
                          setNewUserUsername('');
                          setNewUserPassword('');
                          setToast({ message: 'تمت إضافة المستخدم بنجاح.', type: 'success' });
                          setLocalUsersVersion((v) => v + 1);
                        } else {
                          setToast({ message: result.error ?? 'فشل الإضافة', type: 'error' });
                        }
                      }}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50"
                    >
                      {isAddingUser ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                      إضافة مستخدم جديد
                    </button>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-8">
                  <h4 className="text-sm font-black text-slate-600 mb-4">قائمة المستخدمين</h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 font-black text-slate-600">المستخدم</th>
                          <th className="px-6 py-4 font-black text-slate-600">الصلاحية</th>
                          <th className="px-6 py-4 font-black text-slate-600 w-32 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {authService.getPredefinedAccounts().map(({ username, role }) => (
                          <tr key={username} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-900">{username}</td>
                            <td className="px-6 py-4">
                              {username === 'Admin' ? (
                                <span className="text-indigo-600 font-bold">مدير كامل</span>
                              ) : (
                                <select
                                  id={`predefined-role-${username}`}
                                  value={role}
                                  onChange={(e) => {
                                    const newRole = e.target.value as LocalRole;
                                    authService.setPredefinedRoleOverride(username, newRole);
                                    setToast({ message: 'تم تحديث الصلاحية. سيُطبّق عند تسجيل الدخول التالي للمستخدم.', type: 'success' });
                                    setLocalUsersVersion((v) => v + 1);
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-300"
                                >
                                  <option value="admin">مدير كامل</option>
                                  <option value="staff">موظف</option>
                                </select>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {username === 'Admin' ? (
                                <span className="text-slate-400 text-sm">—</span>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`predefined-role-${username}`)?.focus()}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    title="تعديل الصلاحية"
                                  >
                                    <Pencil size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const result = await authService.removeLocalUser(username);
                                      if (!result.ok) setToast({ message: result.error ?? 'فشل الحذف', type: 'error' });
                                    }}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    title="حذف (الحساب الثابت لا يُحذف)"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {authService.getLocalUsers().map(({ username, role }) => {
                          const isCurrent = authService.getCurrentUsername() === username;
                          return (
                            <tr key={username} className="hover:bg-slate-50/50">
                              <td className="px-6 py-4 font-medium text-slate-900">{username}{isCurrent && <span className="mr-2 text-xs text-indigo-600">(أنت)</span>}</td>
                              <td className="px-6 py-4">
                                <select
                                  id={`role-select-${username}`}
                                  value={role}
                                  onChange={async (e) => {
                                    const newRole = e.target.value as LocalRole;
                                    const result = await authService.updateLocalUserRole(username, newRole);
                                    if (result.ok) {
                                      setToast({ message: 'تم تحديث الصلاحية.', type: 'success' });
                                      setLocalUsersVersion((v) => v + 1);
                                    } else {
                                      setToast({ message: result.error ?? 'فشل التحديث', type: 'error' });
                                    }
                                  }}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 cursor-pointer outline-none focus:ring-2 focus:ring-indigo-300"
                                >
                                  <option value="admin">مدير كامل</option>
                                  <option value="staff">موظف</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`role-select-${username}`)?.focus()}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                    title="تعديل الصلاحية"
                                  >
                                    <Pencil size={18} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isCurrent}
                                    onClick={async () => {
                                      if (isCurrent) return;
                                      const result = await authService.removeLocalUser(username);
                                      if (result.ok) {
                                        setToast({ message: 'تم حذف المستخدم.', type: 'success' });
                                        setLocalUsersVersion((v) => v + 1);
                                      } else {
                                        setToast({ message: result.error ?? 'فشل الحذف', type: 'error' });
                                      }
                                    }}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    title={isCurrent ? 'لا يمكن حذف المستخدم الحالي' : 'حذف المستخدم'}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-slate-400 text-xs mt-3">مدير كامل: صلاحيات كاملة بما فيها الإعدادات والحذف. موظف: عرض وتشغيل فقط بدون تبويب الإعدادات وتعديل/حذف الأصول.</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-8 border-b border-white/40 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">ملف التخزين على جهازك</h3>
                  <p className="text-slate-500 text-sm mt-0.5">تصدير أو استيراد نسخة كاملة (بيانات + ملحقات) في ملف واحد</p>
                </div>
              </div>
              <div className="p-8 flex flex-wrap gap-4 items-center">
                <button
                  type="button"
                  onClick={() => localDatabase.exportFullBackup()}
                  className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-medium hover:bg-emerald-700 transition-all shadow-md"
                >
                  <Database size={20} />
                  تصدير نسخة كاملة (بيانات + ملحقات)
                </button>
                <label className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3.5 rounded-2xl font-medium hover:bg-slate-200 transition-all cursor-pointer border border-slate-200">
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const result = await localDatabase.importFromFile(file);
                      e.target.value = '';
                      if (result.ok) {
                        setToast({ message: 'تم استيراد الملف بنجاح. جاري إعادة التحميل...', type: 'success' });
                        setTimeout(() => window.location.reload(), 800);
                      } else {
                        setToast({ message: result.error ?? 'فشل الاستيراد', type: 'error' });
                      }
                    }}
                  />
                  استيراد من ملف
                </label>
              </div>
            </div>

            <div className="glass-card p-10 rounded-3xl border-rose-200/50 flex justify-between items-center bg-rose-500/5">
               <div><h3 className="font-medium text-rose-900 text-xl">إعادة ضبط المصنع</h3><p className="text-rose-600 text-sm mt-1">سيتم حذف كافة البيانات المحلية والملحقات نهائياً.</p></div>
               <button onClick={() => { setPendingDelete({ type: 'clearAll' }); setShowAdminAuthModal(true); }} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-medium hover:bg-rose-700 transition-all shadow-lg">حذف كل البيانات</button>
            </div>
          </div>
        )}
      </main>

      {/* --- Modals Render Section --- */}
      
      {showProjectModal && (
        <Modal title="تسجيل مشروع جديد" subtitle="أضف تفاصيل مشروعك في خطوات بسيطة" onClose={() => setShowProjectModal(false)}>
          <form onSubmit={handleAddProject} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">مسمى المشروع</label>
              <input 
                required 
                autoFocus
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400" 
                placeholder="مثال: جلسة تصوير منتجات — حفل زفاف" 
                value={newProject.title}
                onChange={e => setNewProject({...newProject, title: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">اسم العميل</label>
              <input 
                required 
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400" 
                placeholder="اسم العميل أو الجهة الطالبة" 
                value={newProject.client}
                onChange={e => setNewProject({...newProject, client: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">نوع الخدمة</label>
                <select 
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all cursor-pointer" 
                  value={newProject.type}
                  onChange={e => setNewProject({...newProject, type: e.target.value as ProjectType})}
                >
                  <option value={ProjectType.PHOTOGRAPHY}>تصوير فوتوغرافي</option>
                  <option value={ProjectType.EDITING}>مونتاج فيديو</option>
                  <option value={ProjectType.FULL_SERVICE}>تصوير ومونتاج</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">الميزانية (د.إ)</label>
                <input 
                  required 
                  type="text"
                  inputMode="decimal"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400" 
                  placeholder="الميزانية بالدرهم (عربي أو إنجليزي)" 
                  value={newProject.budget || ''}
                  onChange={e => setNewProject({...newProject, budget: parseAmountFromInput(e.target.value)})} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">الدفعة المدفوعة مقدماً (د.إ)</label>
              <input 
                type="text"
                inputMode="decimal"
                className="w-full bg-emerald-50/80 border border-emerald-200 rounded-2xl px-5 py-3.5 text-base text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all placeholder:text-emerald-500" 
                placeholder="الدفعة الأولى إن وُجدت (اختياري)" 
                value={newProject.initialPaid || ''}
                onChange={e => setNewProject({...newProject, initialPaid: parseAmountFromInput(e.target.value)})} 
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">تاريخ التسليم المتوقع</label>
              <button 
                type="button"
                onClick={() => setShowCalendar(true)}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 flex justify-between items-center hover:border-indigo-300 hover:bg-slate-50 transition-all group"
              >
                <span className={`text-base ${newProject.deadline ? 'text-slate-800' : 'text-slate-400'}`}>
                  {newProject.deadline ? formatDeadline(newProject.deadline) : 'اختر التاريخ من التقويم'}
                </span>
                <CalendarDays className="text-slate-400 group-hover:text-indigo-500 transition-colors" size={22} />
              </button>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-base font-medium mt-4 hover:bg-indigo-700 transition-all active:scale-[0.99] shadow-lg shadow-indigo-200/50">
              حفظ المشروع
            </button>
          </form>
        </Modal>
      )}

      {/* نافذة اختيار التاريخ المنبثقة */}
      {showCalendar && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm">
            <CustomCalendar 
              selectedDate={newProject.deadline} 
              onSelect={(date) => {
                setNewProject({...newProject, deadline: date});
                setShowCalendar(false);
              }} 
              onClose={() => setShowCalendar(false)} 
            />
          </div>
        </div>
      )}

      {showTransactionModal && (
        <Modal title={editingTransactionId ? "تعديل عملية مالية" : "إضافة عملية مالية"} subtitle={editingTransactionId ? "تعديل التفاصيل ثم الحفظ" : "سجّل دخول أو مصروف مرتبط بمشروعك"} onClose={() => { setShowTransactionModal(false); resetTransactionForm(); }}>
          <form onSubmit={handleSaveTransaction} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">وصف العملية</label>
              <input 
                required 
                autoFocus
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400" 
                placeholder="مثال: شراء كارت ذاكرة — دفعة مشروع تصوير" 
                value={newTransaction.description}
                onChange={e => setNewTransaction({...newTransaction, description: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">المبلغ (د.إ)</label>
                <input 
                  required 
                  type="text"
                  inputMode="decimal"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400" 
                  placeholder="المبلغ بالدرهم (عربي أو إنجليزي)" 
                  value={newTransaction.amount || ''}
                  onChange={e => setNewTransaction({...newTransaction, amount: parseAmountFromInput(e.target.value)})} 
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">نوع المعاملة</label>
                <select 
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all cursor-pointer" 
                  value={newTransaction.type}
                  onChange={e => setNewTransaction({...newTransaction, type: e.target.value as TransactionType})}
                >
                  <option value={TransactionType.INCOME}>أرباح / دخل (+)</option>
                  <option value={TransactionType.EXPENSE}>تكاليف / مصروف (-)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">المشروع المرتبط</label>
              <select 
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all cursor-pointer" 
                value={newTransaction.projectId}
                onChange={e => setNewTransaction({...newTransaction, projectId: e.target.value})}
              >
                <option value="">لا يوجد مشروع مرتبط</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              {newTransaction.projectId && (
                <p className="mt-1.5 text-xs text-indigo-600">
                  {newTransaction.type === TransactionType.INCOME 
                    ? 'سيُضاف المبلغ إلى "المدفوع" في المشروع.' 
                    : 'سيُخصم المبلغ من ميزانية المشروع.'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">التصنيف</label>
              <input 
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 transition-all placeholder:text-slate-400" 
                placeholder="مثال: معدات — تسويق — تنقل — رواتب" 
                value={newTransaction.category}
                onChange={e => setNewTransaction({...newTransaction, category: e.target.value})} 
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-base font-medium mt-4 hover:bg-indigo-700 transition-all active:scale-[0.99] shadow-lg shadow-indigo-200/50">
              {editingTransactionId ? 'حفظ التعديلات' : 'حفظ المعاملة'}
            </button>
          </form>
        </Modal>
      )}

      {/* Modals for Deletion Confirmation */}
      {projectToDelete && (
        <Modal title="حذف المشروع" subtitle="لا يمكن التراجع بعد الحذف" onClose={() => setProjectToDelete(null)}>
           <div className="space-y-5">
            <div className="bg-rose-50/80 p-4 rounded-2xl flex items-center gap-4 text-rose-700 border border-rose-100">
               <div className="bg-rose-100/80 p-2.5 rounded-xl shrink-0">
                 <AlertTriangle size={22} />
               </div>
               <div>
                 <p className="text-sm font-medium">هل أنت متأكد من حذف هذا المشروع وجميع البيانات المرتبطة به؟</p>
               </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={confirmDeleteProject}
                className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 transition-all"
              >
                نعم، احذف
              </button>
              <button 
                onClick={() => setProjectToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}

      {transactionToDelete && (
        <Modal title="حذف عملية مالية" subtitle="لا يمكن التراجع بعد الحذف" onClose={() => setTransactionToDelete(null)}>
          <div className="space-y-5">
            <div className="bg-rose-50/80 p-4 rounded-2xl flex items-center gap-4 text-rose-700 border border-rose-100">
               <div className="bg-rose-100/80 p-2.5 rounded-xl shrink-0">
                 <AlertTriangle size={22} />
               </div>
               <p className="text-sm font-medium">هل أنت متأكد من حذف هذه المعاملة المالية؟</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={confirmDeleteTransaction}
                className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 transition-all"
              >
                نعم، احذف
              </button>
              <button 
                onClick={() => setTransactionToDelete(null)}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showAssetModal && (
        <Modal title={editingAssetId ? 'تعديل الأصل' : 'إضافة أصل جديد'} subtitle="مطابق لجدول My Gears" onClose={() => { setShowAssetModal(false); resetAssetForm(); }}>
          <form onSubmit={handleSaveAsset} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">النوع (Type)</label>
              <select
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
                value={newAsset.category}
                onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
              >
                {ASSET_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">الاسم (Name)</label>
              <input
                required
                autoFocus
                type="text"
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
                placeholder="مثال: Camera A7IV Body"
                value={newAsset.name}
                onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">الكمية (Quantity)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
                  placeholder="1"
                  value={newAsset.quantity ?? ''}
                  onChange={e => setNewAsset({ ...newAsset, quantity: Math.max(0, parseAmountFromInput(e.target.value)) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">الماركة (Brand)</label>
                <input
                  type="text"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
                  placeholder="Sony, Godox, Apple..."
                  value={newAsset.brand}
                  onChange={e => setNewAsset({ ...newAsset, brand: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">الحالة</label>
              <select
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer"
                value={newAsset.condition}
                onChange={e => setNewAsset({ ...newAsset, condition: e.target.value })}
              >
                <option value="جيد">جيد</option>
                <option value="عادي">عادي</option>
                <option value="مفقود">مفقود</option>
                <option value="مرتجع">مرتجع</option>
                <option value="يصل قريباً">يصل قريباً</option>
              </select>
              <p className="text-slate-400 text-xs mt-1">مرتجع (أصفر) — مفقود (أحمر) — يصل قريباً (أخضر) لا تدخل في إجمالي المعدات</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">القيمة (د.إ) — اختياري</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
                  placeholder="0"
                  value={newAsset.value || ''}
                  onChange={e => setNewAsset({ ...newAsset, value: parseAmountFromInput(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">تاريخ الشراء</label>
                <input
                  type="date"
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                  value={newAsset.purchaseDate}
                  onChange={e => setNewAsset({ ...newAsset, purchaseDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">ملاحظات (اختياري)</label>
              <textarea
                rows={2}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400 resize-none"
                placeholder="رقم سري، ضمان، مكان التخزين..."
                value={newAsset.notes}
                onChange={e => setNewAsset({ ...newAsset, notes: e.target.value })}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl text-base font-medium hover:bg-indigo-700 transition-all active:scale-[0.99]">
              {editingAssetId ? 'حفظ التعديلات' : 'إضافة الأصل'}
            </button>
          </form>
        </Modal>
      )}

      {assetToDelete && (
        <Modal title="حذف الأصل" subtitle="لا يمكن التراجع بعد الحذف" onClose={() => setAssetToDelete(null)}>
          <div className="space-y-5">
            <div className="bg-rose-50/80 p-4 rounded-2xl flex items-center gap-4 text-rose-700 border border-rose-100">
              <div className="bg-rose-100/80 p-2.5 rounded-xl shrink-0">
                <AlertTriangle size={22} />
              </div>
              <p className="text-sm font-medium">هل أنت متأكد من حذف هذا الأصل من القائمة؟</p>
            </div>
            <div className="flex gap-3">
              <button onClick={confirmDeleteAsset} className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 transition-all">نعم، احذف</button>
              <button onClick={() => setAssetToDelete(null)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all">إلغاء</button>
            </div>
          </div>
        </Modal>
      )}

      {showAdminAuthModal && pendingDelete && (
        <Modal
          title="تأكيد صلاحية الأدمن"
          subtitle="أدخل اسم المستخدم وكلمة مرور الأدمن للحذف"
          onClose={() => { setShowAdminAuthModal(false); setPendingDelete(null); setAdminAuthUsername(''); setAdminAuthPassword(''); }}
        >
          <form onSubmit={handleAdminAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">اسم المستخدم</label>
              <input
                type="text"
                value={adminAuthUsername}
                onChange={(e) => setAdminAuthUsername(e.target.value)}
                placeholder="اسم مستخدم الأدمن"
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1.5">كلمة المرور</label>
              <input
                type="password"
                value={adminAuthPassword}
                onChange={(e) => setAdminAuthPassword(e.target.value)}
                placeholder="كلمة مرور الأدمن"
                className="w-full bg-slate-50/80 border border-slate-200 rounded-2xl px-5 py-3.5 text-base text-slate-800 outline-none focus:ring-2 focus:ring-indigo-300 transition-all placeholder:text-slate-400"
                autoComplete="current-password"
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-rose-600 text-white py-3 rounded-xl font-medium hover:bg-rose-700 transition-all">
                تأكيد والحذف
              </button>
              <button
                type="button"
                onClick={() => { setShowAdminAuthModal(false); setPendingDelete(null); setAdminAuthUsername(''); setAdminAuthPassword(''); }}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all"
              >
                إلغاء
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showReportModal && reportModalData && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in" onClick={(e) => e.target === e.currentTarget && setShowReportModal(false)}>
          <div className="glass-modal rounded-[28px] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 pb-4 flex justify-between items-center border-b border-white/40 shrink-0">
              <h3 className="text-xl text-slate-800 font-medium">معاينة التقرير</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-white/50 p-2 rounded-xl transition-all shrink-0" aria-label="إغلاق"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 custom-scrollbar" dir="rtl">
              <style>{reportModalData.reportStyles}</style>
              <div className="report-wrap bg-white rounded-2xl p-6 shadow-sm" dangerouslySetInnerHTML={{ __html: reportModalData.bodyContent }} />
            </div>
            <div className="p-6 pt-4 flex gap-3 border-t border-white/40 shrink-0">
              <button type="button" onClick={reportPrint} className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-2xl font-medium hover:bg-indigo-700 transition-all">
                <Printer size={20} />
                طباعة
              </button>
              <button type="button" onClick={reportDownload} className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-2xl font-medium hover:bg-emerald-700 transition-all">
                <Download size={20} />
                تحميل
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        :root {
          --primary-color: ${userSettings.primaryColor};
        }
        input, select {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: #0f172a;
        }
        header h2 {
          background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Utility overrides to enforce primary color theme */
        .bg-indigo-600 { background-color: var(--primary-color) !important; }
        .hover\\:bg-indigo-700:hover { background-color: color-mix(in srgb, var(--primary-color), black 10%) !important; }
        
        .text-indigo-600 { color: var(--primary-color) !important; }
        .text-indigo-700 { color: color-mix(in srgb, var(--primary-color), black 20%) !important; }
        .text-indigo-500 { color: var(--primary-color) !important; }
        .text-indigo-400 { color: var(--primary-color) !important; opacity: 0.8; }
        .text-indigo-300 { color: color-mix(in srgb, var(--primary-color), white 30%) !important; }
        .text-indigo-100 { color: color-mix(in srgb, var(--primary-color), white 80%) !important; }
        
        .bg-indigo-100 { background-color: color-mix(in srgb, var(--primary-color), white 85%) !important; }
        .bg-indigo-50 { background-color: color-mix(in srgb, var(--primary-color), white 93%) !important; }
        
        .bg-indigo-500 { background-color: var(--primary-color) !important; }
        .bg-indigo-500\\/10 { background-color: color-mix(in srgb, var(--primary-color), transparent 90%) !important; }

        .border-indigo-100 { border-color: color-mix(in srgb, var(--primary-color), white 80%) !important; }
        .border-indigo-200 { border-color: color-mix(in srgb, var(--primary-color), white 60%) !important; }
        .border-indigo-500\\/20 { border-color: color-mix(in srgb, var(--primary-color), transparent 80%) !important; }

        .focus\\:ring-indigo-500:focus { --tw-ring-color: var(--primary-color) !important; }
        .focus\\:ring-indigo-500\\/10:focus { --tw-ring-color: color-mix(in srgb, var(--primary-color), transparent 90%) !important; }
        
        .shadow-indigo-100 { --tw-shadow-color: color-mix(in srgb, var(--primary-color), white 80%) !important; }
        .shadow-indigo-200 { --tw-shadow-color: color-mix(in srgb, var(--primary-color), white 60%) !important; }
        .shadow-indigo-500\\/20 { --tw-shadow-color: color-mix(in srgb, var(--primary-color), transparent 80%) !important; }
        
        select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: left 1rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-left: 2.5rem;
        }
      `}</style>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default App;
