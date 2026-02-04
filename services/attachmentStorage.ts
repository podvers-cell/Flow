/**
 * تخزين الملحقات والملفات على الجهاز
 * يستخدم قاعدة البيانات المحلية (IndexedDB) — كل شيء يبقى على جهازك.
 */

import { localDatabase } from './localDatabase';
import type { Attachment, AttachmentRelatedType } from '../types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 ميجابايت

function generateId(): string {
  return 'att-' + Math.random().toString(36).slice(2, 11);
}

/**
 * حفظ ملف (صورة أو غيره) على الجهاز وربطه بمشروع أو إعدادات
 */
export async function saveAttachment(
  file: File,
  relatedType: AttachmentRelatedType,
  relatedId: string,
  options?: { maxSize?: number }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const maxSize = options?.maxSize ?? MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return { ok: false, error: `حجم الملف يجب أن يكون أقل من ${Math.round(maxSize / 1024 / 1024)} ميجابايت` };
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const data = reader.result as string;
      const id = generateId();
      const attachment: Attachment = {
        id,
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        data,
        relatedType,
        relatedId,
        createdAt: new Date().toISOString(),
      };
      await localDatabase.addAttachment(attachment);
      resolve({ ok: true, id });
    };
    reader.onerror = () => resolve({ ok: false, error: 'فشل قراءة الملف' });
    reader.readAsDataURL(file);
  });
}

/**
 * حفظ بيانات صورة (مثلاً من canvas أو data URL) كملحق
 */
export async function saveAttachmentFromDataUrl(
  dataUrl: string,
  name: string,
  mimeType: string,
  relatedType: AttachmentRelatedType,
  relatedId: string
): Promise<string> {
  const id = generateId();
  const attachment: Attachment = {
    id,
    name,
    mimeType,
    size: Math.round((dataUrl.length * 3) / 4),
    data: dataUrl,
    relatedType,
    relatedId,
    createdAt: new Date().toISOString(),
  };
  await localDatabase.addAttachment(attachment);
  return id;
}

/**
 * جلب ملحق بالمعرّف
 */
export async function getAttachment(id: string): Promise<Attachment | undefined> {
  return localDatabase.getAttachment(id);
}

/**
 * الحصول على رابط البيانات للعرض (مثلاً في <img src="...">)
 */
export async function getAttachmentDataUrl(id: string): Promise<string | null> {
  const att = await localDatabase.getAttachment(id);
  return att?.data ?? null;
}

/**
 * قائمة الملحقات المرتبطة بنوع ومعرّف (مثلاً كل ملحقات مشروع)
 */
export async function listAttachments(
  relatedType: AttachmentRelatedType,
  relatedId: string
): Promise<Attachment[]> {
  return localDatabase.getAttachmentsByRelated(relatedType, relatedId);
}

/**
 * حذف ملحق
 */
export async function deleteAttachment(id: string): Promise<void> {
  await localDatabase.deleteAttachment(id);
}

/**
 * حذف كل ملحقات مرتبطة (مثلاً عند حذف مشروع)
 */
export async function deleteAttachmentsByRelated(
  relatedType: AttachmentRelatedType,
  relatedId: string
): Promise<void> {
  await localDatabase.deleteAttachmentsByRelated(relatedType, relatedId);
}

export {
  localDatabase as attachmentDb,
};
