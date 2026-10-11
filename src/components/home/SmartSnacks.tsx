import React, { useState, useMemo } from 'react';
import { SNACKS, Snack } from '../../data/homeData';

export const SmartSnacks: React.FC = () => {
  const [category, setCategory] = useState<Snack['category'] | 'الكل'>('الكل');

  const filtered = useMemo(() => {
    return category === 'الكل' ? SNACKS : SNACKS.filter((s) => s.category === category);
  }, [category]);

  return (
    <section id="snacks" className="py-16 bg-white border-t max-w-7xl mx-auto px-4 w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">سناك ذكي</h2>
        <p className="text-gray-600 mt-2">اختار نوع السناك المناسب لك بسرعة.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map((s, idx) => (
          <div key={idx} className="p-6 bg-gray-50 rounded-3xl border hover:shadow-xl transition-all">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-extrabold text-gray-900">{s.title}</h3>
              <span className="text-xs px-2 py-1 bg-white border rounded-full text-gray-600">{s.category}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white rounded-xl border p-2"><div className="text-[10px] text-gray-500">سعرات</div><div className="text-sm font-extrabold text-emerald-700">{s.calories}</div></div>
              <div className="bg-white rounded-xl border p-2"><div className="text-[10px] text-gray-500">بروتين</div><div className="text-sm font-extrabold text-emerald-700">{s.protein}g</div></div>
              <div className="bg-white rounded-xl border p-2"><div className="text-[10px] text-gray-500">كارب</div><div className="text-sm font-extrabold text-emerald-700">{s.carbs}g</div></div>
              <div className="bg-white rounded-xl border p-2"><div className="text-[10px] text-gray-500">دهون</div><div className="text-sm font-extrabold text-emerald-700">{s.fat}g</div></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};