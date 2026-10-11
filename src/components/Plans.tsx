// src/components/Plans.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { generateAIDailyPlan } from '../services/geminiService';
import { exportDailyPlanPdf } from '../services/pdf.service';
import { recalcMeal, recalcPlan } from '../domain/planEditor';
import { DailyMealTable } from './plans/DailyMealTable';
import { UserMetricsCard } from './plans/UserMetricsCard';
import { PlanActionsBar } from './plans/PlanActionsBar';
import { OptionsForm } from './plans/OptionsForm';
import { MacroProgressCard } from './plans/MacroProgressCard';
import type {
  CalculatorResults,
  DailyPlan,
  DailyMeal,
  DailyMealItem,
  UserMetrics,
  UserMetricsDraft,
  PlanOptions,
} from '../types';
import { Goal } from '../types';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

type ErrorState = string | null;

function parseDraft(draft: UserMetricsDraft): UserMetrics | null {
  const name = (draft.name ?? '').trim();
  const age = Number(draft.age);
  const weight = Number(draft.weight);
  const height = Number(draft.height);

  if (!name) return null;
  if (!Number.isFinite(age) || age < 5 || age > 120) return null;
  if (!Number.isFinite(weight) || weight < 20 || weight > 350) return null;
  if (!Number.isFinite(height) || height < 90 || height > 250) return null;

  return {
    name,
    age,
    weight,
    height,
    gender: draft.gender || '',
    activityLevel: draft.activityLevel || '',
    goal: (draft.goal as Goal) || Goal.MAINTAIN,
  };
}

// دالة تنظيف وتصحيح أسماء الوجبات شاملة لكل مصطلحات الصيام
function sanitizePlanForNoFasting(plan: DailyPlan, fastingMode?: string): DailyPlan {
  if (fastingMode && fastingMode !== 'none') return plan;

  const cleaned = { ...plan };
  const forbiddenWords = ['صيام', 'إفطار', 'السحور', 'كسر', 'صائم', 'سحور', 'رمضان'];

  Object.keys(cleaned).forEach((key) => {
    if (key !== 'totalCalories' && key !== 'advice' && (cleaned as any)[key]) {
      let mealName = (cleaned as any)[key].name || '';
      
      const hasForbidden = forbiddenWords.some((word) => mealName.includes(word));
      if (hasForbidden) {
        if (key === 'meal1') mealName = 'وجبة الفطور';
        else if (key === 'meal2') mealName = 'وجبة الغداء';
        else if (key === 'meal3') mealName = 'وجبة العشاء';
        else mealName = 'وجبة خفيفة (سناك)';
        
        (cleaned as any)[key].name = mealName;
      }
    }
  });

  return cleaned;
}

const STORAGE_DAILY = 'aiDailyPlan_v2';
const DEFAULT_OPTIONS: PlanOptions = {
  dietStyle: 'balanced',
  mealsPerDay: 4,
  fasting: 'none',
  budget: 'mid',
  prepTime: 'normal',
  trainingToday: false,
  trainingTime: 'none',
  excludedFoods: [],
  allergies: [],
  notes: '',
};

const Plans: React.FC = () => {
  const [draft] = useLocalStorageState<UserMetricsDraft | null>('userMetricsDraft', null);
  const metrics = useMemo(() => (draft ? parseDraft(draft) : null), [draft]);
  const [calc] = useLocalStorageState<CalculatorResults | null>('calculatorResults', null);

  const targetCalories = Number(calc?.targetCalories);
  const hasCalories = Number.isFinite(targetCalories) && targetCalories > 0;
  const [planOptions, setPlanOptions] = useLocalStorageState<PlanOptions>('planOptions_v1', DEFAULT_OPTIONS);

  const [loadingDaily, setLoadingDaily] = useState(false);
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null);
  const [errorDaily, setErrorDaily] = useState<ErrorState>(null);

  const [editMode, setEditMode] = useState(false);
  const [draftPlan, setDraftPlan] = useState<DailyPlan | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportStep, setExportStep] = useState('');
  const [exportError, setExportError] = useState<ErrorState>(null);

  const reqIdRef = useRef(0);

  const ensureSafePlanStructure = (planData: any): DailyPlan | null => {
    if (!planData || typeof planData !== 'object') return null;
    const safePlan: any = { ...planData };
    Object.keys(safePlan).forEach((key) => {
      if (
        key !== 'totalCalories' &&
        key !== 'advice' &&
        safePlan[key] &&
        typeof safePlan[key] === 'object'
      ) {
        if (!safePlan[key].items || !Array.isArray(safePlan[key].items)) {
          safePlan[key].items = [];
        }
      } else if (typeof safePlan[key] !== 'object' && key !== 'advice' && key !== 'totalCalories') {
        delete safePlan[key];
      }
    });
    return safePlan as DailyPlan;
  };

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_DAILY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.plan) {
        const safePlan = ensureSafePlanStructure(parsed.plan);
        if (safePlan) {
          const cleaned = sanitizePlanForNoFasting(safePlan, planOptions.fasting);
          setDailyPlan(cleaned);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_DAILY);
    }
  }, [planOptions.fasting]);

  const persistPlan = (plan: DailyPlan) => {
    try {
      localStorage.setItem(STORAGE_DAILY, JSON.stringify({ version: 2, plan }));
    } catch {
      // ignore
    }
  };

  const clearPlan = () => {
    setDailyPlan(null);
    setErrorDaily(null);
    setEditMode(false);
    setDraftPlan(null);
    localStorage.removeItem(STORAGE_DAILY);
  };

  const handleGenerateDaily = async () => {
    setErrorDaily(null);
    if (!metrics) {
      setErrorDaily('لا توجد بيانات مستخدم. ارجع للحاسبة وعبّي البيانات أولاً.');
      return;
    }
    if (editMode) {
      setErrorDaily('أوقف وضع التعديل أولاً (حفظ أو إلغاء) ثم أعد التوليد.');
      return;
    }

    setLoadingDaily(true);
    const myReqId = ++reqIdRef.current;

    try {
      const planUnknown = await generateAIDailyPlan(metrics, hasCalories ? targetCalories : undefined, planOptions);
      if (myReqId !== reqIdRef.current) return;

      const safePlan = ensureSafePlanStructure(planUnknown);
      if (!safePlan) {
        throw new Error('بيانات الخطة المُستلمة غير صالحة.');
      }

      const fixed = recalcPlan(safePlan);
      const finalPlan = sanitizePlanForNoFasting(fixed, planOptions.fasting);

      setDailyPlan(finalPlan);
      persistPlan(finalPlan);
    } catch (err: any) {
      if (myReqId !== reqIdRef.current) return;
      setErrorDaily(err?.message || 'حدث خطأ أثناء توليد الخطة اليومية.');
    } finally {
      if (myReqId === reqIdRef.current) setLoadingDaily(false);
    }
  };

  const shownPlan = editMode ? draftPlan : dailyPlan;

  const handleExportPdf = async () => {
    setExportError(null);
    if (!metrics || !shownPlan) return;

    setExporting(true);
    try {
      await exportDailyPlanPdf({
        plan: shownPlan,
        metrics,
        targetCalories: hasCalories ? targetCalories : undefined,
        options: planOptions,
        fileName: `خطة-يومية-${new Date().toISOString().slice(0, 10)}.pdf`,
        onProgress: ({ stage, current, total }) =>
          setExportStep(stage === 'render' ? `${current}/${total}` : ''),
      });
    } catch (err: any) {
      setExportError(err?.message || 'حدث خطأ أثناء تصدير PDF.');
    } finally {
      setExporting(false);
      setExportStep('');
    }
  };

  const updateMeal = (key: string, nextMeal: DailyMeal) => {
    const target = editMode ? draftPlan : dailyPlan;
    if (!target) return;

    const next = recalcPlan({ ...target, [key]: nextMeal } as DailyPlan);
    const cleanedNext = sanitizePlanForNoFasting(next, planOptions.fasting);
    if (editMode) {
      setDraftPlan(cleanedNext);
    } else {
      setDailyPlan(cleanedNext);
      persistPlan(cleanedNext);
    }
  };

  const updateMealItem = (mealKey: string, idx: number, patch: Partial<DailyMealItem>) => {
    const target = editMode ? draftPlan : dailyPlan;
    if (!target) return;

    const meal = (target as any)[mealKey];
    if (!meal || !meal.items) return;

    const nextItems = meal.items.map((it: any, i: number) => (i === idx ? { ...it, ...patch } : it));
    const nextMeal = recalcMeal({ ...meal, items: nextItems });
    updateMeal(mealKey, nextMeal);
  };

  const addMealItem = (mealKey: string) => {
    const target = editMode ? draftPlan : dailyPlan;
    if (!target) return;

    const meal = (target as any)[mealKey];
    if (!meal || !meal.items) return;

    const nextItems = [...meal.items, { name: '', quantity: '', calories: 0, protein: 0, carbs: 0, fat: 0 }];
    const nextMeal = recalcMeal({ ...meal, items: nextItems });
    updateMeal(mealKey, nextMeal);
  };

  const removeMealItem = (mealKey: string, idx: number) => {
    const target = editMode ? draftPlan : dailyPlan;
    if (!target) return;

    const meal = (target as any)[mealKey];
    if (!meal || !meal.items) return;

    const nextItems = meal.items.filter((_: any, i: number) => i !== idx);
    const nextMeal = recalcMeal({ ...meal, items: nextItems });
    updateMeal(mealKey, nextMeal);
  };

  return (
    <div className="py-12 bg-white min-h-screen w-full overflow-x-hidden" dir="rtl">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">خطط التغذية الذكية</h2>
          <p className="text-gray-600 mt-2">اختر الخيارات ثم اضغط توليد الخطة اليومية</p>
        </div>

        <UserMetricsCard metrics={metrics} targetCalories={targetCalories} hasCalories={hasCalories} />

        <OptionsForm options={planOptions} onChangeOptions={setPlanOptions} />

        <MacroProgressCard plan={shownPlan} targetCalories={targetCalories} hasCalories={hasCalories} />

        <PlanActionsBar
          metrics={metrics}
          loadingDaily={loadingDaily}
          dailyPlan={dailyPlan}
          editMode={editMode}
          exporting={exporting}
          exportStep={exportStep}
          shownPlan={shownPlan}
          onGenerateDaily={handleGenerateDaily}
          onClearPlan={clearPlan}
          onExportPdf={handleExportPdf}
          onStartEdit={() => {
            if (dailyPlan) {
              setDraftPlan(dailyPlan);
              setEditMode(true);
            }
          }}
          onCancelEdit={() => setEditMode(false)}
          onSaveEdit={() => {
            if (!draftPlan) return;
            const fixed = recalcPlan(draftPlan);
            const finalPlan = sanitizePlanForNoFasting(fixed, planOptions.fasting);
            setDailyPlan(finalPlan);
            persistPlan(finalPlan);
            setDraftPlan(null);
            setEditMode(false);
          }}
        />

        {errorDaily && <p className="text-red-600 mb-4">{errorDaily}</p>}
        {exportError && <p className="text-red-600 mb-4">{exportError}</p>}

        {shownPlan && typeof shownPlan === 'object' && (
          <div className="grid gap-6 w-full max-w-full overflow-hidden">
            {Object.entries(shownPlan)
              .filter(([key, value]: [string, any]) => {
                return (
                  key !== 'totalCalories' &&
                  key !== 'advice' &&
                  value &&
                  typeof value === 'object' &&
                  Array.isArray(value.items)
                );
              })
              .map(([mealKey, meal]: [string, any]) => (
                <div key={mealKey} className="w-full overflow-x-auto">
                  <DailyMealTable
                    mealKey={mealKey}
                    meal={meal}
                    editMode={editMode}
                    planOptions={planOptions}
                    onItemChange={(idx, patch) => updateMealItem(mealKey, idx, patch)}
                    onAddItem={() => addMealItem(mealKey)}
                    onRemoveItem={(idx) => removeMealItem(mealKey, idx)}
                    onMealSwap={(nextMeal) => updateMeal(mealKey, nextMeal)}
                  />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;