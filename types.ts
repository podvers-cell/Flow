
export enum ProjectStatus {
  UPCOMING = 'قادم',
  IN_PROGRESS = 'قيد التنفيذ',
  DELIVERED = 'تم التسليم',
  CANCELLED = 'ملغي',
  OVERDUE = 'متأخر'
}

export enum ProjectType {
  PHOTOGRAPHY = 'تصوير فوتوغرافي',
  EDITING = 'مونتاج فيديو',
  FULL_SERVICE = 'تصوير ومونتاج'
}

export interface Project {
  id: string;
  title: string;
  client: string;
  type: ProjectType;
  status: ProjectStatus;
  budget: number;
  paidAmount: number; // المبلغ المستلم من العميل
  startDate: string;
  deadline: string;
}

export enum TransactionType {
  INCOME = 'دخل',
  EXPENSE = 'مصروف'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
  projectId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  projectId: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  pendingProjectsCount: number;
  activeProjectsCount: number;
  completedProjectsCount: number;
}

/** أصل (معدات، أجهزة) — مطابق لجدول My Gears: النوع، الاسم، الكمية، الماركة، الحالة */
export interface Asset {
  id: string;
  name: string;
  category: string;
  quantity?: number;
  brand?: string;
  condition?: string;
  value: number;
  purchaseDate: string;
  notes: string;
  createdAt: string;
}

/** ملحق مخزن محلياً (صورة، ملف) — يُربط بمشروع أو إعدادات */
export type AttachmentRelatedType = 'settings' | 'project';

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  /** المحتوى كـ base64 (للتخزين في IndexedDB والنسخ الاحتياطي) */
  data: string;
  relatedType: AttachmentRelatedType;
  relatedId: string;
  createdAt: string;
}
