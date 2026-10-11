// src/components/plans/MacroProgressCard.tsx
import React from 'react';
import type { DailyPlan } from '../../types';

interface MacroProgressCardProps {
  plan: DailyPlan | null;
  targetCalories: number;
  hasCalories: boolean;
}

export const MacroProgressCard: React.FC<MacroProgressCardProps> = ({ plan, targetCalories, hasCalories }) => {
  let totalCals = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  if (plan) {
    Object.entries(plan).forEach(([key, value]: [string, any]) => {
      if (key !== 'totalCalories' && key !== 'advice' && value && typeof value === 'object') {
        totalCals += Number(value.totalCalories || 0);
        totalProtein += Number(value.totalProtein || 0);
        totalCarbs += Number(value.totalCarbs || 0);
        totalFat += Number(value.totalFat || 0);
      }
    });
  }

  const goalCals = hasCalories ? targetCalories : 2000;
  const calsPercent = goalCals > 0 ? Math.min(Math.round((totalCals / goalCals) * 100), 100) : 0;

  return (
    <div className="mb-8 rounded-3xl border border-gray-100 p-6 bg-white shadow-sm" dir="rtl">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 ملخص الأهداف والماكروز اليومي</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex justify-between text-sm mb-1 font-semibold text-gray-700">
            <span>السعرات الحرارية</span>
            <span>{Math.round(totalCals)} / {Math.round(goalCals)} سعرة</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${calsPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex justify-between text-sm mb-1 font-semibold text-gray-700">
            <span>البروتين</span>
            <span>{Math.round(totalProtein)} جم</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: '70%' }}></div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex justify-between text-sm mb-1 font-semibold text-gray-700">
            <span>الكربوهيدرات</span>
            <span>{Math.round(totalCarbs)} جم</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-2.5 rounded-full transition-all duration-300" style={{ width: '65%' }}></div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex justify-between text-sm mb-1 font-semibold text-gray-700">
            <span>الدهون</span>
            <span>{Math.round(totalFat)} جم</span>
          </div>
          <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};