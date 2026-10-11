// src/components/exercises/ExerciseSummaryCard.tsx
import React from 'react';
import type { ExerciseEntry } from '../../types/exercise';

interface ExerciseSummaryCardProps {
  exercises: ExerciseEntry[];
}

export const ExerciseSummaryCard: React.FC<ExerciseSummaryCardProps> = ({ exercises }) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  
  // تصفية تمارين اليوم
  const todayExercises = exercises.filter((ex) => ex.date === todayStr);
  const totalCaloriesToday = todayExercises.reduce((acc, item) => acc + item.caloriesBurned, 0);
  const totalMinutesToday = todayExercises.reduce((acc, item) => acc + item.durationMinutes, 0);

  // إحصائيات الأسبوع الحالي (آخر 7 أيام)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weeklyExercises = exercises.filter((ex) => new Date(ex.date) >= sevenDaysAgo);
  const totalCaloriesWeekly = weeklyExercises.reduce((acc, item) => acc + item.caloriesBurned, 0);
  const totalMinutesWeekly = weeklyExercises.reduce((acc, item) => acc + item.durationMinutes, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" dir="rtl">
      {/* ملخص اليوم */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs font-bold px-3 py-1 bg-amber-50 text-amber-700 rounded-full">نشاط اليوم</span>
          <h3 className="text-xl font-black text-gray-900 mt-2">🔥 {Math.round(totalCaloriesToday)} سعرة</h3>
          <p className="text-xs text-gray-500 mt-1">إجمالي وقت التمرين: {totalMinutesToday} دقيقة</p>
        </div>
        <div className="text-4xl">⚡</div>
      </div>

      {/* ملخص الأسبوع */}
      <div className="bg-white p-6 rounded-3xl border shadow-sm flex justify-between items-center">
        <div>
          <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">إحصائيات آخر 7 أيام</span>
          <h3 className="text-xl font-black text-gray-900 mt-2">📊 {Math.round(totalCaloriesWeekly)} سعرة</h3>
          <p className="text-xs text-gray-500 mt-1">إجمالي الدقائق: {totalMinutesWeekly} دقيقة ({weeklyExercises.length} تمارين)</p>
        </div>
        <div className="text-4xl">📈</div>
      </div>
    </div>
  );
};