export interface DailyMealItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyMeal {
  name: string;
  time: string;
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

export interface PlanOptions {
  dietStyle?: 'balanced' | 'high_protein' | 'low_carb' | 'keto' | 'vegetarian' | 'vegan';
  mealsPerDay?: number;
  fasting?: 'none' | '16:8' | '18:6';
  budget?: 'low' | 'mid' | 'open';
  prepTime?: 'quick' | 'normal' | 'any';
  trainingToday?: boolean;
  trainingTime?: 'none' | 'morning' | 'evening';
  excludedFoods?: string[];
  allergies?: string[];
  notes?: string;
}