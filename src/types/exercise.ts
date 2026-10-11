// src/types/exercise.ts
export type ExerciseCategory = 'كارديو' | 'تمارين مقاومة' | 'مشي' | 'سباحة ورياضات أخرى';

export interface ExerciseEntry {
  id: string;
  name: string;
  category: ExerciseCategory;
  durationMinutes: number;
  caloriesBurned: number;
  date: string; // صيغة YYYY-MM-DD
}