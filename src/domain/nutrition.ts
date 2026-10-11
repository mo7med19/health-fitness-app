import type { Gender, Goal, ActivityLevel, CalculatorResults, UserMetrics } from '../../types';

export type MacroDistribution = { carbs: number; protein: number; fats: number };

// Mifflin–St Jeor BMR equation.
// Returns kcal/day.
export function mifflinStJeorBMR(age: number, heightCm: number, weightKg: number, gender: Gender) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export function tdeeFromBMR(bmr: number, activityLevel: ActivityLevel) {
  return bmr * parseFloat(activityLevel);
}

export const GOAL_CAL_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 300,
};

export function macroDistribution(goal: Goal): MacroDistribution {
  // Practical defaults (can be tuned later)
  switch (goal) {
    case 'lose':
      return { carbs: 0.30, protein: 0.40, fats: 0.30 };
    case 'gain':
      return { carbs: 0.50, protein: 0.30, fats: 0.20 };
    default:
      return { carbs: 0.40, protein: 0.30, fats: 0.30 };
  }
}

export function calculateNutrition(metrics: UserMetrics): CalculatorResults {
  const bmr = mifflinStJeorBMR(metrics.age, metrics.height, metrics.weight, metrics.gender);
  const tdee = tdeeFromBMR(bmr, metrics.activityLevel);

  const targetCalories = Math.max(1200, tdee + GOAL_CAL_ADJUSTMENT[metrics.goal]);
  const macros = macroDistribution(metrics.goal);

  // kcal per gram: protein 4, carbs 4, fats 9.
  const proteinG = (targetCalories * macros.protein) / 4;
  const carbsG = (targetCalories * macros.carbs) / 4;
  const fatsG = (targetCalories * macros.fats) / 9;

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    macros: {
      protein: Math.round(proteinG),
      carbs: Math.round(carbsG),
      fats: Math.round(fatsG),
    },
  };
}
