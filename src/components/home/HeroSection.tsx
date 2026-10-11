// src/components/home/HeroSection.tsx
import React from 'react';

interface HeroSectionProps {
  onNavigate: (page: 'home' | 'calculator' | 'plans') => void;
  onScrollTo: (id: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, onScrollTo }) => {
  const quickLinks = [
    { id: 'lookup', label: 'قاموس غذائي' },
    { id: 'snacks', label: 'سناك ذكي' },
    { id: 'mistakes', label: 'أخطاء شائعة' },
    { id: 'mealofday', label: 'وجبة اليوم' },
    { id: 'swaps', label: 'بدائل الطعام' },
    { id: 'faq', label: 'أسئلة وأجوبة' },
  ];

  return (
    <section className="relative bg-gradient-to-br from-emerald-800 to-emerald-600 text-white overflow-hidden py-20 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center relative z-10 gap-12">
        
        <div className="md:w-1/2 space-y-6 text-center md:text-right">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            ابدأ رحلتك نحو <span className="text-emerald-200 underline decoration-emerald-400/50">صحة أفضل</span> اليوم
          </h1>
          
          <p className="text-lg md:text-xl text-emerald-50 max-w-lg leading-relaxed">
            أدوات ذكية، خطط وجبات مخصصة، متعقب للتمارين، وبدائل صحية تساعدك توصل لهدفك بسهولة وبشكل علمي دقيق.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
            <button 
              onClick={() => onNavigate('calculator')} 
              className="px-8 py-3.5 bg-white text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              احسب احتياجاتك الآن
            </button>
            <button 
              onClick={() => onNavigate('plans')} 
              className="px-8 py-3.5 border-2 border-white/80 text-white font-bold rounded-2xl hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              استكشف الخطط الذكية
            </button>
          </div>

          {/* إحصائيات مصغرة للثقة */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-center md:text-right">
            <div>
              <div className="text-xl font-black text-white">100%</div>
              <div className="text-xs text-emerald-200">مخصص لوزنك وهدفك</div>
            </div>
            <div>
              <div className="text-xl font-black text-white">ذكاء اصطناعي</div>
              <div className="text-xs text-emerald-200">لتوليد الخطط الفورية</div>
            </div>
            <div>
              <div className="text-xl font-black text-white">مجاني وسهل</div>
              <div className="text-xs text-emerald-200">بدون تعقيد</div>
            </div>
          </div>

          {/* روابط التنقل السريع */}
          <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
            {quickLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => onScrollTo(item.id)}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs border border-white/20 transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* قسم الصورة مع بطاقة عائمة تحفيزية */}
        <div className="md:w-1/2 flex justify-center relative">
          <div className="relative">
            <img 
              src="/j.png" 
              alt="Healthy food" 
              className="rounded-3xl shadow-2xl border-8 border-white/20 object-cover w-72 h-72 md:w-96 md:h-96 relative z-10" 
            />
            {/* بطاقة عائمة تفاعلية تزيد من حيوية التصميم */}
            <div className="absolute -bottom-6 -right-6 bg-white text-gray-900 p-4 rounded-2xl shadow-xl border z-20 flex items-center gap-3 animate-bounce">
              <span className="text-2xl">💪</span>
              <div>
                <div className="text-xs font-bold text-gray-500">حالة التمارين</div>
                <div className="text-sm font-black text-emerald-600">جاهز لتحقيق هدفك اليوم!</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};