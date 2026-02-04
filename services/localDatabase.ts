/**
 * قاعدة البيانات المحلية — LensFlow
 * التخزين يتم في IndexedDB داخل المتصفح (Dexie).
 * البيانات تبقى على جهاز المستخدم ولا تُرفع لأي سيرفر.
 */

import Dexie, { type Table } from 'dexie';
import type { Project, Transaction, AppNotification, Attachment, Asset } from '../types';

/** اسم قاعدة البيانات في IndexedDB — نفس الاسم يحافظ على بيانات المستخدمين الحاليين */
const DB_NAME = 'LensFlowDB';
const DB_VERSION = 5;

export const localDb = new Dexie(DB_NAME) as Dexie & {
  projects: Table<Project>;
  transactions: Table<Transaction>;
  notifications: Table<AppNotification>;
  attachments: Table<Attachment>;
  assets: Table<Asset>;
};

localDb.version(3).stores({
  projects: 'id, title, client, type, status, deadline, paidAmount',
  transactions: 'id, type, amount, category, date, projectId',
  notifications: 'id, date, isRead, projectId',
});

localDb.version(4).stores({
  projects: 'id, title, client, type, status, deadline, paidAmount',
  transactions: 'id, type, amount, category, date, projectId',
  notifications: 'id, date, isRead, projectId',
  attachments: 'id, relatedType, relatedId, createdAt',
});

localDb.version(5).stores({
  projects: 'id, title, client, type, status, deadline, paidAmount',
  transactions: 'id, type, amount, category, date, projectId',
  notifications: 'id, date, isRead, projectId',
  attachments: 'id, relatedType, relatedId, createdAt',
  assets: 'id, category, purchaseDate, createdAt',
});

/** واجهة قاعدة البيانات المحلية — نفس شكل StorageService للتوافق مع التطبيق */
export const localDatabase = {
  // المشاريع
  getProjects: async (): Promise<Project[]> => {
    return localDb.projects.toArray();
  },
  addProject: async (project: Project): Promise<void> => {
    await localDb.projects.add(project);
  },
  updateProject: async (id: string, updates: Partial<Project>): Promise<void> => {
    await localDb.projects.update(id, updates);
  },
  deleteProject: async (id: string): Promise<void> => {
    await localDb.projects.delete(id);
  },

  // المعاملات المالية
  getTransactions: async (): Promise<Transaction[]> => {
    return localDb.transactions.toArray();
  },
  addTransaction: async (transaction: Transaction): Promise<void> => {
    await localDb.transactions.add(transaction);
  },
  updateTransaction: async (id: string, updates: Partial<Transaction>): Promise<void> => {
    await localDb.transactions.update(id, updates);
  },
  deleteTransaction: async (id: string): Promise<void> => {
    await localDb.transactions.delete(id);
  },

  // التنبيهات
  getNotifications: async (): Promise<AppNotification[]> => {
    return localDb.notifications.orderBy('date').reverse().toArray();
  },
  addNotification: async (notification: AppNotification): Promise<void> => {
    const existing = await localDb.notifications.get(notification.id);
    if (!existing) {
      await localDb.notifications.add(notification);
    }
  },
  markAsRead: async (id: string): Promise<void> => {
    await localDb.notifications.update(id, { isRead: true });
  },
  deleteNotification: async (id: string): Promise<void> => {
    await localDb.notifications.delete(id);
  },

  // الملحقات (صور/ملفات) — تخزين محلي على الجهاز
  getAttachments: async (): Promise<Attachment[]> => {
    return localDb.attachments.toArray();
  },
  getAttachmentsByRelated: async (relatedType: Attachment['relatedType'], relatedId: string): Promise<Attachment[]> => {
    return localDb.attachments.where({ relatedType, relatedId }).toArray();
  },
  getAttachment: async (id: string): Promise<Attachment | undefined> => {
    return localDb.attachments.get(id);
  },
  addAttachment: async (attachment: Attachment): Promise<void> => {
    await localDb.attachments.add(attachment);
  },
  deleteAttachment: async (id: string): Promise<void> => {
    await localDb.attachments.delete(id);
  },
  deleteAttachmentsByRelated: async (relatedType: Attachment['relatedType'], relatedId: string): Promise<void> => {
    await localDb.attachments.where({ relatedType, relatedId }).delete();
  },

  // الأصول (معدات، أجهزة)
  getAssets: async (): Promise<Asset[]> => {
    return localDb.assets.orderBy('createdAt').reverse().toArray();
  },
  addAsset: async (asset: Asset): Promise<void> => {
    await localDb.assets.add(asset);
  },
  updateAsset: async (id: string, updates: Partial<Asset>): Promise<void> => {
    await localDb.assets.update(id, updates);
  },
  deleteAsset: async (id: string): Promise<void> => {
    await localDb.assets.delete(id);
  },

  // صيانة: تصدير نسخة احتياطية (بيانات فقط)
  exportDatabase: async (): Promise<void> => {
    const [projects, transactions, notifications] = await Promise.all([
      localDatabase.getProjects(),
      localDatabase.getTransactions(),
      localDatabase.getNotifications(),
    ]);
    const data = {
      projects,
      transactions,
      notifications,
      exportDate: new Date().toISOString(),
      database: DB_NAME,
      version: DB_VERSION,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LensFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // صيانة: تصدير نسخة كاملة (بيانات + ملحقات + أصول) — ملف واحد على جهازك
  exportFullBackup: async (): Promise<void> => {
    const [projects, transactions, notifications, attachments, assets] = await Promise.all([
      localDatabase.getProjects(),
      localDatabase.getTransactions(),
      localDatabase.getNotifications(),
      localDatabase.getAttachments(),
      localDatabase.getAssets(),
    ]);
    const data = {
      projects,
      transactions,
      notifications,
      attachments,
      assets,
      exportDate: new Date().toISOString(),
      database: DB_NAME,
      version: DB_VERSION,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LensFlow_Full_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // صيانة: استيراد من ملف (بيانات + ملحقات إن وُجدت)
  importFromFile: async (file: File): Promise<{ ok: boolean; error?: string }> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.projects || !Array.isArray(data.projects)) return { ok: false, error: 'صيغة الملف غير صحيحة' };
      const attachments = Array.isArray(data.attachments) ? data.attachments : [];
      const assets = Array.isArray(data.assets) ? data.assets : [];
      const projects = data.projects ?? [];
      const transactions = data.transactions ?? [];
      const notifications = data.notifications ?? [];
      for (const p of projects) await localDb.projects.put(p);
      for (const t of transactions) await localDb.transactions.put(t);
      for (const n of notifications) await localDb.notifications.put(n);
      for (const a of attachments) await localDb.attachments.put(a);
      for (const a of assets) await localDb.assets.put(a);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'فشل استيراد الملف' };
    }
  },

  // صيانة: مسح كل البيانات (يطلب تأكيداً ثم إعادة تحميل الصفحة)
  clearAllData: async (): Promise<void> => {
    if (!window.confirm('تحذير: سيتم حذف قاعدة البيانات بالكامل بما فيها الإشعارات والملحقات والأصول. هل أنت متأكد؟')) return;
    await localDb.projects.clear();
    await localDb.transactions.clear();
    await localDb.notifications.clear();
    await localDb.attachments.clear();
    await localDb.assets.clear();
    window.location.reload();
  },
};

export default localDatabase;
