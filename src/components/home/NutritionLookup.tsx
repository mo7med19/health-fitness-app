// src/components/home/NutritionLookup.tsx
import React, { useState, useMemo } from 'react';
import { NUTRITION_DB } from '../../data/homeData';

export const NutritionLookup: React.FC = () => {
  const [foodQuery, setFoodQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'calories' | 'protein'>('default');

  const results = useMemo(() => {
    const q = foodQuery.trim().toLowerCase();
    let filtered = !q ? [...NUTRITION_DB] : NUTRITION_DB.filter((x) => x.name.toLowerCase().includes(q));
    
    if (sortBy === 'calories') {
      filtered.sort((a, b) => a.calories - b.calories);
    } else if (sortBy === 'protein') {
      filtered.sort((a, b) => b.protein - a.protein);
    }

    return filtered.slice(0, 12);
  }, [foodQuery, sortBy]);

  return (
    <section id="lookup" className="py-16 bg-gray-50 border-t" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8 items-start">
        <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">قاموس غذائي</h3>
            <p className="text-sm text-gray-600">اكتب اسم المكوّن واعرف السعرات والماكروز.</p>
          </div>
          <input
            value={foodQuery}
            onChange={(e) => setFoodQuery(e.target.value)}
            placeholder="مثال: بيض، دجاج، رز..."
            className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ترتيب النتائج حسب:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-xl text-sm bg-gray-50 outline-none"
            >
              <option value="default">الافتراضي</option>
              <option value="calories">الأقل سعرات حرارية</option>
              <option value="protein">الأعلى بروتين</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm border rounded-2xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-right p-3 border-b">المكوّن</th>
                <th className="text-right p-3 border-b">الحصة</th>
                <th className="text-right p-3 border-b">السعرات</th>
                <th className="text-right p-3 border-b">بروتين</th>
              </tr>
            </thead>
            <tbody>
              {results.map((it, idx) => (
                <tr key={idx} className="text-gray-700 hover:bg-gray-50">
                  <td className="p-3 border-b font-semibold">{it.name}</td>
                  <td className="p-3 border-b">{it.serving}</td>
                  <td className="p-3 border-b">{it.calories}</td>
                  <td className="p-3 border-b">{it.protein}g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};