// src/services/geminiService.ts
import type { UserMetrics, PlanOptions, DailyPlan } from '../types';

export interface MealAlternativeResponse {
  alternativeMealName: string;
  quantity?: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface FullMealSwapResponse {
  name: string;
  time: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: {
    name: string;
    quantity: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash';
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

function cleanJsonResponse(text: string): string {
  if (!text) return '{}';
  let cleaned = text.trim();
  // إزالة وسوم الكود إن وجدت
  cleaned = cleaned
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  
  // استخراج أول قوس بداية وأخر قوس نهاية لضمان الحصول على كائن JSON نقي
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.slice(firstOpen, lastClose + 1);
  }

  return cleaned;
}

async function callGeminiJson<T>(prompt: string): Promise<T> {
  if (!API_KEY) {
    throw new Error('مفتاح VITE_GEMINI_API_KEY غير موجود في ملف .env[cite: 1]');
  }

  const url = `${ENDPOINT}/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    // سيتم معالجته عبر التحقق أدناه
  }

  if (!response.ok || data?.error) {
    const msg = data?.error?.message || raw.slice(0, 200) || response.statusText;
    throw new Error(`Gemini ${response.status}: ${msg}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('Unexpected Gemini response:', data);
    throw new Error('لم يتم استلام بيانات صحيحة من الخادم[cite: 1].');
  }

  const cleanedText = cleanJsonResponse(text);
  try {
    return JSON.parse(cleanedText) as T;
  } catch (parseError) {
    console.error('JSON Parse Error. Cleaned text was:', cleanedText);
    throw new Error('فشل معالجة بيانات الخطة القادمة من الذكاء الاصطناعي.');
  }
}

/**
 * طلب اقتراح وجبة/مكوّن بديل بذات القيم الغذائية مع مراعاة الحساسية والاستبعاد
 */
export async function suggestMealAlternative(
  mealName: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  allergies: string[] = [],
  excludedFoods: string[] = []
): Promise<MealAlternativeResponse> {
  const prompt = `
    أنا أتبع نظاماً غذائياً واستهلك وجبة/مكوّن: "${mealName}" بالخصائص التالية:
    - السعرات الحرارية: ${calories}
    - البروتين: ${protein} غرام
    - الكربوهيدرات: ${carbs} غرام
    - الدهون: ${fat} غرام

    ملاحظات هامة جداً:
    - الأطعمة الممنوعة أو التي يجب استبعادها تماماً: ${JSON.stringify(excludedFoods)}
    - الحساسية الغذائية للمستخدم: ${JSON.stringify(allergies)}

    اقترح عليّ وجبة/مكوّن بديل صحي متوفر وسهل التحضير يحتوي على قيم غذائية مشابهة جداً، مع التأكد التام من عدم احتواء البديل على أي من الأطعمة المستبعدة أو مسببات الحساسية المذكورة.
    أرجع النتيجة بتنسيق JSON حصراً بالشكل التالي دون أي نصوص إضافية:
    {
      "alternativeMealName": "اسم الوجبة البديلة",
      "quantity": "الكمية المناسبة لتحقيق نفس القيم الغذائية، مثل 150g أو 2 حبة",
      "description": "طريقة التحضير أو المكونات بشكل مختصر جداً",
      "calories": ${calories},
      "protein": ${protein},
      "carbs": ${carbs},
      "fat": ${fat}
    }
  `;

  try {
    return await callGeminiJson<MealAlternativeResponse>(prompt);
  } catch (error) {
    console.error('Error generating meal alternative:', error);
    throw new Error('تعذر جلب البديل الغذائي حالياً، يرجى المحاولة لاحقاً[cite: 1].');
  }
}

/**
 * استبدال وجبة كاملة بوجبة جديدة بديلة بالكامل
 */
export async function swapFullMeal(
  mealKey: string,
  currentMealName: string,
  targetCalories: number,
  options?: PlanOptions
): Promise<FullMealSwapResponse> {
  const prompt = `
    أنت خبير تغذية. أريد وجبة بديلة كاملة لـ: ${mealKey} (الوجبة الحالية: "${currentMealName}").
    السعرات المستهدفة تقريباً: ${targetCalories}.
    الأطعمة المستبعدة والحساسية: ${JSON.stringify(options || {})}.

    أجب بصيغة JSON حصراً وبدون أي نصوص أو شروح أخرى خارجه، بالهيكل التالي تماماً:
    {
      "name": "اسم الوجبة الجديدة",
      "time": "02:00 ظهراً",
      "totalCalories": ${targetCalories},
      "totalProtein": 30,
      "totalCarbs": 50,
      "totalFat": 15,
      "items": [
        { "name": "مكون 1", "quantity": "100g", "calories": ${targetCalories}, "protein": 30, "carbs": 50, "fat": 15 }
      ]
    }
  `;

  try {
    return await callGeminiJson<FullMealSwapResponse>(prompt);
  } catch (error) {
    console.error('Error swapping full meal:', error);
    throw new Error('تعذر استبدال الوجبة حالياً، يرجى المحاولة لاحقاً[cite: 1].');
  }
}

/**
 * توليد خطة يومية كاملة بناءً على بيانات المستخدم وخياراته (بما في ذلك عدد الوجبات ديناميكياً)
 */
export async function generateAIDailyPlan(
  metrics: UserMetrics,
  targetCalories?: number,
  options?: PlanOptions
): Promise<DailyPlan> {
  const mealsCount = options?.mealsPerDay || 4;
  const fastingMode = options?.fasting || 'none';
  
  const fastingInstruction = fastingMode === 'none'
    ? 'تنبيه إلزامي صارم جداً: المستخدم لا يتبع أي صيام (بدون صيام). ممنوع منعاً باتاً استخدام كلمات مثل (صيام، إفطار صيام، كسر الصيام، سحور). يجب أن تكون أسماء الوجبات طبيعية حصراً مثل: وجبة الفطور، وجبة الغداء، وجبة العشاء، وجبة خفيفة (سناك).'
    : `نظام الصيام المحدد: ${fastingMode}`;

  const prompt = `
    قم بإنشاء خطة وجبات يومية صحية للمستخدم.
    الاسم: ${metrics.name || 'مستخدم'}، العمر: ${metrics.age}، الوزن: ${metrics.weight}kg، الطول: ${metrics.height}cm.
    الهدف: ${metrics.goal}، السعرات المستهدفة: ${targetCalories || 2000}.
    عدد الوجبات المطلوب بالضبط: ${mealsCount} وجبات[cite: 1].
    ${fastingInstruction}
    الأطعمة المستبعدة والحساسية: ${JSON.stringify(options || {})}[cite: 1]

    أجب بصيغة JSON حصراً بدون أي نصوص خارجية، بحيث يحتوي الكائن على مفاتيح للوجبات (مثل meal1, meal2, meal3, meal4) بعدد ${mealsCount} وجبات، بالشكل التالي تماماً[cite: 1]:
    {
      "meal1": {
        "name": "وجبة الفطور",
        "time": "08:00 صباحاً",
        "totalCalories": 400,
        "totalProtein": 25,
        "totalCarbs": 40,
        "totalFat": 12,
        "items": [
          { "name": "بيض مسلوق", "quantity": "2 حبة", "calories": 200, "protein": 14, "carbs": 2, "fat": 10 }
        ]
      },
      "totalCalories": 2000,
      "advice": "نصائح عامة..."
    }
  `;

  try {
    return await callGeminiJson<DailyPlan>(prompt);
  } catch (error) {
    console.error('Error generating daily plan:', error);
    throw error;
  }
}