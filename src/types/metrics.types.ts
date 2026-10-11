export enum Goal {
  LOSE = 'lose',
  MAINTAIN = 'maintain',
  GAIN = 'gain',
}

export interface UserMetrics {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: string;
  activityLevel: string;
  goal: Goal;
}

export type UserMetricsDraft = Partial<Record<keyof UserMetrics, string | Goal>>;

export interface CalculatorResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}