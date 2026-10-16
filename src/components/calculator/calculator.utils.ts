// src/components/calculator/calculator.utils.ts
import { jsPDF } from 'jspdf';
import type { UserMetricsDraft, UserMetrics, CalculatorResults } from '../../types';
import { Gender, ActivityLevel, Goal } from '../../types';

type FieldErrors = Partial<Record<keyof UserMetricsDraft, string>>;

export const DEFAULT_DRAFT: UserMetricsDraft = {
  name: '',
  age: '',
  weight: '',
  height: '',
  gender: Gender.MALE,
  activityLevel: ActivityLevel.SEDENTARY,
  goal: Goal.MAINTAIN,
};

export function validate(draft: UserMetricsDraft): FieldErrors {
  const errors: FieldErrors = {};
  const name = (draft.name ?? '').trim();
  const age = Number(draft.age);
  const weight = Number(draft.weight);
  const height = Number(draft.height);

  if (!name) errors.name = 'الاسم مطلوب';
  if (!draft.age) {
    errors.age = 'العمر مطلوب';
  } else if (!Number.isFinite(age) || age < 5 || age > 120) {
    errors.age = 'يجب أن يكون العمر بين 5 و 120 سنة';
  }
  if (!draft.weight) {
    errors.weight = 'الوزن مطلوب';
  } else if (!Number.isFinite(weight) || weight < 20 || weight > 350) {
    errors.weight = 'يجب أن يكون الوزن بين 20 و 350 كجم';
  }
  if (!draft.height) {
    errors.height = 'الطول مطلوب';
  } else if (!Number.isFinite(height) || height < 90 || height > 250) {
    errors.height = 'يجب أن يكون الطول بين 90 و 250 سم';
  }

  return errors;
}

export function parseMetrics(draft: UserMetricsDraft): UserMetrics | null {
  const errors = validate(draft);
  if (Object.keys(errors).length > 0) return null;

  const age = Number(draft.age);
  const weight = Number(draft.weight);
  const height = Number(draft.height);

  if (!Number.isFinite(age) || !Number.isFinite(weight) || !Number.isFinite(height)) {
    return null;
  }

  return {
    name: (draft.name ?? '').trim(),
    age,
    weight,
    height,
    gender: draft.gender ?? Gender.MALE,
    activityLevel: draft.activityLevel ?? ActivityLevel.SEDENTARY,
    goal: draft.goal ?? Goal.MAINTAIN,
  };
}

export function sanitizeResults(results: CalculatorResults): CalculatorResults {
  const safeNumber = (val: any) => (Number.isFinite(Number(val)) ? Math.round(Number(val)) : 0);
  return {
    bmr: safeNumber(results.bmr),
    tdee: safeNumber(results.tdee),
    targetCalories: safeNumber(results.targetCalories),
    macros: {
      protein: safeNumber(results?.macros?.protein),
      carbs: safeNumber(results?.macros?.carbs),
      fats: safeNumber(results?.macros?.fats),
    },
  };
}

export function generatePDFReport(draft: UserMetricsDraft, safeResults: CalculatorResults) {
  const doc = new jsPDF();
  doc.setFont('helvetica');
  doc.setFontSize(16);

  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
  doc.setTextColor(255);
  doc.text('Personalized Nutrition & Fitness Summary', 20, 20);

  doc.setTextColor(0);
  doc.setFontSize(12);

  const line = (y: number, label: string, value: string) => {
    doc.text(label, 20, y);
    doc.text(value, 120, y);
  };

  line(45, 'Name', (draft.name ?? '').trim());
  line(55, 'Age', `${draft.age ?? ''} years`);
  line(65, 'Weight', `${draft.weight ?? ''} kg`);
  line(75, 'Height', `${draft.height ?? ''} cm`);
  line(85, 'Gender', String(draft.gender ?? ''));
  line(95, 'Activity Level', String(draft.activityLevel ?? ''));
  line(105, 'Goal', String(draft.goal ?? ''));

  doc.setFontSize(13);
  doc.text('Calculated Results', 20, 125);
  doc.setFontSize(12);

  line(140, 'BMR (Basal Metabolic Rate)', `${safeResults.bmr} kcal`);
  line(150, 'TDEE (Total Daily Energy)', `${safeResults.tdee} kcal`);
  line(160, 'Target Calories', `${safeResults.targetCalories} kcal/day`);

  line(175, 'Protein', `${safeResults.macros.protein} g/day`);
  line(185, 'Carbohydrates', `${safeResults.macros.carbs} g/day`);
  line(195, 'Fats', `${safeResults.macros.fats} g/day`);

  doc.setTextColor(120);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280);

  doc.save('my-health-nutrition-report.pdf');
}