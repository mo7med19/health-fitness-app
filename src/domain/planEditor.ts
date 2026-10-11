// src/domain/planEditor.ts
import type { DailyMeal, DailyPlan } from '../types';

export function recalcMeal(meal: DailyMeal | undefined): DailyMeal {
  const safeMeal = meal || { name: '', time: '', totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, items: [] };
  const items = Array.isArray(safeMeal.items) ? safeMeal.items : [];

  const sum = items.reduce(
    (acc, it) => {
      acc.cal += Number(it?.calories) || 0;
      acc.p += Number(it?.protein) || 0;
      acc.c += Number(it?.carbs) || 0;
      acc.f += Number(it?.fat) || 0;
      return acc;
    },
    { cal: 0, p: 0, c: 0, f: 0 }
  );

  return {
    ...safeMeal,
    items,
    totalCalories: sum.cal,
    totalProtein: sum.p,
    totalCarbs: sum.c,
    totalFat: sum.f,
  };
}

export function recalcPlan(plan: DailyPlan | null): DailyPlan {
  if (!plan) return {} as DailyPlan;

  const updatedPlan: any = { ...plan };
  let totalCalories = 0;

  Object.keys(updatedPlan).forEach((key) => {
    if (key !== 'totalCalories' && key !== 'advice' && updatedPlan[key]) {
      updatedPlan[key] = recalcMeal(updatedPlan[key]);
      totalCalories += Number(updatedPlan[key].totalCalories) || 0;
    }
  });

  updatedPlan.totalCalories = totalCalories;
  return updatedPlan as DailyPlan;
}