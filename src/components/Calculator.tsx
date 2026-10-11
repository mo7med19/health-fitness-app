// src/components/Calculator.tsx
import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import type { UserMetrics, UserMetricsDraft, CalculatorResults } from '../types';
import { ActivityLevel, Gender, Goal } from '../types';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { calculateNutrition } from '../domain/nutrition';

type FieldErrors = Partial<Record<keyof UserMetricsDraft, string>>;

const DEFAULT_DRAFT: UserMetricsDraft = {
  name: '',
  age: '',
  weight: '',
  height: '',
  gender: Gender.MALE,
  activityLevel: ActivityLevel.SEDENTARY,
  goal: Goal.MAINTAIN,
};

function validate(draft: UserMetricsDraft): FieldErrors {
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

function parseMetrics(draft: UserMetricsDraft): UserMetrics | null {
  const errors = validate(draft);
  if (Object.keys(errors).length > 0) return null;

  return {
    name: (draft.name ?? '').trim(),
    age: Number(draft.age),
    weight: Number(draft.weight),
    height: Number(draft.height),
    gender: draft.gender ?? Gender.MALE,
    activityLevel: draft.activityLevel ?? ActivityLevel.SEDENTARY,
    goal: draft.goal ?? Goal.MAINTAIN,
  };
}

const Calculator: React.FC = () => {
  const [draft, setDraft] = useLocalStorageState<UserMetricsDraft>('userMetricsDraft', DEFAULT_DRAFT);
  const [results, setResults] = useLocalStorageState<CalculatorResults | null>('calculatorResults', null);
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => validate(draft), [draft]);
  const canCalculate = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const calculate = async () => {
    const metrics = parseMetrics(draft);
    if (!metrics) return;

    setLoading(true);
    try {
      const computed = calculateNutrition(metrics as any);
      setResults(computed);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDraft(DEFAULT_DRAFT);
    setResults(null);
  };

  const generatePDF = () => {
    if (!results) return;

    const doc = new jsPDF();

    doc.setFont('helvetica');
    doc.setFontSize(16);

    // Header
    doc.setFillColor(46, 204, 113);
    doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
    doc.setTextColor(255);
    doc.text('Personalized Nutrition Summary', 20, 20);

    // Body
    doc.setTextColor(0);
    doc.setFontSize(12);

    const line = (y: number, label: string, value: string) => {
      doc.text(label, 20, y);
      doc.text(value, 110, y);
    };

    line(45, 'Name', (draft.name ?? '').trim());
    line(55, 'Age', `${draft.age ?? ''}`);
    line(65, 'Weight', `${draft.weight ?? ''} kg`);
    line(75, 'Height', `${draft.height ?? ''} cm`);
    line(85, 'Gender', String(draft.gender ?? ''));
    line(95, 'Activity Level', String(draft.activityLevel ?? ''));
    line(105, 'Goal', String(draft.goal ?? ''));

    doc.setFontSize(13);
    doc.text('Results', 20, 125);
    doc.setFontSize(12);

    line(140, 'BMR', `${results.bmr} kcal`);
    line(150, 'TDEE', `${results.tdee} kcal`);
    line(160, 'Target Calories', `${results.targetCalories} kcal/day`);

    line(175, 'Protein', `${results.macros.protein} g/day`);
    line(185, 'Carbs', `${results.macros.carbs} g/day`);
    line(195, 'Fats', `${results.macros.fats} g/day`);

    doc.setTextColor(120);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 280);

    doc.save('nutrition-summary.pdf');
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">حاسبة السعرات والماكروز</h1>
          <p className="text-gray-600 mt-2">أدخل بياناتك للحصول على تقرير تفصيلي باحتياجك اليومي</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Form */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <Field
              label="الاسم"
              error={errors.name}
              input={
                <input
                  type="text"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                  placeholder="أدخل اسمك"
                />
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="العمر"
                error={errors.age}
                input={
                  <input
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={120}
                    value={draft.age}
                    onChange={(e) => setDraft({ ...draft, age: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                }
              />

              <Field
                label="الجنس"
                input={
                  <select
                    value={draft.gender}
                    onChange={(e) => setDraft({ ...draft, gender: e.target.value as UserMetricsDraft['gender'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value={Gender.MALE}>ذكر</option>
                    <option value={Gender.FEMALE}>أنثى</option>
                  </select>
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="الوزن (كجم)"
                error={errors.weight}
                input={
                  <input
                    type="number"
                    inputMode="decimal"
                    min={20}
                    max={350}
                    value={draft.weight}
                    onChange={(e) => setDraft({ ...draft, weight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                }
              />

              <Field
                label="الطول (سم)"
                error={errors.height}
                input={
                  <input
                    type="number"
                    inputMode="decimal"
                    min={90}
                    max={250}
                    value={draft.height}
                    onChange={(e) => setDraft({ ...draft, height: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                }
              />
            </div>

            <Field
              label="مستوى النشاط"
              input={
                <select
                  value={draft.activityLevel}
                  onChange={(e) => setDraft({ ...draft, activityLevel: e.target.value as UserMetricsDraft['activityLevel'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value={ActivityLevel.SEDENTARY}>خامل (قليل الحركة)</option>
                  <option value={ActivityLevel.LIGHT}>نشاط خفيف (1-3 أيام/أسبوع)</option>
                  <option value={ActivityLevel.MODERATE}>نشاط متوسط (3-5 أيام/أسبوع)</option>
                  <option value={ActivityLevel.ACTIVE}>نشاط عالي (تمرين daily)</option>
                  <option value={ActivityLevel.VERY_ACTIVE}>نشاط مكثف جداً (تمارين شاقة يومياً)</option>
                </select>
              }
            />

            <Field
              label="الهدف"
              input={
                <div className="grid grid-cols-3 gap-2">
                  <GoalButton
                    active={draft.goal === Goal.LOSE}
                    onClick={() => setDraft({ ...draft, goal: Goal.LOSE })}
                  >
                    خسارة وزن
                  </GoalButton>
                  <GoalButton
                    active={draft.goal === Goal.MAINTAIN}
                    onClick={() => setDraft({ ...draft, goal: Goal.MAINTAIN })}
                  >
                    محافظة
                  </GoalButton>
                  <GoalButton
                    active={draft.goal === Goal.GAIN}
                    onClick={() => setDraft({ ...draft, goal: Goal.GAIN })}
                  >
                    زيادة وزن
                  </GoalButton>
                </div>
              }
            />

            <button
              onClick={calculate}
              disabled={!canCalculate || loading}
              className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-50"
            >
              {loading ? 'جاري الحساب...' : 'حساب النتائج'}
            </button>

            <button
              onClick={resetForm}
              className="w-full py-4 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
            >
              إعادة ضبط
            </button>

            {!canCalculate && (
              <p className="text-xs text-gray-500 text-center">
                عبّي الحقول المطلوبة لتفعيل زر الحساب.
              </p>
            )}
          </div>

          {/* Results */}
          <div className="space-y-6">
            {!results ? (
              <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 p-12 rounded-3xl flex flex-col items-center justify-center text-center">
                <div className="bg-white p-4 rounded-full mb-4 shadow-sm text-emerald-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-emerald-800 font-bold text-lg">بانتظار البيانات</h3>
                <p className="text-emerald-600/70 text-sm mt-2">أكمل النموذج لرؤية نتائجك الدقيقة</p>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  نتائجك المخصصة
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <KpiCard label="السعرات المستهدفة" value={results.targetCalories} suffix="سعرة / يوم" />
                  <KpiCard label="معدل الأيض (BMR)" value={results.bmr} suffix="سعرة بدون حركة" />
                </div>

                <div className="space-y-4">
                  <p className="font-bold text-gray-800 text-sm">توزيع المغذيات الكبرى (الماكروز):</p>
                  <MacroRow label="البروتين" amount={results.macros.protein} color="bg-orange-500" icon="🍗" max={maxMacro(results)} />
                  <MacroRow label="الكربوهيدرات" amount={results.macros.carbs} color="bg-blue-500" icon="🍚" max={maxMacro(results)} />
                  <MacroRow label="الدهون" amount={results.macros.fats} color="bg-yellow-500" icon="🥑" max={maxMacro(results)} />
                </div>

                <div className="mt-8 p-4 bg-emerald-50 rounded-2xl text-emerald-800 text-sm">
                  <p className="font-bold mb-1">نصيحة سريعة 💡</p>
                  <p>احرص على شرب كميات كافية من الماء واجعل أولوية التغذية للبروتين لتحقيق هدفك.</p>
                </div>

                <button
                  onClick={generatePDF}
                  className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors mt-6 shadow-md shadow-blue-100"
                >
                  تصدير النتائج كملف PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Field: React.FC<{ label: string; error?: string; input: React.ReactNode }> = ({ label, error, input }) => (
  <div className="space-y-2">
    <div className="flex items-end justify-between gap-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {error ? <span className="text-xs text-red-600 font-semibold">{error}</span> : null}
    </div>
    {input}
  </div>
);

const GoalButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
      active ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-700 hover:border-emerald-300'
    }`}
  >
    {children}
  </button>
);

const KpiCard: React.FC<{ label: string; value: number; suffix: string }> = ({ label, value, suffix }) => (
  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
    <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
    <p className="text-2xl font-black text-emerald-600">{value}</p>
    <p className="text-[10px] text-gray-400 mt-0.5">{suffix}</p>
  </div>
);

function maxMacro(results: CalculatorResults) {
  return Math.max(results.macros.protein, results.macros.carbs, results.macros.fats);
}

const MacroRow: React.FC<{ label: string; amount: number; color: string; icon: string; max: number }> = ({ label, amount, color, icon, max }) => (
  <div className="flex items-center gap-4">
    <div className="text-xl w-6 text-center">{icon}</div>
    <div className="flex-grow">
      <div className="flex justify-between text-xs mb-1 font-semibold">
        <span>{label}</span>
        <span className="text-gray-500">{amount} جرام</span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${Math.round((amount / (max || 1)) * 100)}%` }} />
      </div>
    </div>
  </div>
);

export default Calculator;