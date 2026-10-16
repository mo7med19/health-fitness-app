// src/components/calculator/CalculatorForm.tsx
import React from 'react';
import type { UserMetricsDraft } from '../../types';
import { Gender, ActivityLevel, Goal } from '../../types';

interface CalculatorFormProps {
  draft: UserMetricsDraft;
  errors: Partial<Record<keyof UserMetricsDraft, string>>;
  canCalculate: boolean;
  loading: boolean;
  onChange: (draft: UserMetricsDraft) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  draft,
  errors,
  canCalculate,
  loading,
  onChange,
  onCalculate,
  onReset,
}) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6" dir="rtl">
      <Field label="الاسم الكريم" error={errors.name}>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800"
          placeholder="أدخل اسمك"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="العمر" error={errors.age}>
          <input
            type="number"
            inputMode="numeric"
            min={5}
            max={120}
            value={draft.age}
            onChange={(e) => onChange({ ...draft, age: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="سنوات"
          />
        </Field>

        <Field label="الجنس">
          <select
            value={draft.gender}
            onChange={(e) => onChange({ ...draft, gender: e.target.value as Gender })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          >
            <option value={Gender.MALE}>ذكر</option>
            <option value={Gender.FEMALE}>أنثى</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="الوزن (كجم)" error={errors.weight}>
          <input
            type="number"
            inputMode="decimal"
            min={20}
            max={350}
            value={draft.weight}
            onChange={(e) => onChange({ ...draft, weight: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="كجم"
          />
        </Field>

        <Field label="الطول (سم)" error={errors.height}>
          <input
            type="number"
            inputMode="decimal"
            min={90}
            max={250}
            value={draft.height}
            onChange={(e) => onChange({ ...draft, height: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="سم"
          />
        </Field>
      </div>

      <Field label="مستوى النشاط اليومي">
        <select
          value={draft.activityLevel}
          onChange={(e) => onChange({ ...draft, activityLevel: e.target.value as ActivityLevel })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
        >
          <option value={ActivityLevel.SEDENTARY}>خامل (قليل أو بدون تمارين)</option>
          <option value={ActivityLevel.LIGHT}>نشاط خفيف (1-3 أيام أسبوعياً)</option>
          <option value={ActivityLevel.MODERATE}>نشاط متوسط (3-5 أيام أسبوعياً)</option>
          <option value={ActivityLevel.ACTIVE}>نشاط عالي (6-7 أيام أسبوعياً)</option>
          <option value={ActivityLevel.VERY_ACTIVE}>نشاط مكثف جداً (تمارين شاقة يومياً)</option>
        </select>
      </Field>

      <Field label="الهدف الأساسي">
        <div className="grid grid-cols-3 gap-2">
          <GoalButton active={draft.goal === Goal.LOSE} onClick={() => onChange({ ...draft, goal: Goal.LOSE })}>
            خسارة الوزن
          </GoalButton>
          <GoalButton active={draft.goal === Goal.MAINTAIN} onClick={() => onChange({ ...draft, goal: Goal.MAINTAIN })}>
            محافظة
          </GoalButton>
          <GoalButton active={draft.goal === Goal.GAIN} onClick={() => onChange({ ...draft, goal: Goal.GAIN })}>
            زيادة وزن
          </GoalButton>
        </div>
      </Field>

      <button
        onClick={onCalculate}
        disabled={!canCalculate || loading}
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'جاري حساب السعرات والماكروز...' : 'احسب النتائج بدقة'}
      </button>

      <button
        onClick={onReset}
        className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 transition-colors cursor-pointer"
      >
        إعادة ضبط الحقول
      </button>

      {!canCalculate && (
        <p className="text-xs text-rose-500 text-center font-medium">
          يرجى إكمال جميع الحقول بشكل صحيح لتفعيل الحساب.
        </p>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div className="space-y-2">
    <div className="flex items-end justify-between gap-3">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {error ? <span className="text-xs text-rose-600 font-semibold">{error}</span> : null}
    </div>
    {children}
  </div>
);

const GoalButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`py-3 px-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
      active ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100' : 'bg-white text-gray-700 hover:border-emerald-300'
    }`}
  >
    {children}
  </button>
);