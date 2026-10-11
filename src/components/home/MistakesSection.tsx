import React from 'react';
import { MISTAKES } from '../../data/homeData';

export const MistakesSection: React.FC = () => (
  <section id="mistakes" className="py-16 bg-gray-50 border-t">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">أخطاء شائعة</h2>
        <p className="text-gray-600 mt-2">أشياء بسيطة ممكن تضيّع تعبك… وتقدر تصلحها بسهولة.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {MISTAKES.map((m, idx) => (
          <div key={idx} className="p-6 bg-white rounded-3xl border shadow-sm">
            <h3 className="text-lg font-extrabold text-gray-900 mb-2">{m.title}</h3>
            <p className="text-sm text-gray-700 mb-3"><span className="font-bold">السبب:</span> {m.why}</p>
            <p className="p-3 bg-emerald-50 text-emerald-900 rounded-2xl text-sm font-semibold"><span className="font-bold">الحل:</span> {m.fix}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);