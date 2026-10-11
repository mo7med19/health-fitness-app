// src/components/plans/OptionsForm.tsx
import React from 'react';
import type { PlanOptions } from '../../types';

interface OptionsFormProps {
  options: PlanOptions;
  onChangeOptions: (options: PlanOptions) => void;
}

export const OptionsForm: React.FC<OptionsFormProps> = ({ options, onChangeOptions }) => {
  const handleChange = (field: keyof PlanOptions, value: any) => {
    onChangeOptions({ ...options, [field]: value });
  };

  const handleArrayToggle = (field: 'excludedFoods' | 'allergies', item: string) => {
    const currentList = options[field] || [];
    const exists = currentList.includes(item);
    const updated = exists
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];
    handleChange(field, updated);
  };

  const commonAllergies = ['حليب / لاكتوز', 'بيض', 'مكسرات', 'سمك / مأكولات بحرية', 'قمح / جلوتين', 'صويا'];
  const commonExclusions = ['لحم أحمر', 'دجاج', 'أسماك', 'فول صويا', 'ألبان', 'باذنجان'];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-8 shadow-sm" dir="rtl">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>⚙️</span> خيارات وتخصيص الخطة اليومية
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* أسلوب الحمية */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">أسلوب الحمية</label>
          <select
            value={options.dietStyle || 'balanced'}
            onChange={(e) => handleChange('dietStyle', e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="balanced">متوازن (Balanced)</option>
            <option value="keto">كيتو (Keto)</option>
            <option value="low_carb">منخفض الكارب (Low Carb)</option>
            <option value="high_protein">عالي البروتين (High Protein)</option>
            <option value="vegetarian">نباتي (Vegetarian)</option>
          </select>
        </div>

        {/* عدد الوجبات */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">عدد الوجبات اليومية</label>
          <select
            value={options.mealsPerDay || 4}
            onChange={(e) => handleChange('mealsPerDay', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value={3}>3 وجبات</option>
            <option value={4}>4 وجبات (فطور، غداء، عشاء، سناك)</option>
            <option value={5}>5 وجبات</option>
          </select>
        </div>

        {/* نظام الصيام */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">نظام الصيام</label>
          <select
            value={options.fasting || 'none'}
            onChange={(e) => handleChange('fasting', e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="none">بدون صيام</option>
            <option value="16_8">صيام متقطع (16/8)</option>
            <option value="ramadan">صيام رمضان</option>
          </select>
        </div>

        {/* الميزانية */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">الميزانية المقترحة</label>
          <select
            value={options.budget || 'mid'}
            onChange={(e) => handleChange('budget', e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="low">اقتصادية جداً</option>
            <option value="mid">متوسطة ومناسبة</option>

          </select>
        </div>

        {/* وقت التحضير */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">وقت التحضير المتاح</label>
          <select
            value={options.prepTime || 'normal'}
            onChange={(e) => handleChange('prepTime', e.target.value)}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="quick">سريع (أقل من 15 دقيقة)</option>
            <option value="normal">عادي (15 - 30 دقيقة)</option>
          </select>
        </div>

        {/* يوم تمرين */}
        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="trainingToday"
            checked={!!options.trainingToday}
            onChange={(e) => handleChange('trainingToday', e.target.checked)}
            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
          />
          <label htmlFor="trainingToday" className="text-sm font-bold text-gray-700 cursor-pointer">
            يوجد تمرين رياضي اليوم 💪
          </label>
        </div>
      </div>

      {/* الحساسية الغذائية */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <label className="block text-sm font-bold text-gray-800 mb-3">⚠️ الحساسية الغذائية (حدد ما تنطبق عليك)</label>
        <div className="flex flex-wrap gap-2">
          {commonAllergies.map((allergy) => {
            const selected = (options.allergies || []).includes(allergy);
            return (
              <button
                key={allergy}
                type="button"
                onClick={() => handleArrayToggle('allergies', allergy)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selected
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selected ? '✓ ' : ''}{allergy}
              </button>
            );
          })}
        </div>
      </div>

      {/* الأطعمة المستبعدة */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <label className="block text-sm font-bold text-gray-800 mb-3">🚫 أطعمة تفضل استبعادها</label>
        <div className="flex flex-wrap gap-2">
          {commonExclusions.map((food) => {
            const selected = (options.excludedFoods || []).includes(food);
            return (
              <button
                key={food}
                type="button"
                onClick={() => handleArrayToggle('excludedFoods', food)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  selected
                    ? 'bg-amber-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selected ? '✓ ' : ''}{food}
              </button>
            );
          })}
        </div>
      </div>

      {/* ملاحظات إضافية */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <label className="block text-sm font-bold text-gray-800 mb-2">📝 ملاحظات إضافية للذكاء الاصطناعي</label>
        <textarea
          value={options.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="مثال: أؤفضل وجبة الفطور أن تكون خفيفة جداً، وأحب تناول الشوفان..."
          className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 h-20 resize-none"
        />
      </div>
    </div>
  );
};