// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-100 py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center pb-8 border-b border-gray-50">
          
          {/* شعار ونبذة عن المنصة */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-xl shadow-xs">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-emerald-800 tracking-tight">صحتي</span>
            </div>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              منصتك المتكاملة لتتبع الصحة، السعرات الحرارية، التمارين الرياضية، والوصول للهدف الصحي بكل سهولة ودقة.
            </p>
          </div>
          
          {/* روابط سريعة */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-600 font-medium">
            <a href="#" className="hover:text-emerald-600 transition-colors">عن المنصة</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">الشروط والأحكام</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">اتصل بنا</a>
          </div>

          {/* حقوق النشر */}
          <div className="text-sm text-gray-400 text-center md:text-left">
            © {new Date().getFullYear()} جميع الحقوق محفوظة لـ <span className="font-bold text-emerald-700">صحتي</span>.
          </div>

        </div>
        
        {/* التنبيه الطبي */}
        <div className="mt-8 text-center text-[11px] text-gray-400 max-w-3xl mx-auto leading-relaxed">
          تنبيه: المعلومات المقدمة عبر هذا التطبيق هي للأغراض التثقيفية والتحفيزية فقط ولا تغني عن استشارة الطبيب المختص أو أخصائي التغذية المعتمد[cite: 12].
        </div>
      </div>
    </footer>
  );
};

export default Footer;