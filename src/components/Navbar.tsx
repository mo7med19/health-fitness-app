// src/components/Navbar.tsx
import React, { useState } from 'react';

export type PageType = 'home' | 'calculator' | 'plans' | 'progress' | 'diary' | 'food-db' | 'exercises';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

interface NavItem {
  id: PageType;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'الرئيسية', icon: '🏠' },
  { id: 'calculator', label: 'الآلة الحاسبة', icon: '🧮' },
  { id: 'plans', label: 'الخطط الغذائية', icon: '🥗' },
  { id: 'progress', label: 'تتبع الوزن', icon: '📈' },
  { id: 'diary', label: 'المفكرة اليومية', icon: '📖' },
  { id: 'food-db', label: 'مكتبة الأغذية', icon: '🍎' },
  { id: 'exercises', label: 'التمارين الرياضية', icon: '💪' },
];

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (page: PageType) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* الشعار واسم التطبيق */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('home')}>
            <div className="bg-emerald-600 p-2 rounded-xl shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-emerald-800">صحتي</span>
          </div>

          {/* روابط التنقل للشاشات الكبيرة (باستخدام الـ map) */}
          <div className="hidden lg:flex space-x-reverse space-x-3 text-sm">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'text-emerald-700 bg-emerald-50 font-bold shadow-xs'
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* زر قائمة الموبايل */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 p-2 rounded-xl hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>

        </div>

        {/* قائمة التنقل المنسدلة للموبايل */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-4 space-y-1.5 pt-2 border-t border-gray-100 animate-fadeIn">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-3 w-full text-right px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    isActive 
                      ? 'text-emerald-700 bg-emerald-50 font-bold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;