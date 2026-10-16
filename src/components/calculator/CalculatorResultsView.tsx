// src/components/calculator/CalculatorResultsView.tsx
import React from 'react';
import type { CalculatorResults } from '../../types';

interface CalculatorResultsViewProps {
  safeResults: CalculatorResults | null;
  onGeneratePdf: () => void;
  onNavigateToPlans?: () => void; // دالة انتقالية اختيارية للتحكم بالصفحات
}

export const CalculatorResultsView: React.FC<CalculatorResultsViewProps> = ({
  safeResults,
  onGeneratePdf,
  onNavigateToPlans,
}) => {
  if (!safeResults) {
    return (
      <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 p-12 rounded-3xl flex flex-col items-center justify-center text-center" dir="rtl">
        <div className="bg-white p-4 rounded-full mb-4 shadow-sm text-emerald-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-emerald-900 font-bold text-lg">بانتظار إدخال البيانات</h3>
        <p className="text-emerald-600/80 text-sm mt-2">املأ النموذج في الجانب لتظهر لك تحليلاتك الغذائية الكاملة هنا.</p>
      </div>
    );
  }

  const maxMacro = Math.max(safeResults.macros.protein, safeResults.macros.carbs, safeResults.macros.fats);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 transition-all" dir="rtl">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </span>
        نتائجك الغذائية المخصصة
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <KpiCard label="السعرات المستهدفة" value={safeResults.targetCalories} suffix="سعرة حرارية / يوم" />
        <KpiCard label="معدل الأيض الأساسي (BMR)" value={safeResults.bmr} suffix="سعرة في الراحة التامة" />
      </div>

      <div className="space-y-4">
        <p className="font-bold text-gray-800 text-sm">توزيع المغذيات الكبرى (الماكروز):</p>
        <MacroRow label="البروتين" amount={safeResults.macros.protein} color="bg-orange-500" icon="🥩" max={maxMacro} />
        <MacroRow label="الكربوهيدرات" amount={safeResults.macros.carbs} color="bg-blue-500" icon="🍚" max={maxMacro} />
        <MacroRow label="الدهون الصحية" amount={safeResults.macros.fats} color="bg-yellow-500" icon="🥑" max={maxMacro} />
      </div>

      <div className="mt-8 p-4 bg-emerald-50 rounded-2xl text-emerald-800 text-sm border border-emerald-100">
        <p className="font-bold mb-1 flex items-center gap-1"><span>💡</span> نصيحة احترافية لهدفك:</p>
        <p>الالتزام بكمية البروتين وتوزيع وجباتك بانتظام هو العامل الأساسي لضمان نجاح خطتك البدنية.</p>
      </div>

      {/* زر الانتقال المباشر لصفحة الخطط الغذائية */}
      <button
        onClick={() => {
          if (onNavigateToPlans) {
            onNavigateToPlans();
          } else {
            // طريقة افتراضية للتنقل في حال عدم وجود راوتر معرف مسبقاً
            window.location.hash = '#plans';
          }
        }}
        className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors mt-6 shadow-md shadow-emerald-200 cursor-pointer flex items-center justify-center gap-2"
      >
        <span>✨</span> الانتقال لتوليد خطة الوجبات بناءً على نتائجك
      </button>

      <button
        onClick={onGeneratePdf}
        className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors mt-3 shadow-md shadow-blue-100 cursor-pointer flex items-center justify-center gap-2"
      >
        <span>📥</span> تصدير التقرير كملف PDF
      </button>
    </div>
  );
};

const KpiCard: React.FC<{ label: string; value: number; suffix: string }> = ({ label, value, suffix }) => (
  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
    <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
    <p className="text-2xl font-black text-emerald-600">{value}</p>
    <p className="text-[10px] text-gray-400 mt-0.5">{suffix}</p>
  </div>
);

const MacroRow: React.FC<{ label: string; amount: number; color: string; icon: string; max: number }> = ({ label, amount, color, icon, max }) => (
  <div className="flex items-center gap-4">
    <div className="text-xl w-6 text-center">{icon}</div>
    <div className="flex-grow">
      <div className="flex justify-between text-xs mb-1 font-semibold">
        <span className="text-gray-700">{label}</span>
        <span className="text-gray-600 font-bold">{amount} جرام</span>
      </div>
      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${Math.round((amount / (max || 1)) * 100)}%` }} />
      </div>
    </div>
  </div>
);