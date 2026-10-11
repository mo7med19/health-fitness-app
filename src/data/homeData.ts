// src/data/homeData.ts

export type SwapOption = {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  tag?: 'أقل سعرات' | 'أعلى بروتين' | 'بديل متوازن';
};

export type SwapItem = {
  base: string;
  swaps: SwapOption[];
};

export type Recipe = {
  id: string;
  title: string;
  timeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
  goalTags: Array<'خسارة وزن' | 'زيادة وزن' | 'ثبات'>;
};

export type Tip = {
  id: string;
  category: 'تغذية' | 'تمارين' | 'نوم' | 'ماء' | 'عادات';
  text: string;
};

export type Faq = {
  q: string;
  a: string;
};

export type NutritionItem = {
  name: string;
  serving: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
};

export type Snack = {
  title: string;
  category: 'عالي بروتين' | 'قليل سعرات' | 'قبل التمرين' | 'بعد التمرين';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: string[];
};

export type Mistake = {
  title: string;
  why: string;
  fix: string;
};

export type MealOfDay = {
  title: string;
  timeMinutes: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  steps: string[];
  tip: string;
};

export const SWAPS: SwapItem[] = [
  {
    base: 'أرز أبيض',
    swaps: [
      { name: 'أرز بسمتي', quantity: '1 كوب مطبوخ', calories: 205, protein: 4, carbs: 45, fat: 0.4, tag: 'بديل متوازن' },
      { name: 'برغل', quantity: '1 كوب مطبوخ', calories: 151, protein: 6, carbs: 34, fat: 0.4, tag: 'أقل سعرات' },
      { name: 'بطاطس مسلوقة', quantity: '250g', calories: 200, protein: 5, carbs: 46, fat: 0.2, tag: 'بديل متوازن' },
      { name: 'كينوا', quantity: '1 كوب مطبوخ', calories: 222, protein: 8, carbs: 39, fat: 3.6, tag: 'أعلى بروتين' },
    ],
  },
  {
    base: 'خبز أبيض',
    swaps: [
      { name: 'خبز قمح كامل', quantity: '2 شريحة', calories: 160, protein: 8, carbs: 28, fat: 2, tag: 'بديل متوازن' },
      { name: 'خبز توست لايت', quantity: '2 شريحة', calories: 120, protein: 6, carbs: 22, fat: 1.5, tag: 'أقل سعرات' },
      { name: 'تورتيلا قمح', quantity: '1 قطعة', calories: 140, protein: 5, carbs: 24, fat: 3, tag: 'بديل متوازن' },
    ],
  },
  {
    base: 'صدر دجاج',
    swaps: [
      { name: 'تونة بالماء', quantity: '1 علبة', calories: 120, protein: 26, carbs: 0, fat: 1, tag: 'أعلى بروتين' },
      { name: 'لحم بقري قليل الدهن', quantity: '150g', calories: 240, protein: 30, carbs: 0, fat: 12, tag: 'بديل متوازن' },
      { name: 'جبنة قريش', quantity: '200g', calories: 200, protein: 28, carbs: 8, fat: 6, tag: 'أعلى بروتين' },
    ],
  },
];

export const RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'شوفان بالحليب والفاكهة',
    timeMinutes: 10,
    calories: 420,
    protein: 18,
    carbs: 60,
    fat: 12,
    ingredients: ['شوفان 60g', 'حليب 250ml', 'موزة صغيرة', 'قرفة (اختياري)'],
    steps: ['اخلط الشوفان مع الحليب', 'أضف الموز', 'رش قرفة حسب الرغبة'],
    goalTags: ['ثبات', 'زيادة وزن'],
  },
  {
    id: 'r2',
    title: 'سلطة تونة بروتين',
    timeMinutes: 12,
    calories: 350,
    protein: 35,
    carbs: 20,
    fat: 12,
    ingredients: ['تونة ماء 1 علبة', 'خس/جرجير', 'طماطم', 'خيار', 'ملعقة زيت زيتون', 'ليمون'],
    steps: ['صفّي التونة', 'اخلط الخضار', 'أضف التونة والتتبيلة'],
    goalTags: ['خسارة وزن', 'ثبات'],
  },
  {
    id: 'r3',
    title: 'دجاج وخضار سوتيه',
    timeMinutes: 20,
    calories: 520,
    protein: 42,
    carbs: 35,
    fat: 22,
    ingredients: ['صدر دجاج 200g', 'فلفل ألوان', 'بصل', 'ملعقة زيت', 'بهارات'],
    steps: ['شوّح البصل والخضار', 'أضف الدجاج', 'تبّل واتركه حتى ينضج'],
    goalTags: ['زيادة وزن', 'ثبات'],
  },
];

export const TIPS: Tip[] = [
  { id: 't1', category: 'تغذية', text: 'ابدأ وجبتك بالبروتين أولًا لأنه يزيد الشبع ويساعدك تثبت على هدفك.' },
  { id: 't2', category: 'ماء', text: 'اشرب كوب ماء قبل الوجبة بـ 15 دقيقة لتقليل الأكل العشوائي.' },
  { id: 't3', category: 'نوم', text: 'النوم 7–8 ساعات يساعد على توازن الشهية ويقلل الرغبة بالسكريات.' },
  { id: 't4', category: 'تمارين', text: 'حتى لو ما تتمرن… حاول تمشي 20–30 دقيقة يوميًا فرقها كبير.' },
  { id: 't5', category: 'عادات', text: 'جهّز وجبة/سناك بسيط مسبقًا عشان ما تضطر لخيارات سريعة غير مناسبة.' },
];

export const FAQS: Faq[] = [
  {
    q: 'هل لازم أقطع الكربوهيدرات عشان أنحف؟',
    a: 'لا. الأهم هو مجموع السعرات. تقدر تخسّ مع كربوهيدرات بشرط الالتزام بسعرات هدفك وتوازن البروتين والخضار.',
  },
  {
    q: 'كم بروتين أحتاج يوميًا؟',
    a: 'يعتمد على وزنك وهدفك. بشكل عام كثير ناس تستفيد من بروتين أعلى أثناء خسارة الوزن للمحافظة على الكتلة العضلية.',
  },
  {
    q: 'ليش وزني يثبت رغم أني ملتزم؟',
    a: 'أحيانًا بسبب احتباس سوائل، قلة نوم، تغيّر نشاطك، أو تقدير غير دقيق للسعرات. راقب 2–3 أسابيع بدل يوم/يومين.',
  },
  {
    q: 'أفضل سناك لخسارة الوزن؟',
    a: 'سناك بروتين خفيف مثل: زبادي عالي البروتين، جبنة قريش، تونة، أو فاكهة مع مصدر بروتين.',
  },
];

export const NUTRITION_DB: NutritionItem[] = [
  { name: 'بيض', serving: '1 حبة كبيرة', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, note: 'ممتاز للبروتين' },
  { name: 'صدر دجاج', serving: '100g مطبوخ', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'تونة', serving: '100g', calories: 132, protein: 29, carbs: 0, fat: 1 },
  { name: 'أرز أبيض', serving: '100g مطبوخ', calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'شوفان', serving: '50g', calories: 190, protein: 6.5, carbs: 32, fat: 3.5 },
  { name: 'موز', serving: '1 حبة متوسطة', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'تفاح', serving: '1 حبة متوسطة', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { name: 'بطاطس', serving: '200g مسلوقة', calories: 160, protein: 4, carbs: 36, fat: 0.2 },
  { name: 'زبادي عالي البروتين', serving: '200g', calories: 140, protein: 20, carbs: 10, fat: 2 },
  { name: 'زيت زيتون', serving: '1 ملعقة كبيرة', calories: 119, protein: 0, carbs: 0, fat: 13.5, note: 'دهون صحية لكن عالية السعرات' },
];

export const SNACKS: Snack[] = [
  {
    title: 'زبادي عالي البروتين + فاكهة',
    category: 'عالي بروتين',
    calories: 220,
    protein: 22,
    carbs: 25,
    fat: 3,
    items: ['زبادي عالي البروتين 200g', 'تفاح أو موز', 'قرفة (اختياري)'],
  },
  {
    title: 'تونة + خيار',
    category: 'عالي بروتين',
    calories: 180,
    protein: 26,
    carbs: 5,
    fat: 3,
    items: ['تونة ماء نصف إلى علبة', 'خيار', 'ليمون'],
  },
  {
    title: 'فشار بدون زيت',
    category: 'قليل سعرات',
    calories: 120,
    protein: 4,
    carbs: 22,
    fat: 2,
    items: ['فشار (هواء/بدون زيت)', 'رشة ملح خفيفة'],
  },
  {
    title: 'قهوة + موزة صغيرة',
    category: 'قبل التمرين',
    calories: 120,
    protein: 1,
    carbs: 30,
    fat: 0,
    items: ['قهوة', 'موزة صغيرة'],
  },
  {
    title: 'سندويش قمح + جبنة قريش',
    category: 'بعد التمرين',
    calories: 320,
    protein: 28,
    carbs: 35,
    fat: 7,
    items: ['خبز قمح كامل', 'جبنة قريش', 'خيار/خس'],
  },
];

export const MISTAKES: Mistake[] = [
  {
    title: 'تقدير الزيت بشكل غلط',
    why: 'الزيت سعراته عالية جدًا، وملعقة واحدة ممكن تقلب يومك.',
    fix: 'استخدم ملعقة قياس أو بخاخ زيت وخلّي الكمية واضحة.',
  },
  {
    title: 'سناك كثير “على السريع”',
    why: 'السناكات الصغيرة لو تكررت تجمع سعرات كثيرة بدون ما تحس.',
    fix: 'حدد سناك واحد أو اثنين في اليوم وخليه محسوب.',
  },
  {
    title: 'بروتين قليل طوال اليوم',
    why: 'قلة البروتين تقلل الشبع وقد تؤثر على الحفاظ على العضلات.',
    fix: 'وزّع البروتين على الوجبات: فطور + غداء + عشاء.',
  },
  {
    title: 'قلة النوم',
    why: 'قلة النوم تزيد الشهية وتخليك تميل للسكريات.',
    fix: 'ثبت وقت نومك وحاول 7–8 ساعات قدر الإمكان.',
  },
];

export const MEAL_OF_DAY: MealOfDay = {
  title: 'طبق دجاج + رز + سلطة',
  timeMinutes: 25,
  calories: 620,
  protein: 45,
  carbs: 65,
  fat: 18,
  ingredients: ['صدر دجاج 200g', 'أرز مطبوخ 1 كوب', 'سلطة خضار', 'ملعقة زيت زيتون', 'بهارات وليمون'],
  steps: [
    'تتبيل الدجاج وشويه/طهيه.',
    'تحضير الأرز (أو استخدام أرز جاهز مطبوخ).',
    'تجهيز سلطة خضار مع زيت زيتون وليمون.',
    'قدمهم معًا وراقب كمية الزيت.',
  ],
  tip: 'إذا هدفك خسارة وزن: قلّل كمية الأرز إلى نصف كوب وزوّد خضار.',
};