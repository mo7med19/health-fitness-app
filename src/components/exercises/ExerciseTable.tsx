// src/components/exercises/ExerciseTable.tsx
import React, { useState } from 'react';
import type { ExerciseEntry, ExerciseCategory } from '../../types/exercise';

interface ExerciseTableProps {
  exercises: ExerciseEntry[];
  onDelete: (id: string) => void;
  onEdit: (exercise: ExerciseEntry) => void;
}

export const ExerciseTable: React.FC<ExerciseTableProps> = ({ exercises, onDelete, onEdit }) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all'); // 'all' | 'today'

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredExercises = exercises.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesDate = filterDate === 'all' || item.date === todayStr;
    return matchesCategory && matchesDate;
  });

  return (
    <div className="bg-white p-6 rounded-3xl border shadow-sm" dir="rtl">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h3 className="text-lg font-bold text-gray-900">سجل التمارين الرياضية</h3>

        {/* فلاتر البحث والتصفية */}
        <div className="flex flex-wrap gap-2">
          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 border rounded-xl text-xs bg-gray-50 outline-none"
          >
            <option value="all">كل الأيام</option>
            <option value="today">تمارين اليوم فقط</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 border rounded-xl text-xs bg-gray-50 outline-none"
          >
            <option value="all">جميع الأنواع</option>
            <option value="كارديو">كارديو</option>
            <option value="تمارين مقاومة">تمارين مقاومة</option>
            <option value="مشي">مشي</option>
            <option value="سباحة ورياضات أخرى">سباحة ورياضات أخرى</option>
          </select>
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <p className="text-gray-500 text-center py-8">لا توجد تمارين مطابقة للخيارات المحددة.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border rounded-2xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-right p-3 border-b">التاريخ</th>
                <th className="text-right p-3 border-b">النوع</th>
                <th className="text-right p-3 border-b">التمرين</th>
                <th className="text-right p-3 border-b">المدة</th>
                <th className="text-right p-3 border-b">السعرات المحروقة</th>
                <th className="text-center p-3 border-b">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredExercises.map((item) => (
                <tr key={item.id} className="text-gray-700 border-b hover:bg-gray-50">
                  <td className="p-3 text-xs text-gray-500">{item.date}</td>
                  <td className="p-3 font-bold text-emerald-800">{item.category}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.durationMinutes} دقيقة</td>
                  <td className="p-3 font-bold text-amber-600">🔥 {item.caloriesBurned} سعرة</td>
                  <td className="p-3 text-center flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs px-3 py-1 rounded-full bg-red-50 border border-red-100"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};