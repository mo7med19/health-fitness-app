import React from 'react';

export const QuickNavCards: React.FC<{ onScrollTo: (id: string) => void }> = ({ onScrollTo }) => {
  const cards = [
    { id: 'lookup', title: 'قاموس غذائي', desc: 'ابحث عن مكوّن واعرف قيمه.' },
    { id: 'snacks', title: 'سناك ذكي', desc: 'أفكار سناك حسب هدفك.' },
    { id: 'mistakes', title: 'أخطاء شائعة', desc: 'أخطاء تسبب ثبات أو زيادة.' },
    { id: 'mealofday', title: 'وجبة اليوم', desc: 'وجبة جاهزة مع الماكروز.' },
  ];

  return (
    <section className="py-12 bg-white max-w-7xl mx-auto px-4 w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">أقسام تساعدك بسرعة</h2>
        <div className="mt-4 w-20 h-1 bg-emerald-500 mx-auto rounded-full"></div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => onScrollTo(c.id)}
            className="text-right p-5 bg-gray-50 rounded-2xl border hover:shadow-lg transition-all"
          >
            <div className="font-extrabold text-gray-900">{c.title}</div>
            <div className="text-sm text-gray-600 mt-1">{c.desc}</div>
          </button>
        ))}
      </div>
    </section>
  );
};