// src/data/foodDatabase.ts
export interface FoodItem {
  id: string;
  name: string;
  category: 'بروتين' | 'كربوهيدرات' | 'فواكه وخضار' | 'دهون ومكسرات' | 'مشروبات';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

export const INITIAL_FOODS: FoodItem[] = [
  { id: '1', name: 'صدر دجاج مشوي', category: 'بروتين', calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: '100 جرام' },
  { id: '2', name: 'لحم عجل مسلوق', category: 'بروتين', calories: 250, protein: 26, carbs: 0, fat: 15, serving: '100 جرام' },
  { id: '3', name: 'تونة معلبة بالماء', category: 'بروتين', calories: 116, protein: 26, carbs: 0, fat: 1, serving: '100 جرام' },
  { id: '4', name: 'بيض مسلوق', category: 'بروتين', calories: 155, protein: 13, carbs: 1.1, fat: 11, serving: '2 بيضة (100جم)' },
  { id: '5', name: 'أرز أبيض مطبوخ', category: 'كربوهيدرات', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: '100 جرام' },
  { id: '6', name: 'بطاطس مشوية في الفرن', category: 'كربوهيدرات', calories: 93, protein: 2.5, carbs: 21, fat: 0.2, serving: '100 جرام' },
  { id: '7', name: 'شوفان مطحون', category: 'كربوهيدرات', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, serving: '100 جرام' },
  { id: '8', name: 'موز', category: 'فواكه وخضار', calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3, serving: '100 جرام' },
  { id: '9', name: 'تفاح', category: 'فواكه وخضار', calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2, serving: '100 جرام' },
  { id: '10', name: 'زيت زيتون', category: 'دهون ومكسرات', calories: 884, protein: 0, carbs: 0, fat: 100, serving: '100 ملل' },
  { id: '11', name: 'حليب كامل الدسم', category: 'مشروبات', calories: 60, protein: 3.2, carbs: 4.8, fat: 3.3, serving: '100 ملل' },
];