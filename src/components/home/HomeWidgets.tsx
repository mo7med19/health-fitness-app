// src/components/home/HomeWidgets.tsx
import React, { useState } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';

export const HomeWidgets: React.FC = () => {
  // حاسبة BMI السريعة
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiResult, setBmiResult] = useState<{ value: number; status: string; color: string } | null>(null);

  const calculateBmi = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(bmiWeight);
    const hCm = parseFloat(bmiHeight);
    if (!w || !hCm || w <= 0 || hCm <= 0) return;

    const hM = hCm / 100;
    const val = Number((w / (hM * hM)).toFixed(1));
    let status = 'وزن صحي';
    let color = 'text-emerald-600 bg-emerald-50';

    if (val < 18.5) {
      status = 'نحافة';
      color = 'text-blue-600 bg-blue-50';
    } else if (val >= 25 && val < 30) {
      status = 'زيادة وزن';
      color = 'text-amber-600 bg-amber-50';
    } else if (val >= 30) {
      status = 'سمنة';
      color = 'text-red-600 bg-red-50';
    }

    setBmiResult({ value: val, status, color });
  };

  // متعقب الماء اليومي
  const [waterGlasses, setWaterGlasses] = useLocalStorageState<number>('dailyWaterTracker_v1', 0);
  const targetGlasses = 8;

  return (
    <section className="py-12 bg-gray-50 border-t max-w-7xl mx-auto px-4 w-full" dir="rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* أداة حساب مؤشر كتلة الجسم السريعة */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2">⚖️ احسب مؤشر كتلة الجسم (BMI)</h3>
          <p className="text-sm text-gray-600 mb-4">تعرف على تقييم وزنك الحالي فوراً.</p>
          
          <form onSubmit={calculateBmi} className="grid grid-cols-2 gap-3 mb-4">
            <input
              type="number"
              value={bmiWeight}
              onChange={(e) => setBmiWeight(e.target.value)}
              placeholder="الوزن (كجم)"
              className="px-4 py-2.5 border rounded-2xl outline-none text-sm"
            />
            <input
              type="number"
              value={bmiHeight}
              onChange={(e) => setBmiHeight(e.target.value)}
              placeholder="الطول (سم)"
              className="px-4 py-2.5 border rounded-2xl outline-none text-sm"
            />
            <button
              type="submit"
              className="col-span-2 py-2.5 bg-emerald-600 text-white font-bold rounded-2xl text-sm hover:bg-emerald-700 transition-colors"
            >
              احسب مؤشرك الآن
            </button>
          </form>

          {bmiResult && (
            <div className={`p-3 rounded-2xl text-center font-bold text-sm ${bmiResult.color}`}>
              النتيجة: {bmiResult.value} ({bmiResult.status})
            </div>
          )}
        </div>

        {/* أداة تتبع شرب الماء */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">💧 متعقب شرب الماء اليومي</h3>
            <p className="text-sm text-gray-600 mb-4">حافظ على ترطيب جسمك (الهدف: 8 أكواب يومياً).</p>
          </div>

          <div className="text-center my-auto">
            <div className="text-3xl font-black text-blue-600 mb-2">
              {waterGlasses} / {targetGlasses} أكواب
            </div>
            <div className="flex justify-center gap-2 flex-wrap mb-4">
              {Array.from({ length: targetGlasses }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setWaterGlasses(idx < waterGlasses ? idx : idx + 1)}
                  className={`w-8 h-10 rounded-xl border transition-all ${
                    idx < waterGlasses ? 'bg-blue-500 border-blue-600 text-white' : 'bg-gray-100 border-gray-200'
                  }`}
                  title={`كوب ${idx + 1}`}
                >
                  💧
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>اشرب كاباً كل ساعتين</span>
            <button
              onClick={() => setWaterGlasses(0)}
              className="text-red-500 hover:underline font-bold"
            >
              إعادة العداد
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};