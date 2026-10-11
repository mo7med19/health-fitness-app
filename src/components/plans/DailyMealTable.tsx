// src/components/plans/DailyMealTable.tsx
import React, { useState } from 'react';
import type { DailyMeal, DailyMealItem, PlanOptions } from '../../types';
import { suggestMealAlternative, swapFullMeal, type MealAlternativeResponse } from '../../services/geminiService';
import { AlternativeRow } from './AlternativeRow';

type MealKey = string;

interface DailyMealTableProps {
  mealKey: MealKey;
  meal: DailyMeal;
  editMode: boolean;
  planOptions?: PlanOptions;
  onItemChange: (idx: number, patch: Partial<DailyMealItem>) => void;
  onAddItem: () => void;
  onRemoveItem: (idx: number) => void;
  onMealSwap?: (newMeal: DailyMeal) => void;
}

export const DailyMealTable: React.FC<DailyMealTableProps> = ({
  mealKey,
  meal,
  editMode,
  planOptions,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onMealSwap,
}) => {
  const [swappingIdx, setSwappingIdx] = useState<number | null>(null);
  const [swapLoading, setSwapLoading] = useState(false);
  const [alternative, setAlternative] = useState<MealAlternativeResponse | null>(null);
  const [fullMealSwapping, setFullMealSwapping] = useState(false);

  // حماية آمنة لمصفوفة العناصر لضمان عدم انهيار التطبيق أبداً
  const items = Array.isArray(meal?.items) ? meal.items : [];

  const handleSwapFullMeal = async () => {
    if (!onMealSwap) return;
    setFullMealSwapping(true);
    try {
      const res = await swapFullMeal(
        mealKey as any,
        meal?.name || 'وجبة',
        meal?.totalCalories || 0,
        planOptions
      );
      onMealSwap({
        name: res.name,
        time: res.time || meal?.time,
        totalCalories: res.totalCalories,
        totalProtein: res.totalProtein,
        totalCarbs: res.totalCarbs,
        totalFat: res.totalFat,
        items: res.items,
      });
    } catch (err: any) {
      alert(err?.message || 'فشل استبدال الوجبة.');
    } finally {
      setFullMealSwapping(false);
    }
  };

  const handleRequestAlternative = async (idx: number, item: DailyMealItem) => {
    setSwappingIdx(idx);
    setSwapLoading(true);
    try {
      const res = await suggestMealAlternative(
        item.name,
        item.calories,
        item.protein,
        item.carbs,
        item.fat,
        planOptions?.allergies || [],
        planOptions?.excludedFoods || []
      );
      setAlternative(res);
    } catch {
      alert('تعذر جلب بديل حالياً. حاول لاحقاً.');
      setSwappingIdx(null);
    } finally {
      setSwapLoading(false);
    }
  };

  const applyAlternative = (idx: number) => {
    if (!alternative) return;
    onItemChange(idx, {
      name: alternative.alternativeMealName,
      ...(alternative.quantity ? { quantity: alternative.quantity } : {}),
      calories: alternative.calories,
      protein: alternative.protein,
      carbs: alternative.carbs,
      fat: alternative.fat,
    });
    setSwappingIdx(null);
    setAlternative(null);
  };

  return (
    <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm" dir="rtl">
      {/* رأس الوجبة */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h5 className="font-bold text-gray-900 text-base">{meal?.name || 'وجبة'}</h5>
            {meal?.time && <span className="text-xs text-gray-500">⏰ {meal.time}</span>}
          </div>

          {!editMode && (
            <button
              type="button"
              onClick={handleSwapFullMeal}
              disabled={fullMealSwapping}
              className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors disabled:opacity-50"
            >
              {fullMealSwapping ? '⏳ جاري استبدال الوجبة...' : '🔄 استبدال الوجبة بالكامل'}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-semibold bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            إجمالي الوجبة: {Math.round(meal?.totalCalories || 0)} سعرة
          </span>
          {editMode && (
            <button
              type="button"
              onClick={onAddItem}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
            >
              + إضافة مكوّن
            </button>
          )}
        </div>
      </div>

      {/* جدول العناصر */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
          <thead className="bg-gray-50">
            <tr className="text-gray-700">
              <th className="text-right p-2 border-b">المكوّن</th>
              <th className="text-right p-2 border-b">الكمية</th>
              <th className="text-right p-2 border-b">السعرات</th>
              <th className="text-right p-2 border-b">البروتين</th>
              <th className="text-right p-2 border-b">الكربوهيدرات</th>
              <th className="text-right p-2 border-b">الدهون</th>
              <th className="text-center p-2 border-b">الخيارات الذكية</th>
              {editMode && <th className="text-center p-2 border-b">حذف</th>}
            </tr>
          </thead>

          <tbody>
            {items.map((it, idx) => (
              <React.Fragment key={idx}>
                <tr className="text-gray-700 hover:bg-gray-50/50 transition-colors">
                  <td className="p-2 border-b font-medium">
                    {!editMode ? (
                      it.name
                    ) : (
                      <input
                        value={it.name}
                        onChange={(e) => onItemChange(idx, { name: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1"
                        placeholder="اسم المكوّن"
                      />
                    )}
                  </td>

                  <td className="p-2 border-b text-gray-500">
                    {!editMode ? (
                      it.quantity
                    ) : (
                      <input
                        value={it.quantity}
                        onChange={(e) => onItemChange(idx, { quantity: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1"
                        placeholder="مثال: 150g"
                      />
                    )}
                  </td>

                  <td className="p-2 border-b">
                    {!editMode ? (
                      Math.round(it.calories)
                    ) : (
                      <input
                        type="number"
                        value={it.calories}
                        onChange={(e) => onItemChange(idx, { calories: Number(e.target.value) })}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1"
                      />
                    )}
                  </td>

                  <td className="p-2 border-b">
                    {!editMode ? (
                      Math.round(it.protein)
                    ) : (
                      <input
                        type="number"
                        value={it.protein}
                        onChange={(e) => onItemChange(idx, { protein: Number(e.target.value) })}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1"
                      />
                    )}
                  </td>

                  <td className="p-2 border-b">
                    {!editMode ? (
                      Math.round(it.carbs)
                    ) : (
                      <input
                        type="number"
                        value={it.carbs}
                        onChange={(e) => onItemChange(idx, { carbs: Number(e.target.value) })}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1"
                      />
                    )}
                  </td>

                  <td className="p-2 border-b">
                    {!editMode ? (
                      Math.round(it.fat)
                    ) : (
                      <input
                        type="number"
                        value={it.fat}
                        onChange={(e) => onItemChange(idx, { fat: Number(e.target.value) })}
                        className="w-20 border border-gray-200 rounded-lg px-2 py-1"
                      />
                    )}
                  </td>

                  <td className="p-2 border-b text-center">
                    <button
                      type="button"
                      onClick={() => handleRequestAlternative(idx, it)}
                      disabled={swapLoading && swappingIdx === idx}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      {swapLoading && swappingIdx === idx ? 'جاري البحث...' : '✨ بديل ذكي'}
                    </button>
                  </td>

                  {editMode && (
                    <td className="p-2 border-b text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveItem(idx)}
                        className="p-1 text-red-500 hover:text-red-700 text-sm"
                        title="حذف"
                      >
                        🗑
                      </button>
                    </td>
                  )}
                </tr>

                {swappingIdx === idx && alternative && (
                  <AlternativeRow
                    alternative={alternative}
                    colSpan={editMode ? 8 : 7}
                    onApply={() => applyAlternative(idx)}
                    onCancel={() => {
                      setSwappingIdx(null);
                      setAlternative(null);
                    }}
                  />
                )}
              </React.Fragment>
            ))}

            <tr className="font-bold text-gray-900 bg-gray-50">
              <td className="p-2" colSpan={2}>
                إجمالي الوجبة
              </td>
              <td className="p-2">{Math.round(meal?.totalCalories || 0)}</td>
              <td className="p-2">{Math.round(meal?.totalProtein || 0)}</td>
              <td className="p-2">{Math.round(meal?.totalCarbs || 0)}</td>
              <td className="p-2">{Math.round(meal?.totalFat || 0)}</td>
              <td className="p-2" />
              {editMode && <td className="p-2" />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};