// src/components/home/SuccessStories.tsx
import React from 'react';

export const SuccessStories: React.FC = () => {
  const stories = [
    { name: 'محمد أحمد', achievement: 'خسارة 12 كجم في 3 أشهر', quote: 'التنظيم والالتزام بالوجبات غيّر حياتي وصحتي تماماً.' },
    { name: 'سارة خالد', achievement: 'زيادة الكتلة العضلية', quote: 'فهم السعرات والماكروز ساعدني أبني عضلات بشكل صحي وسليم.' },
    { name: 'عمر فاروق', achievement: 'التخلص من الثبات وزيادة النشاط', quote: 'متعقب التمارين والخطط الذكية سهلت عليّ المتابعة يومياً.' },
  ];

  return (
    <section className="py-16 bg-white border-t max-w-7xl mx-auto px-4 w-full" dir="rtl">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">قصص نجاح المشتركين</h2>
        <p className="text-gray-600 mt-2">نماذج حقيقية لإنجازات رائعة عبر الالتزام بالخطط.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {stories.map((s, idx) => (
          <div key={idx} className="p-6 bg-gray-50 rounded-3xl border shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {s.achievement}
              </span>
              <p className="text-gray-700 text-sm mt-4 italic">"{s.quote}"</p>
            </div>
            <div className="mt-6 font-bold text-gray-900 text-sm border-t pt-3">
              — {s.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};