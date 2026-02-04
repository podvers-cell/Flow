
import { GoogleGenAI } from "@google/genai";
import { Project, Transaction } from "../types";

// Always use named parameter for apiKey and directly access process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeFinances = async (projects: Project[], transactions: Transaction[]) => {
  const prompt = `
    أنت مستشار مالي ذكي لمصور ومونتير محترف يعمل في دولة الإمارات. 
    بناءً على البيانات التالية (المبالغ بالدرهم الإماراتي د.إ)، قدم تحليلاً قصيراً (باللغة العربية) يتضمن:
    1. تقييم للربحية الحالية.
    2. نصيحة لتقليل المصاريف أو زيادة الدخل.
    3. توقعات للمشاريع القادمة.

    البيانات:
    المشاريع: ${JSON.stringify(projects)}
    المعاملات المالية: ${JSON.stringify(transactions)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "أنت خبير مالي وإداري متخصص في قطاع الإنتاج المرئي والمسموع في منطقة الخليج العربي والإمارات."
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "عذراً، لم أتمكن من تحليل البيانات حالياً. حاول لاحقاً.";
  }
};

export const chatWithAI = async (message: string, context: { projects: Project[], transactions: Transaction[] }) => {
    const prompt = `
    رسالة المستخدم: "${message}"
    سياق العمل الحالي (المبالغ بالدرهم الإماراتي د.إ):
    المشاريع: ${JSON.stringify(context.projects)}
    المعاملات: ${JSON.stringify(context.transactions)}
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          systemInstruction: "أنت مساعد ذكي لإدارة أعمال التصوير والمونتاج. أجب بوضوح واحترافية باللغة العربية، علماً أن العملة هي الدرهم الإماراتي."
        }
      });
      return response.text;
    } catch (e) {
      console.error("Chat error:", e);
      return "فشل الاتصال بالمساعد الذكي.";
    }
}
