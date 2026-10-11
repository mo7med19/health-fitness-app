import React from 'react';
import { MEAL_OF_DAY } from '../../data/homeData';

export const MealOfDay: React.FC = () => (
  <section id="mealofday" className="py-16 bg-white border-t max-w-7xl mx-auto px-4 w-full">
    <div className="text-center mb-10">
      <h2 className="text-3xl font-bold text-gray-900">وجبة اليوم</h2>
      <p className="text-gray-600 mt-2">وجبة جاهزة مع مكونات وطريقة وماكروز.</p>
    </div>
    <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h3 className="text-2xl font-bold text-emerald-900 mb-2">{MEAL_OF_DAY.title}</h3>
        <p className="text-emerald-800 text-sm mb-4">{MEAL_OF_DAY.tip}</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-white rounded-xl border p-2"><div className="text-[10px] text-gray-500">سعرات</div><div className="text-sm font-extrabold text-emerald-700">{MEAL_OF_DAY.calories}</div></div>
          <div className="bg-white rounded-xl border p-2"><div className="text-[10px] text-gray-500">بروتين</div><div className="text-sm font-extrabold text-emerald-700">{MEAL_OF_DAY.protein}g</div></div>
          <div className="bg-white rounded-xl border p-2"><div className="text-[10px] text-gray-500">كارب</div><div className="text-sm font-extrabold text-emerald-700">{MEAL_OF_DAY.carbs}g</div></div>
          <div className="bg-white rounded-xl border p-2"><div className="text-[10px] text-gray-500">دهون</div><div className="text-sm font-extrabold text-emerald-700">{MEAL_OF_DAY.fat}g</div></div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-emerald-100 space-y-3">
        <p className="font-bold text-gray-900">المكونات الرئيسية:</p>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {MEAL_OF_DAY.ingredients.map((ing, idx) => (<li key={idx}>{ing}</li>))}
        </ul>
      </div>
    </div>
  </section>
);