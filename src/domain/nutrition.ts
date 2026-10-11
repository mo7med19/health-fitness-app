import type { Gender, Goal, ActivityLevel, CalculatorResults, UserMetrics } from '../types';

export type MacroDistribution = { carbs: number; protein: number; fats: number };

// معامل مستوى النشاط بالاعتماد على Enum أو النص الممرر
export function getActivityMultiplier(activityLevel: ActivityLevel | string): number {
  const level = String(activityLevel).toLowerCase();

  if (level.includes('sedentary') || level.includes('خامل')) {
    return 1.2;
  }
  if (level.includes('light') || level.includes('خفيف')) {
    return 1.375;
  }
  if (level.includes('moderate') || level.includes('متوسط')) {
    return 1.55;
  }
  if (level.includes('very') || level.includes('مكثف')) {
    return 1.9;
  }
  if (level.includes('active') || level.includes('عالي')) {
    return 1.725;
  }

  // محاولة تحويل النص إلى رقم في حال تم تمرير قيمة رقمية كمفتاح
  const parsed = parseFloat(level);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1.2;
}

// Mifflin–St Jeor BMR equation (سعرات الأيض الأساسي)
export function mifflinStJeorBMR(age: number, heightCm: number, weightKg: number, gender: Gender | string): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const isMale = String(gender).toLowerCase() === 'male' || String(gender) === 'ذكر';
  return isMale ? base + 5 : base - 161;
}

export function tdeeFromBMR(bmr: number, activityLevel: ActivityLevel | string): number {
  const multiplier = getActivityMultiplier(activityLevel);
  return bmr * multiplier;
}

export const GOAL_CAL_ADJUSTMENT: Record<string, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function getGoalAdjustment(goal: Goal | string): number {
  const goalStr = String(goal).toLowerCase();
  if (goalStr.includes('lose') || goalStr.includes('خسارة')) {
    return -500;
  }
  if (goalStr.includes('gain') || goalStr.includes('زيادة')) {
    return 300;
  }
  return 0;
}

export function macroDistribution(goal: Goal | string): MacroDistribution {
  const goalStr = String(goal).toLowerCase();
  if (goalStr.includes('lose') || goalStr.includes('خسارة')) {
    return { carbs: 0.30, protein: 0.40, fats: 0.30 };
  }
  if (goalStr.includes('gain') || goalStr.includes('زيادة')) {
    return { carbs: 0.50, protein: 0.30, fats: 0.20 };
  }
  return { carbs: 0.40, protein: 0.30, fats: 0.30 };
}

export function calculateNutrition(metrics: UserMetrics): CalculatorResults {
  const age = Number(metrics.age) || 0;
  const height = Number(metrics.height) || 0;
  const weight = Number(metrics.weight) || 0;

  const bmr = mifflinStJeorBMR(age, height, weight, metrics.gender);
  const tdee = tdeeFromBMR(bmr, metrics.activityLevel);

  const goalAdjustment = getGoalAdjustment(metrics.goal);
  const targetCalories = Math.max(1200, tdee + goalAdjustment);

  const macros = macroDistribution(metrics.goal);

  // السعرات لكل جرام: البروتين 4، الكربوهيدرات 4، الدهون 9
  const proteinG = (targetCalories * macros.protein) / 4;
  const carbsG = (targetCalories * macros.carbs) / 4;
  const fatsG = (targetCalories * macros.fats) / 9;

  return {
    bmr: Math.round(bmr) || 0,
    tdee: Math.round(tdee) || 0,
    targetCalories: Math.round(targetCalories) || 0,
    macros: {
      protein: Math.round(proteinG) || 0,
      carbs: Math.round(carbsG) || 0,
      fats: Math.round(fatsG) || 0,
    },
  };
}