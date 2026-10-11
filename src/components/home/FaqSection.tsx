import React, { useState } from 'react';
import { FAQS } from '../../data/homeData';

export const FaqSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 bg-white border-t max-w-4xl mx-auto px-4 w-full">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">أسئلة وأجوبة</h2>
        <p className="text-gray-600 mt-2">أشهر الأسئلة وإجاباتها بشكل واضح.</p>
      </div>
      <div className="space-y-3">
        {FAQS.map((f, idx) => (
          <div key={idx} className="rounded-3xl border bg-gray-50 overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex justify-between px-6 py-5 font-bold text-gray-900">
              <span>{f.q}</span>
              <span className="text-emerald-700">{openFaq === idx ? '−' : '+'}</span>
            </button>
            {openFaq === idx && <div className="px-6 pb-6 text-gray-700 text-sm">{f.a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
};