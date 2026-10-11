// Shared types used across the app.
//
// We use "const objects" + union types instead of TS enums.
// This keeps runtime ergonomics (e.g. Gender.MALE) while allowing direct literals ("male").

// ---------------------------
// Constants + Union Types
// ---------------------------
export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const ActivityLevel = {
  SEDENTARY: '1.2',
  LIGHT: '1.375',
  MODERATE: '1.55',
  ACTIVE: '1.725',
  VERY_ACTIVE: '1.9',
} as const;
export type ActivityLevel = (typeof ActivityLevel)[keyof typeof ActivityLevel];

export const Goal = {
  LOSE: 'lose',
  MAINTAIN: 'maintain',
  GAIN: 'gain',
} as const;
export type Goal = (typeof Goal)[keyof typeof Goal];

// ---------------------------
// User Metrics (Validated)
// ---------------------------
export interface UserMetrics {
  name?: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

// Form-friendly draft metrics (inputs are strings so empty values are allowed).
export interface UserMetricsDraft {
  name: string;
  age: string;
  weight: string;
  height: string;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}

// ---------------------------
// Calculator Results
// ---------------------------
export interface CalculatorResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number; // grams/day
    carbs: number; // grams/day
    fats: number; // grams/day
  };
}

// ===================================================================
// 0) PLAN OPTIONS (قبل توليد الخطة اليومية)
// ===================================================================

export const DietStyle = {
  BALANCED: 'balanced',
  HIGH_PROTEIN: 'high_protein',
  LOW_CARB: 'low_carb',
  KETO: 'keto',
  VEGETARIAN: 'vegetarian',
  VEGAN: 'vegan',
} as const;
export type DietStyle = (typeof DietStyle)[keyof typeof DietStyle];

export const Fasting = {
  NONE: 'none',
  F16_8: '16:8',
  F18_6: '18:6',
} as const;
export type Fasting = (typeof Fasting)[keyof typeof Fasting];

export const Budget = {
  LOW: 'low',
  MID: 'mid',
  OPEN: 'open',
} as const;
export type Budget = (typeof Budget)[keyof typeof Budget];

export const PrepTime = {
  QUICK: 'quick',
  NORMAL: 'normal',
  ANY: 'any',
} as const;
export type PrepTime = (typeof PrepTime)[keyof typeof PrepTime];

export const TrainingTime = {
  NONE: 'none',
  MORNING: 'morning',
  EVENING: 'evening',
} as const;
export type TrainingTime = (typeof TrainingTime)[keyof typeof TrainingTime];

export type MealsPerDay = 3 | 4 | 5;

/**
 * ✅ خيارات توليد الخطة (تُرسل للـ AI عشان يخصص الخطة)
 */
export interface PlanOptions {
  dietStyle?: DietStyle;

  // قوائم نصية، مثل: ["سمك", "ألبان"]
  excludedFoods?: string[];
  allergies?: string[];

  mealsPerDay?: MealsPerDay;
  fasting?: Fasting;

  budget?: Budget;
  prepTime?: PrepTime;

  trainingToday?: boolean;
  trainingTime?: TrainingTime;

  notes?: string; // نص حر: "أبغى أكل عربي..."
}

// ===================================================================
// 1) DAILY PLAN (Gemini generates a plan for ONE day: breakfast/lunch...)
// ===================================================================

/**
 * ✅ عنصر واحد داخل الوجبة (مكوّن)
 * يحتوي على الكمية + السعرات + الماكروز
 */
export type DailyMealItem = {
  name: string; // مثال: "بيض"
  quantity: string; // مثال: "2 حبة" / "150g" / "1 كوب"
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
};

export interface DailyMeal {
  name: string; // مثال: "فطور" / "غداء"...
  time: string; // مثال: "08:00"
  items: DailyMealItem[];

  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface DailyPlan {
  breakfast: DailyMeal;
  lunch: DailyMeal;
  dinner: DailyMeal;
  snack: DailyMeal;
  totalCalories: number;
  advice: string;
}

// ===================================================================
// 2) SMART PLAN (Detailed multi-day plan with macros + item amounts)
// ===================================================================

// Meal item with quantity (used in SmartPlan)
export type PlanMealItem = {
  item: string;
  amount: string; // مثال: "150g" / "1 كوب" / "قطعة"
  calories?: number; // اختياري
};

export type MealPlan = {
  name: string; // مثال: "فطور" / "غداء" / "عشاء" / "سناك"
  calories: number;
  macros: {
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  items: PlanMealItem[];
};

export type DayPlan = {
  dayName: string; // "السبت"..."الجمعة"
  meals: MealPlan[];
  totals: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
};

export type SmartPlan = {
  meta: {
    createdAtISO: string;
    targetCalories: number;
    targetMacros: {
      protein_g: number;
      carbs_g: number;
      fat_g: number;
    };
  };
  days: DayPlan[];
  groceryList: string[];
  notes: string[];
};
