// src/components/FoodDatabase.tsx
import React, { useState, useMemo } from 'react';
import { INITIAL_FOODS, FoodItem } from '../data/foodDatabase';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

const STORAGE_DIARY = 'userFoodDiary_v1';

const FoodDatabase: React.FC = () => {
  const [foods] = useState<FoodItem[]>(INITIAL_FOODS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [sortBy, setSortBy] = useState<'default' | 'calories' | 'protein'>('default');
  const [selectedMealType, setSelectedMealType] = useState<string>('غداء');
  const [portions, setPortions] = useState<{ [key: string]: number }>({});
  
  const [, setDiaryEntries] = useLocalStorageState<any[]>(STORAGE_DIARY, []);
  const [notification, setNotification] = useState<string | null>(null);

  const categories = ['الكل', 'بروتين', 'كربوهيدرات', 'فواكه وخضار', 'دهون ومكسرات', 'مشروبات'];

  const filteredFoods = useMemo(() => {
    let result = foods.filter((food) => {
      const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'الكل' || food.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (sortBy === 'calories') {
      result.sort((a, b) => a.calories - b.calories);
    } else if (sortBy === 'protein') {
      result.sort((a, b) => b.protein - a.protein);
    }

    return result;
  }, [foods, searchQuery, selectedCategory, sortBy]);

  const handlePortionChange = (id: string, val: number) => {
    setPortions((prev) => ({ ...prev, [id]: val > 0 ? val : 1 }));
  };

  const handleAddToDiary = (food: FoodItem) => {
    const mult = portions[food.id] || 1;
    const newEntry = {
      id: Date.now().toString(),
      mealType: selectedMealType,
      name: `${food.name} (${mult}x ${food.serving})`,
      calories: Math.round(food.calories * mult),
      protein: Math.round(food.protein * mult),
      carbs: Math.round(food.carbs * mult),
      fat: Math.round(food.fat * mult),
    };

    setDiaryEntries((prev) => [newEntry, ...prev]);
    setNotification(`تمت إضافة "${food.name}" إلى المفكرة (${selectedMealType}) بنجاح!`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">مكتبة الأغذية والبحث السريع</h2>
          <p className="text-gray-600 mt-2">ابحث عن الأطعمة، حدد الحصص، وأضفها لمفكرتك حسب الوجبة المناسبة</p>
        </div>

        {notification && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center font-medium shadow-sm">
            {notification}
          </div>
        )}

        {/* شريط البحث، الفلاتر والخيارات */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن طعام (مثل: دجاج، أرز، موز)..."
              className="w-full md:w-1/3 px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            
            {/* اختيار نوع الوجبة للاستهدف */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-gray-700 whitespace-nowrap">إضافة إلى:</span>
              <select
                value={selectedMealType}
                onChange={(e) => setSelectedMealType(e.target.value)}
                className="px-4 py-2.5 border rounded-2xl text-sm bg-gray-50 outline-none w-full"
              >
                <option value="فطور">فطور</option>
                <option value="غداء">غداء</option>
                <option value="عشاء">عشاء</option>
                <option value="سناك">سناك</option>
              </select>
            </div>

            {/* ترتيب النتائج */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-bold text-gray-700 whitespace-nowrap">الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2.5 border rounded-2xl text-sm bg-gray-50 outline-none w-full"
              >
                <option value="default">الافتراضي</option>
                <option value="calories">الأقل سعرات</option>
                <option value="protein">الأعلى بروتين</option>
              </select>
            </div>
          </div>

          {/* فئات التصنيف */}
          <div className="flex flex-wrap gap-2 justify-center pt-2 border-t">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* شبكة الأغذية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredFoods.map((food) => {
            const mult = portions[food.id] || 1;
            return (
              <div key={food.id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{food.name}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                      {food.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">الحصة الأساسية: {food.serving}</p>
                  
                  {/* تحديد عدد الحصص */}
                  <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-2xl mb-3 text-xs">
                    <span className="font-bold text-gray-700">عدد الحصص:</span>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={mult}
                      onChange={(e) => handlePortionChange(food.id, parseFloat(e.target.value) || 1)}
                      className="w-16 px-2 py-1 border rounded-xl text-center bg-white outline-none font-bold"
                    />
                  </div>

                  {/* القيم الغذائية محسوبة بناءً على الحصص */}
                  <div className="grid grid-cols-4 gap-1 text-center bg-emerald-50/50 border border-emerald-100 p-3 rounded-2xl mb-4 text-xs">
                    <div>
                      <div className="text-gray-400 text-[10px]">سعرات</div>
                      <div className="font-bold text-gray-900">{Math.round(food.calories * mult)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">بروتين</div>
                      <div className="font-bold text-blue-600">{Math.round(food.protein * mult)}g</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">كارب</div>
                      <div className="font-bold text-amber-600">{Math.round(food.carbs * mult)}g</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-[10px]">دهون</div>
                      <div className="font-bold text-purple-600">{Math.round(food.fat * mult)}g</div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToDiary(food)}
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-2xl hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  إضافة للمفكرة اليومية ({selectedMealType})
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FoodDatabase;