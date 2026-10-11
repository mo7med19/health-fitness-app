// src/components/Diary.tsx
import React, { useState } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { CalculatorResults } from '../types';

interface FoodEntry {
  id: string;
  mealType: 'فطور' | 'غداء' | 'عشاء' | 'سناك';
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

const STORAGE_DIARY = 'userFoodDiary_v1';
const STORAGE_WATER = 'userWaterCups_v1';

const Diary: React.FC = () => {
  const [entries, setEntries] = useLocalStorageState<FoodEntry[]>(STORAGE_DIARY, []);
  const [waterCups, setWaterCups] = useLocalStorageState<number>(STORAGE_WATER, 0);
  const [calc] = useLocalStorageState<CalculatorResults | null>('calculatorResults', null);

  const targetCalories = Number(calc?.targetCalories) || 2000;
  const targetProtein = Number(calc?.macros?.protein) || 150;
  const targetCarbs = Number(calc?.macros?.carbs) || 200;
  const targetFat = Number(calc?.macros?.fats) || 65;
  const targetWaterCups = 8; // الهدف المقترح 8 أكواب يومياً

  const [mealType, setMealType] = useState<FoodEntry['mealType']>('فطور');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState<string | null>(null);

  // حساب المجاميع الفعلية
  const totalCalories = entries.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = entries.reduce((acc, item) => acc + item.protein, 0);
  const totalCarbs = entries.reduce((acc, item) => acc + item.carbs, 0);
  const totalFat = entries.reduce((acc, item) => acc + item.fat, 0);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const calsNum = parseFloat(calories);
    if (!trimmedName || !Number.isFinite(calsNum) || calsNum < 0) {
      setError('يرجى إدخال اسم الوجبة والسعرات بشكل صحيح.');
      return;
    }

    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      mealType,
      name: trimmedName,
      calories: calsNum,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    };

    setEntries([newEntry, ...entries]);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter((item) => item.id !== id));
  };

  const calculatePercentage = (current: number, target: number) => {
    if (target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">مفكرة السعرات والمياه اليومية</h2>
          <p className="text-gray-600 mt-2">سجّل ما تتناوله وتابع ترطيب جسمك وسعراتك بدقة</p>
        </div>

        {/* قسم تتبع شرب الماء */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              💧 متعقب شرب الماء اليومي
            </h3>
            <p className="text-xs text-gray-500 mt-1">الهدف المقترح: 8 أكواب (2 لتر) يومياً</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setWaterCups((prev) => Math.max(0, prev - 1))}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl flex items-center justify-center transition-colors"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-2xl font-black text-cyan-600">{waterCups}</span>
              <span className="text-xs text-gray-400 block">من {targetWaterCups} أكواب</span>
            </div>
            <button
              onClick={() => setWaterCups((prev) => prev + 1)}
              className="w-10 h-10 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-2xl flex items-center justify-center transition-colors shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        {/* لوحة المؤشرات وأشرطة التقدم */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm mb-8 grid md:grid-cols-4 gap-6">
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>السعرات</span>
              <span>{Math.round(totalCalories)} / {Math.round(targetCalories)}</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full transition-all" style={{ width: `${calculatePercentage(totalCalories, targetCalories)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>البروتين</span>
              <span>{Math.round(totalProtein)}g / {Math.round(targetProtein)}g</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full transition-all" style={{ width: `${calculatePercentage(totalProtein, targetProtein)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>الكارب</span>
              <span>{Math.round(totalCarbs)}g / {Math.round(targetCarbs)}g</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full transition-all" style={{ width: `${calculatePercentage(totalCarbs, targetCarbs)}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>الدهون</span>
              <span>{Math.round(totalFat)}g / {Math.round(targetFat)}g</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full transition-all" style={{ width: `${calculatePercentage(totalFat, targetFat)}%` }}></div>
            </div>
          </div>
        </div>

        {/* نموذج إضافة وجبة */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">إضافة وجبة للمفكرة</h3>
          <form onSubmit={handleAddEntry} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">نوع الوجبة</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value as any)}
                className="w-full px-3 py-2.5 border rounded-2xl outline-none text-sm"
              >
                <option value="فطور">فطور</option>
                <option value="غداء">غداء</option>
                <option value="عشاء">عشاء</option>
                <option value="سناك">سناك</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">اسم الوجبة/المكون</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: صدر دجاج مشوي"
                className="w-full px-3 py-2.5 border rounded-2xl outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">السعرات (كعكال)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="300"
                className="w-full px-3 py-2.5 border rounded-2xl outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">بروتين (g)</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="30"
                className="w-full px-3 py-2.5 border rounded-2xl outline-none text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                إضافة
              </button>
            </div>
          </form>
          {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
        </div>

        {/* جدول الوجبات المسجلة */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">الوجبات المسجلة اليوم</h3>
          {entries.length === 0 ? (
            <p className="text-gray-500 text-center py-6">لم تقم بتسجيل أي وجبة اليوم بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-2xl overflow-hidden">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-right p-3 border-b">الوجبة</th>
                    <th className="text-right p-3 border-b">المكون</th>
                    <th className="text-right p-3 border-b">السعرات</th>
                    <th className="text-right p-3 border-b">بروتين</th>
                    <th className="text-right p-3 border-b">كارب</th>
                    <th className="text-right p-3 border-b">دهون</th>
                    <th className="text-center p-3 border-b">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((item) => (
                    <tr key={item.id} className="text-gray-700 border-b hover:bg-gray-50">
                      <td className="p-3 font-bold text-emerald-800">{item.mealType}</td>
                      <td className="p-3">{item.name}</td>
                      <td className="p-3">{item.calories}</td>
                      <td className="p-3">{item.protein}g</td>
                      <td className="p-3">{item.carbs}g</td>
                      <td className="p-3">{item.fat}g</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
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
      </div>
    </div>
  );
};

export default Diary;