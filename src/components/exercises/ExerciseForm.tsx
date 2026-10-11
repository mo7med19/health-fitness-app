// src/components/exercises/ExerciseForm.tsx
import React, { useState, useEffect } from 'react';
import type { ExerciseEntry, ExerciseCategory } from '../../types/exercise';

interface ExerciseFormProps {
  onSave: (exercise: Omit<ExerciseEntry, 'id' | 'date'>) => void;
  editingExercise?: ExerciseEntry | null;
  onCancelEdit?: () => void;
}

export const ExerciseForm: React.FC<ExerciseFormProps> = ({ onSave, editingExercise, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExerciseCategory>('كارديو');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [error, setError] = useState<string | null>(null);

  // جلب وزن المستخدم من الـ LocalStorage لحساب السعرات التقديرية
  const getUserWeight = (): number => {
    try {
      const draft = localStorage.getItem('userMetricsDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed?.weight) return Number(parsed.weight);
      }
    } catch {
      // ignore
    }
    return 70; // وزن افتراضي في حال لم يتم إدخال الوزن
  };

  useEffect(() => {
    if (editingExercise) {
      setName(editingExercise.name);
      setCategory(editingExercise.category);
      setDuration(editingExercise.durationMinutes.toString());
      setCalories(editingExercise.caloriesBurned.toString());
    }
  }, [editingExercise]);

  // حاسبة تقديرية للسعرات المحروقة بناءً على النشاط والوزن والمدة
  const handleEstimateCalories = () => {
    const dur = parseInt(duration);
    if (!Number.isFinite(dur) || dur <= 0) {
      setError('يرجى إدخال المدة بالدقائق أولاً لحساب السعرات تقديرياً.');
      return;
    }
    setError(null);
    const weight = getUserWeight();
    
    // معدلات تقريبية لحرق السعرات لكل دقيقة بناءً على النوع والوزن
    let factor = 0.08; // افتراضي
    if (category === 'كارديو') factor = 0.12;
    else if (category === 'تمارين مقاومة') factor = 0.09;
    else if (category === 'مشي') factor = 0.06;
    else if (category === 'سباحة ورياضات أخرى') factor = 0.11;

    const estimated = Math.round(dur * weight * factor);
    setCalories(estimated.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const durationNum = parseInt(duration);
    const caloriesNum = parseFloat(calories);

    if (!trimmedName || !Number.isFinite(durationNum) || durationNum <= 0 || !Number.isFinite(caloriesNum) || caloriesNum < 0) {
      setError('يرجى إدخال اسم التمرين، المدة، والسعرات المحروقة بشكل صحيح.');
      return;
    }

    onSave({
      name: trimmedName,
      category,
      durationMinutes: durationNum,
      caloriesBurned: caloriesNum,
    });

    setName('');
    setDuration('');
    setCalories('');
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <div className="bg-white p-6 rounded-3xl border shadow-sm mb-8" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {editingExercise ? '✏️ تعديل التمرين' : '➕ إضافة تمرين جديد'}
        </h3>
        {editingExercise && (
          <button onClick={onCancelEdit} className="text-xs text-gray-500 hover:text-gray-700 font-bold">
            إلغاء التعديل
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">نوع النشاط</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
            className="w-full px-3 py-2.5 border rounded-2xl outline-none text-sm bg-white"
          >
            <option value="كارديو">كارديو (جري/دراجة)</option>
            <option value="تمارين مقاومة">تمارين مقاومة (حديد)</option>
            <option value="مشي">مشي خفيف</option>
            <option value="سباحة ورياضات أخرى">سباحة ورياضات أخرى</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">اسم التمرين / الوصف</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: جري سريع على المشاية"
            className="w-full px-3 py-2.5 border rounded-2xl outline-none text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">المدة (بالدقائق)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="30"
            className="w-full px-3 py-2.5 border rounded-2xl outline-none text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium text-gray-700">السعرات المحروقة</label>
            <button
              type="button"
              onClick={handleEstimateCalories}
              className="text-[10px] text-emerald-600 font-bold hover:underline"
              title="حساب تقديري بناءً على الوزن والمدة"
            >
              حساب ذكي 🤖
            </button>
          </div>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="250"
            className="w-full px-3 py-2.5 border rounded-2xl outline-none text-sm"
          />
        </div>

        <div className="md:col-span-5 flex justify-end gap-2 mt-2">
          {editingExercise && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-colors shadow-sm"
          >
            {editingExercise ? 'حفظ التعديلات' : 'إضافة التمرين للقائمة'}
          </button>
        </div>
      </form>
      {error && <p className="text-red-600 text-xs mt-3">{error}</p>}
    </div>
  );
};