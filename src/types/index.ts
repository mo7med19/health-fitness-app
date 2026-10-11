export * from './metrics.types';
export * from './plan.types';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHT = 'light',
  MODERATE = 'moderate',
  ACTIVE = 'active',
  VERY_ACTIVE = 'very_active',
}

export enum Goal {
  LOSE = 'lose',
  MAINTAIN = 'maintain',
  GAIN = 'gain',
}

export interface UserMetricsDraft {
  name?: string;
  age?: string | number;
  weight?: string | number;
  height?: string | number;
  gender?: Gender;
  activityLevel?: ActivityLevel;
  goal?: Goal;
}

export interface UserMetrics {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: Gender | string;
  activityLevel: ActivityLevel | string;
  goal: Goal;
}

export interface CalculatorResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
}
export interface WeightLog {
  id: string;
  date: string;
  weight: number;
  note?: string;
}