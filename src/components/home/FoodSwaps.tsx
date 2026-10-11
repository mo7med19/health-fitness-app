import React, { useState, useMemo } from 'react';
import { SWAPS } from '../../data/homeData';

export const FoodSwaps: React.FC = () => {
  const [swapBase, setSwapBase] = useState(SWAPS[0]?.base ?? '');
  const selectedSwaps = useMemo(() => SWAPS.find((s) => s.base === swapBase)?.swaps ?? [], [swapBase]);

  return (
    <section id="swaps" className="py-16 bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8 items-start">
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2">بدائل الطعام</h3>
          <p className="text-sm text-gray-600 mb-4">اختر مكوّن وشوف بدائل تناسب هدفك.</p>
          <select value={swapBase} onChange={(e) => setSwapBase(e.target.value)} className="w-full px-4 py-3 border rounded-2xl outline-none">
            {SWAPS.map((s) => (<option key={s.base} value={s.base}>{s.base}</option>))}
          </select>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border shadow-sm overflow-x-auto">
          <table className="w-full text-sm border rounded-2xl overflow-hidden">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="text-right p-3 border-b">البديل</th>
                <th className="text-right p-3 border-b">الكمية</th>
                <th className="text-right p-3 border-b">السعرات</th>
                <th className="text-right p-3 border-b">بروتين</th>
              </tr>
            </thead>
            <tbody>
              {selectedSwaps.map((it, idx) => (
                <tr key={idx} className="text-gray-700">
                  <td className="p-3 border-b font-semibold">{it.name}</td>
                  <td className="p-3 border-b">{it.quantity}</td>
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