import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { getFirebaseFirestore, isFirebaseConfigured } from './firebase';
import type { Project, Transaction, AppNotification } from '../types';

export type StorageService = {
  getProjects: () => Promise<Project[]>;
  getTransactions: () => Promise<Transaction[]>;
  getNotifications: () => Promise<AppNotification[]>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addNotification: (notification: AppNotification) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
};

function projectsCol(uid: string) {
  const firestore = getFirebaseFirestore();
  if (!firestore) throw new Error('Firestore not configured');
  return collection(firestore, 'users', uid, 'projects');
}

function transactionsCol(uid: string) {
  const firestore = getFirebaseFirestore();
  if (!firestore) throw new Error('Firestore not configured');
  return collection(firestore, 'users', uid, 'transactions');
}

function notificationsCol(uid: string) {
  const firestore = getFirebaseFirestore();
  if (!firestore) throw new Error('Firestore not configured');
  return collection(firestore, 'users', uid, 'notifications');
}

export function createFirestoreStorage(uid: string): StorageService {
  return {
    async getProjects() {
      const snap = await getDocs(projectsCol(uid));
      return snap.docs.map((d) => d.data() as Project);
    },

    async addProject(project: Project) {
      await setDoc(doc(projectsCol(uid), project.id), project);
    },

    async updateProject(id: string, updates: Partial<Project>) {
      const ref = doc(projectsCol(uid), id);
      await updateDoc(ref, updates as Record<string, unknown>);
    },

    async deleteProject(id: string) {
      await deleteDoc(doc(projectsCol(uid), id));
    },

    async getTransactions() {
      const snap = await getDocs(transactionsCol(uid));
      return snap.docs.map((d) => d.data() as Transaction);
    },

    async addTransaction(transaction: Transaction) {
      await setDoc(doc(transactionsCol(uid), transaction.id), transaction);
    },

    async updateTransaction(id: string, updates: Partial<Transaction>) {
      const ref = doc(transactionsCol(uid), id);
      await updateDoc(ref, updates as Record<string, unknown>);
    },

    async deleteTransaction(id: string) {
      await deleteDoc(doc(transactionsCol(uid), id));
    },

    async getNotifications() {
      const q = query(
        notificationsCol(uid),
        orderBy('date', 'desc'),
        limit(500)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data() as AppNotification);
    },

    async addNotification(notification: AppNotification) {
      const ref = doc(notificationsCol(uid), notification.id);
      const existing = await getDoc(ref);
      if (!existing.exists()) {
        await setDoc(ref, notification);
      }
    },

    async markAsRead(id: string) {
      const ref = doc(notificationsCol(uid), id);
      await updateDoc(ref, { isRead: true });
    },

    async deleteNotification(id: string) {
      await deleteDoc(doc(notificationsCol(uid), id));
    },

    async clearAllData() {
      if (!confirm('تحذير: سيتم حذف قاعدة البيانات بالكامل بما فيها الإشعارات. هل أنت متأكد؟')) return;
      const firestore = getFirebaseFirestore();
      if (!firestore) return;
      const batch = writeBatch(firestore);
      const [projectsSnap, transactionsSnap, notificationsSnap] = await Promise.all([
        getDocs(projectsCol(uid)),
        getDocs(transactionsCol(uid)),
        getDocs(notificationsCol(uid)),
      ]);
      [...projectsSnap.docs, ...transactionsSnap.docs, ...notificationsSnap.docs].forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
      window.location.reload();
    },
  };
}

export function isFirestoreAvailable(): boolean {
  return isFirebaseConfigured();
}
