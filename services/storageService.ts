/**
 * إعادة تصدير قاعدة البيانات المحلية للتوافق مع الكود القديم.
 * التخزين الفعلي في: services/localDatabase.ts (IndexedDB عبر Dexie).
 */

import { localDb, localDatabase } from './localDatabase';

/** نسخة Dexie المباشرة — للاستخدام المتقدم إن لزم */
export const db = localDb;

/** واجهة قاعدة البيانات المحلية (نفس API قديماً) */
export const LensFlowDB = localDatabase;
