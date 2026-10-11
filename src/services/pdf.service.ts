// pdf.service.ts
// تصدير البرنامج الغذائي إلى PDF احترافي — متوافق مع النظام الديناميكي v2.

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { DailyPlan, UserMetrics } from '../types';

export type PlanOptions = Record<string, any>;
export type WeeklyDay = { label: string; plan: DailyPlan };

export type ExportProgress = {
  stage: 'fonts' | 'layout' | 'render' | 'save';
  current: number;
  total: number;
};

export type ExportArgs = {
  plan: DailyPlan;
  metrics: UserMetrics;
  targetCalories?: number;
  options?: PlanOptions;
  fileName?: string;
  title?: string;
  companyName?: string;
  qrUrl?: string;
  documentId?: string;
  weeklyPlans?: WeeklyDay[];
  include?: Partial<{
    bodyMetrics: boolean;
    timeline: boolean;
    shoppingList: boolean;
    tracking: boolean;
    exchangeGuide: boolean;
  }>;
  onProgress?: (p: ExportProgress) => void;
};

type Block = { html: string; keepNext?: boolean };

type Palette = {
  p: string;
  pd: string;
  ps: string;
  pb: string;
  pl: string;
};

const PAGE = { width: 794, height: 1123 } as const;
const PAD_X = 40;
const CONTENT_WIDTH = PAGE.width - PAD_X * 2;
const SLIM_BAND_H = 56;
const BAND_GAP = 22;
const FOOTER_RESERVE = 74;
const CONTENT_MAX_H = PAGE.height - SLIM_BAND_H - BAND_GAP - FOOTER_RESERVE - 14;
const FONT_LINK_ID = '__pdf_export_font__';
const HOST_ID = '__pdf_export_host__';
const ROWS_PER_MEAL_CHUNK = 11;
const SHOPPING_PER_CHUNK = 34;

const NEUTRAL = {
  ink: '#0f172a',
  muted: '#64748b',
  line: '#e2e8f0',
  surface: '#f8fafc',
  protein: '#2563eb',
  carbs: '#d97706',
  fat: '#9333ea',
} as const;

const WEEK_DAYS = ['السبت', ' الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

const num = (v: unknown): number => {
  const x = Number(v);
  return Number.isFinite(x) ? Math.round(x) : 0;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const label = (v: unknown, fallback = '—'): string => {
  const s = String(v ?? '').trim();
  return esc(s || fallback);
};

const joinList = (v: unknown): string =>
  Array.isArray(v) && v.length ? esc(v.join('، ')) : '—';

const normGoal = (g: unknown): 'lose' | 'gain' | 'maintain' => {
  const s = String(g ?? '').toLowerCase();
  if (/lose|loss|cut|تنشيف|خسارة|نزول/.test(s)) return 'lose';
  if (/gain|bulk|زيادة|تضخيم/.test(s)) return 'gain';
  return 'maintain';
};

const formatGoal = (goal: unknown): string => {
  const g = normGoal(goal);
  if (g === 'lose') return 'تنشيف وحرق الدهون';
  if (g === 'gain') return 'تضخيم وبناء عضلات';
  return 'المحافظة على الوزن والثبات';
};

const formatGender = (g: unknown): string => {
  if (g === 'male') return 'ذكر';
  if (g === 'female') return 'أنثى';
  return label(g);
};

const pad2 = (x: number) => String(x).padStart(2, '0');
const formatDate = (d = new Date()): string =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const formatDateTime = (d = new Date()): string =>
  `${formatDate(d)}  ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const makeDocumentId = (d = new Date()): string =>
  `SHT-${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

function paletteFor(rawGoal: unknown): Palette {
  const goal = normGoal(rawGoal);
  if (goal === 'lose')
    return { p: '#ea580c', pd: '#9a3412', ps: '#fff7ed', pb: '#fed7aa', pl: '#fb923c' };
  if (goal === 'gain')
    return { p: '#4f46e5', pd: '#312e81', ps: '#eef2ff', pb: '#c7d2fe', pl: '#818cf8' };
  return { p: '#059669', pd: '#065f46', ps: '#ecfdf5', pb: '#a7f3d0', pl: '#34d399' };
}

const waterLiters = (weightKg: number): string => {
  if (!weightKg) return '3';
  const l = clamp((weightKg * 35) / 1000, 2, 5);
  return (Math.round(l * 2) / 2).toString();
};

function activityFactor(a: unknown): number {
  const n = Number(a);
  if (Number.isFinite(n) && n >= 1 && n <= 2.5) return n;
  const s = String(a ?? '').toLowerCase();
  if (/very|extra|شديد|عالي جدا|عالٍ جدا/.test(s)) return 1.9;
  if (/sedentary|inactive|خامل|قليل|مكتب/.test(s)) return 1.2;
  if (/light|خفيف/.test(s)) return 1.375;
  if (/moderate|متوسط/.test(s)) return 1.55;
  if (/active|نشيط|عالي|مرتفع/.test(s)) return 1.725;
  return 1.375;
}

function computeBody(m: any) {
  const w = Number(m.weight);
  const h = Number(m.height);
  const age = Number(m.age);
  if (!(w > 0) || !(h > 0)) return null;

  const hm = h / 100;
  const bmi = w / (hm * hm);
  const bmiLabel =
    bmi < 18.5 ? 'نحافة' : bmi < 25 ? 'وزن طبيعي' : bmi < 30 ? 'زيادة وزن' : 'سمنة';

  const sexAdj = m.gender === 'male' ? 5 : m.gender === 'female' ? -161 : -78;
  const bmr = 10 * w + 6.25 * h - 5 * (age > 0 ? age : 30) + sexAdj;
  const tdee = bmr * activityFactor(m.activityLevel);
  const g = normGoal(m.goal);
  const recommended = g === 'lose' ? tdee - 500 : g === 'gain' ? tdee + 300 : tdee;

  return {
    bmi,
    bmiLabel,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    recommended: Math.round(Math.max(recommended, bmr * 0.9)),
    idealMin: Math.round(18.5 * hm * hm),
    idealMax: Math.round(24.9 * hm * hm),
  };
}

const toLatinDigits = (s: string) =>
  s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/٫/g, '.');

function parseQty(q: unknown) {
  const raw = String(q ?? '').trim();
  const s = toLatinDigits(raw);
  const m = s.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!m) return { value: null, unit: s, raw };
  return { value: parseFloat(m[1].replace(',', '.')), unit: m[2].trim(), raw };
}

const fmtNum = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

/** استخراج الوجبات ديناميكياً من كائن الخطة بغض النظر عن أسماء المفاتيح */
function getPlanMeals(plan: DailyPlan): { key: string; meal: any }[] {
  if (!plan || typeof plan !== 'object') return [];
  return Object.entries(plan)
    .filter(([key, val]) => key !== 'totalCalories' && key !== 'advice' && val && typeof val === 'object')
    .map(([key, meal]) => ({ key, meal }));
}

function buildShoppingList(plan: DailyPlan): { name: string; qty: string }[] {
  const map = new Map<string, { sums: Map<string, number>; extras: string[] }>();
  const mealsList = getPlanMeals(plan);

  for (const { meal } of mealsList) {
    const items: any[] = Array.isArray(meal?.items) ? meal.items : [];
    for (const it of items) {
      const name = String(it?.name ?? '').replace(/\s+/g, ' ').trim();
      if (!name) continue;
      const entry = map.get(name) ?? { sums: new Map<string, number>(), extras: [] as string[] };
      const q = parseQty(it?.quantity);
      if (q.value !== null) entry.sums.set(q.unit, (entry.sums.get(q.unit) ?? 0) + q.value);
      else if (q.raw) entry.extras.push(q.raw);
      map.set(name, entry);
    }
  }

  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'ar'))
    .map(([name, e]) => {
      const parts = [...e.sums.entries()].map(([unit, v]) => `${fmtNum(v)} ${unit}`.trim());
      return { name, qty: [...parts, ...e.extras].join(' + ') || '—' };
    });
}

function createHiddenHost(): HTMLDivElement {
  const host = document.createElement('div');
  host.id = HOST_ID;
  Object.assign(host.style, {
    position: 'fixed',
    left: '-100000px',
    top: '0',
    width: `${PAGE.width}px`,
    zIndex: '-1',
    background: 'transparent',
    pointerEvents: 'none',
  });
  document.body.appendChild(host);
  return host;
}

function removeHost(host: HTMLElement | null) {
  try {
    host?.parentNode?.removeChild(host);
  } catch {}
}

async function ensureFonts(timeoutMs = 3500): Promise<void> {
  if (!document.getElementById(FONT_LINK_ID)) {
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap';
    document.head.appendChild(link);
  }
  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('400 14px Cairo'),
        document.fonts.load('700 14px Cairo'),
        document.fonts.load('900 14px Cairo'),
      ]).then(() => document.fonts.ready),
      new Promise((r) => setTimeout(r, timeoutMs)),
    ]);
  } catch {}
}

const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => setTimeout(r, 60)));

async function makeQr(text?: string): Promise<string | null> {
  if (!text) return null;
  try {
    const mod: any = await import('qrcode');
    const toDataURL = mod.toDataURL ?? mod.default?.toDataURL;
    return await toDataURL(text, {
      margin: 1,
      width: 220,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
  } catch {
    return null;
  }
}

function buildStyles(t: Palette): string {
  const N = NEUTRAL;
  return `
  *{ box-sizing:border-box; margin:0; padding:0; }
  .doc{ width:${PAGE.width}px; color:${N.ink}; font-family:'Cairo', system-ui, sans-serif; }
  .sheet{ position:relative; width:${PAGE.width}px; height:${PAGE.height}px; padding:0 ${PAD_X}px ${FOOTER_RESERVE}px; background:#fff; overflow:hidden; }
  .wm{ position:absolute; top:52%; left:50%; z-index:0; pointer-events:none; transform:translate(-50%,-50%) rotate(-30deg); font-size:58px; font-weight:900; color:${t.p}; opacity:.04; white-space:nowrap; }
  .content{ position:relative; z-index:1; width:${CONTENT_WIDTH}px; }
  .measure{ width:${CONTENT_WIDTH}px; }
  .blk{ padding-bottom:16px; }
  .band{ margin:0 -${PAD_X}px ${BAND_GAP}px; padding:0 ${PAD_X}px; height:${SLIM_BAND_H}px; background:linear-gradient(135deg, ${t.pd} 0%, ${t.p} 100%); color:#fff; display:flex; justify-content:space-between; align-items:center; position:relative; z-index:1; }
  .band .docTitle{ font-size:16px; font-weight:900; }
  .band .brand{ font-size:11px; font-weight:700; opacity:.9; }
  .hero{ position:relative; overflow:hidden; margin:0 -${PAD_X}px; padding:54px ${PAD_X}px 50px; color:#fff; background:linear-gradient(140deg, ${t.pd} 0%, ${t.p} 60%, ${t.pl} 100%); }
  .heroBrand{ font-size:13px; font-weight:800; opacity:.92; }
  .heroTitle{ font-size:34px; font-weight:900; line-height:1.45; margin-top:14px; }
  .heroRule{ width:70px; height:4px; border-radius:4px; background:rgba(255,255,255,.75); margin:18px 0; }
  .heroFor{ font-size:12px; font-weight:700; opacity:.85; }
  .heroName{ font-size:28px; font-weight:900; margin-top:2px; }
  .heroMeta{ display:flex; gap:10px; align-items:center; margin-top:18px; flex-wrap:wrap; }
  .goalBadge{ display:inline-block; background:rgba(255,255,255,.2); border:1px solid rgba(255,255,255,.45); border-radius:999px; padding:5px 16px; font-size:12.5px; font-weight:800; color:#fff; }
  .coverBody{ position:relative; z-index:1; padding-top:26px; }
  .kpiRow{ display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  .kpi{ border-radius:16px; padding:14px 10px; text-align:center; border:1px solid; }
  .kpi .kt{ font-size:11px; font-weight:700; }
  .kpi .kv2{ font-size:22px; font-weight:900; margin-top:2px; line-height:1.3; }
  .kpi .ku{ font-size:10px; font-weight:700; opacity:.8; }
  .k-cal{ background:${t.ps}; border-color:${t.pb}; color:${t.pd}; }
  .k-prot{ background:#eff6ff; border-color:#bfdbfe; color:#1e40af; }
  .k-carb{ background:#fffbeb; border-color:#fde68a; color:#92400e; }
  .k-fat{ background:#fdf4ff; border-color:#f5d0fe; color:#86198f; }
  .verify{ display:flex; align-items:center; gap:16px; }
  .verify img{ width:96px; height:96px; border:1px solid ${N.line}; border-radius:12px; padding:4px; background:#fff; }
  .verifyT{ font-size:12px; color:${N.muted}; line-height:1.9; font-weight:600; }
  .verifyT b{ color:${N.ink}; font-weight:900; font-size:13px; }
  .card{ border:1px solid ${N.line}; border-radius:18px; padding:18px; background:#fff; }
  .cardTitle{ font-size:14px; font-weight:900; color:${t.pd}; margin-bottom:12px; }
  .grid3{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .grid2{ display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .kv{ background:${N.surface}; border:1px solid #eef2f7; border-radius:12px; padding:9px 12px; }
  .k{ font-size:10.5px; color:${N.muted}; font-weight:600; }
  .v{ margin-top:2px; font-size:13px; font-weight:800; color:${N.ink}; }
  .sectionTitle{ display:flex; align-items:center; gap:10px; font-size:17px; font-weight:900; }
  .sectionTitle i{ width:6px; height:22px; border-radius:6px; background:${t.p}; display:block; }
  .summary{ display:flex; gap:18px; align-items:center; }
  .donutWrap{ position:relative; width:150px; height:150px; flex:none; }
  .ringCenter{ position:absolute; left:0; right:0; top:0; bottom:0; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
  .ringCenter b{ font-size:24px; font-weight:900; color:${t.pd}; line-height:1.1; }
  .ringCenter span{ font-size:11px; color:${N.muted}; font-weight:700; }
  .macroList{ flex:1; display:flex; flex-direction:column; gap:9px; }
  .macroRow{ display:flex; align-items:center; justify-content:space-between; border-radius:12px; padding:9px 14px; border:1px solid; font-weight:800; }
  .macroRow .name{ display:flex; align-items:center; gap:8px; font-size:12.5px; }
  .macroRow .dot{ width:10px; height:10px; border-radius:50%; display:block; }
  .macroRow .val{ font-size:14px; font-weight:900; }
  .macroRow .pct{ font-size:11px; opacity:.8; margin-right:6px; font-weight:700; }
  .m-prot{ background:#eff6ff; border-color:#bfdbfe; color:#1e40af; }
  .m-carb{ background:#fffbeb; border-color:#fde68a; color:#92400e; }
  .m-fat{ background:#fdf4ff; border-color:#f5d0fe; color:#86198f; }
  .statGrid{ display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  .stat{ background:${t.ps}; border:1px solid ${t.pb}; border-radius:14px; padding:12px 8px; text-align:center; }
  .stat .sl{ font-size:10.5px; color:${N.muted}; font-weight:700; }
  .stat .sv{ font-size:20px; font-weight:900; color:${t.pd}; margin-top:2px; line-height:1.3; }
  .stat .su{ font-size:10px; color:${N.muted}; font-weight:700; }
  .gaugeWrap{ margin-top:16px; }
  .gaugeTop{ display:flex; justify-content:space-between; font-size:11.5px; font-weight:800; margin-bottom:8px; }
  .gauge{ direction:ltr; position:relative; display:flex; height:12px; border-radius:999px; overflow:hidden; }
  .gauge div{ height:100%; }
  .marker{ direction:ltr; position:relative; height:16px; margin-top:2px; }
  .marker i{ position:absolute; top:0; width:0; height:0; margin-left:-7px; border-left:7px solid transparent; border-right:7px solid transparent; border-bottom:10px solid ${N.ink}; }
  .gaugeScale{ direction:ltr; display:flex; justify-content:space-between; font-size:10px; color:${N.muted}; font-weight:700; }
  .note{ margin-top:10px; font-size:10.5px; color:${N.muted}; line-height:1.9; font-weight:600; }
  .tl{ position:relative; display:flex; justify-content:space-between; padding-top:4px; }
  .tlLine{ position:absolute; top:30px; left:8%; right:8%; height:4px; border-radius:4px; background:linear-gradient(90deg, ${t.pb}, ${t.p}); }
  .tlNode{ position:relative; text-align:center; flex:1; }
  .tlDot{ width:44px; height:44px; margin:0 auto; border-radius:50%; background:#fff; border:4px solid ${t.p}; display:flex; align-items:center; justify-content:center; font-size:18px; }
  .tlName{ font-size:12px; font-weight:900; margin-top:8px; color:${t.pd}; }
  .tlTime{ font-size:10px; color:${N.muted}; font-weight:700; }
  .tlKcal{ display:inline-block; margin-top:4px; background:${t.ps}; border:1px solid ${t.pb}; color:${t.pd}; border-radius:999px; padding:1px 8px; font-size:10.5px; font-weight:900; }
  .dist{ display:flex; gap:20px; align-items:center; }
  .distBars{ flex:1; display:flex; flex-direction:column; gap:12px; }
  .barRow .bt{ display:flex; justify-content:space-between; font-size:11.5px; font-weight:800; margin-bottom:4px; }
  .barTrack{ height:10px; background:#f1f5f9; border-radius:999px; overflow:hidden; }
  .barFill{ height:100%; border-radius:999px; background:linear-gradient(90deg, ${t.p}, ${t.pl}); }
  .ringBox{ position:relative; width:130px; height:130px; flex:none; }
  .ringCap{ text-align:center; font-size:10.5px; color:${N.muted}; font-weight:700; margin-top:4px; }
  .meal{ border:1px solid ${N.line}; border-radius:18px; overflow:hidden; background:#fff; }
  .mealHead{ padding:12px 16px; background:linear-gradient(90deg, ${t.ps}, #ffffff); border-bottom:1px solid ${t.pb}; display:flex; justify-content:space-between; align-items:center; }
  .mealHead.cont{ padding:8px 16px; font-size:12px; font-weight:800; color:${t.pd}; }
  .mealLeft{ display:flex; align-items:center; gap:12px; }
  .mealIcon{ width:40px; height:40px; border-radius:12px; background:#fff; border:1px solid ${t.pb}; display:flex; align-items:center; justify-content:center; font-size:20px; }
  .mealName{ font-weight:900; color:${t.pd}; font-size:15px; }
  .mealTime{ font-size:11px; color:${N.muted}; margin-top:1px; font-weight:600; }
  .mealKcal{ text-align:left; }
  .mealKcal b{ font-size:18px; font-weight:900; color:${t.pd}; }
  .mealKcal span{ font-size:11px; color:${N.muted}; font-weight:700; margin-right:3px; }
  .share{ height:5px; background:#f1f5f9; }
  .share div{ height:100%; background:linear-gradient(90deg, ${t.p}, ${t.pl}); }
  .table{ width:100%; border-collapse:collapse; font-size:12px; }
  .th{ padding:8px 12px; text-align:right; background:${N.surface}; color:#334155; font-weight:800; border-bottom:1px solid ${N.line}; font-size:11px; }
  .td{ padding:9px 12px; border-bottom:1px solid #f1f5f9; color:${N.ink}; font-weight:600; }
  .row-alt .td{ background:#fcfdfe; }
  .num{ text-align:left; direction:ltr; font-variant-numeric:tabular-nums; }
  .muted{ color:${N.muted}; }
  .tfoot .td{ background:${t.ps}; color:${t.pd}; font-weight:900; border-bottom:none; }
  .advice{ background:${t.ps}; border:1px solid ${t.pb}; border-radius:18px; padding:18px; }
  .adviceH{ font-weight:900; color:${t.pd}; margin-bottom:8px; font-size:14px; }
  .adviceT{ font-size:12.5px; color:${N.ink}; line-height:2; white-space:pre-wrap; font-weight:600; }
  .water{ display:flex; align-items:center; gap:12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:14px; padding:12px 16px; font-size:12.5px; color:#1e3a8a; font-weight:700; line-height:1.8; }
  .water .big{ font-size:26px; }
  .shopCols{ display:grid; grid-template-columns:1fr 1fr; gap:0 22px; }
  .shopItem{ display:flex; align-items:center; gap:10px; padding:7px 0; border-bottom:1px dashed ${N.line}; font-size:12px; }
  .chk{ width:15px; height:15px; border:1.5px solid ${t.p}; border-radius:4px; flex:none; display:block; background:#fff; }
  .shopName{ font-weight:800; flex:1; }
  .shopQty{ color:${N.muted}; font-weight:700; font-size:11px; direction:rtl; }
  .sign{ display:flex; justify-content:space-between; align-items:flex-end; gap:20px; border-top:1px dashed #cbd5e1; padding-top:16px; }
  .signBox{ width:230px; text-align:center; }
  .signLine{ border-bottom:1.5px solid ${N.ink}; height:38px; margin-bottom:6px; }
  .signTitle{ font-size:11px; color:#475569; font-weight:800; }
  .disclaimer{ font-size:10.5px; color:${N.muted}; line-height:1.9; flex:1; font-weight:600; }
  .footer{ position:absolute; left:${PAD_X}px; right:${PAD_X}px; bottom:24px; z-index:1; display:flex; justify-content:space-between; align-items:center; border-top:1px solid ${N.line}; padding-top:10px; font-size:10.5px; color:${N.muted}; font-weight:600; }
  .pageNo{ background:${t.ps}; color:${t.pd}; border:1px solid ${t.pb}; border-radius:999px; padding:2px 12px; font-weight:800; }
`;
}

function ringSvg(size: number, stroke: number, segments: { pct: number; color: string }[]): string {
  const c = size / 2;
  const R = c - stroke / 2 - 2;
  const C = 2 * Math.PI * R;
  let acc = 0;
  const circles = segments
    .filter((s) => s.pct > 0)
    .map((s) => {
      const out = `<circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-dasharray="${((C * s.pct) / 100).toFixed(2)} ${C.toFixed(2)}" stroke-dashoffset="${((-C * acc) / 100).toFixed(2)}" />`;
      acc += s.pct;
      return out;
    })
    .join('');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><g transform="rotate(-90 ${c} ${c})"><circle cx="${c}" cy="${c}" r="${R}" fill="none" stroke="#f1f5f9" stroke-width="${stroke}" />${circles}</g></svg>`;
}

const section = (title: string): Block => ({
  html: `<div class="sectionTitle"><i></i>${title}</div>`,
  keepNext: true,
});

type Totals = {
  protein: number;
  carbs: number;
  fat: number;
  dayCalories: number;
  protPct: number;
  carbPct: number;
  fatPct: number;
};

function computeTotals(plan: DailyPlan): Totals {
  const mealsList = getPlanMeals(plan);
  const sum = (key: string) => mealsList.reduce((a, { meal }) => a + (Number(meal?.[key]) || 0), 0);
  const protein = sum('totalProtein');
  const carbs = sum('totalCarbs');
  const fat = sum('totalFat');
  const dayCalories = num((plan as any)?.totalCalories) || num(sum('totalCalories'));

  const pk = protein * 4;
  const ck = carbs * 4;
  const fk = fat * 9;
  const total = pk + ck + fk || 1;
  const protPct = Math.round((pk / total) * 100);
  const carbPct = Math.round((ck / total) * 100);
  return { protein, carbs, fat, dayCalories, protPct, carbPct, fatPct: Math.max(0, 100 - protPct - carbPct) };
}

function summaryBlock(tt: Totals): Block {
  return {
    html: `
    <div class="card">
      <div class="cardTitle">📊 ملخص الطاقة والمغذيات الكبرى</div>
      <div class="summary">
        <div class="donutWrap">
          ${ringSvg(150, 16, [
            { pct: tt.protPct, color: NEUTRAL.protein },
            { pct: tt.carbPct, color: NEUTRAL.carbs },
            { pct: tt.fatPct, color: NEUTRAL.fat },
          ])}
          <div class="ringCenter"><b>${tt.dayCalories}</b><span>سعرة / يوم</span></div>
        </div>
        <div class="macroList">
          <div class="macroRow m-prot">
            <span class="name"><i class="dot" style="background:${NEUTRAL.protein}"></i>البروتين</span>
            <span><span class="val">${num(tt.protein)}g</span><span class="pct">${tt.protPct}%</span></span>
          </div>
          <div class="macroRow m-carb">
            <span class="name"><i class="dot" style="background:${NEUTRAL.carbs}"></i>الكاربوهيدرات</span>
            <span><span class="val">${num(tt.carbs)}g</span><span class="pct">${tt.carbPct}%</span></span>
          </div>
          <div class="macroRow m-fat">
            <span class="name"><i class="dot" style="background:${NEUTRAL.fat}"></i>الدهون الصحية</span>
            <span><span class="val">${num(tt.fat)}g</span><span class="pct">${tt.fatPct}%</span></span>
          </div>
        </div>
      </div>
    </div>`,
  };
}

function prefsBlock(options?: PlanOptions): Block | null {
  if (!options) return null;
  return {
    html: `
    <div class="card">
      <div class="cardTitle">⚙️ التفضيلات والقيود الغذائية</div>
      <div class="grid2">
        <div class="kv"><div class="k">نمط الأكل</div><div class="v">${label(options.dietStyle)}</div></div>
        <div class="kv"><div class="k">نظام الصيام</div><div class="v">${label(options.fasting)}</div></div>
        <div class="kv"><div class="k">يوجد تمرين اليوم</div><div class="v">${options.trainingToday ? 'نعم' : 'لا'}</div></div>
        <div class="kv"><div class="k">حساسية غذائية</div><div class="v">${joinList(options.allergies)}</div></div>
      </div>
      <div class="kv" style="margin-top:10px">
        <div class="k">أطعمة مستبعدة</div><div class="v">${joinList(options.excludedFoods)}</div>
      </div>
    </div>`,
  };
}

function bodyMetricsBlock(m: any): Block | null {
  const b = computeBody(m);
  if (!b) return null;
  const pos = clamp(((b.bmi - 15) / 25) * 100, 1, 99);
  const seg = (from: number, to: number, color: string) =>
    `<div style="width:${(((to - from) / 25) * 100).toFixed(2)}%;background:${color}"></div>`;

  return {
    html: `
    <div class="card">
      <div class="cardTitle">🧬 مؤشرات الجسم والاحتياج اليومي</div>
      <div class="statGrid">
        <div class="stat"><div class="sl">مؤشر كتلة الجسم</div><div class="sv">${b.bmi.toFixed(1)}</div><div class="su">${b.bmiLabel}</div></div>
        <div class="stat"><div class="sl">معدل الحرق الأساسي</div><div class="sv">${b.bmr}</div><div class="su">سعرة / يوم</div></div>
        <div class="stat"><div class="sl">إجمالي الحرق اليومي</div><div class="sv">${b.tdee}</div><div class="su">سعرة / يوم</div></div>
        <div class="stat"><div class="sl">الوزن الصحي التقريبي</div><div class="sv" style="font-size:16px">${b.idealMin}–${b.idealMax}</div><div class="su">كجم</div></div>
      </div>
      <div class="gaugeWrap">
        <div class="gaugeTop"><span>أين يقع مؤشرك؟</span><span style="color:${NEUTRAL.muted}">BMI ${b.bmi.toFixed(1)} — ${b.bmiLabel}</span></div>
        <div class="gauge">${seg(15, 18.5, '#60a5fa')}${seg(18.5, 25, '#34d399')}${seg(25, 30, '#fbbf24')}${seg(30, 40, '#f87171')}</div>
        <div class="marker"><i style="left:${pos.toFixed(2)}%"></i></div>
        <div class="gaugeScale"><span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span></div>
      </div>
    </div>`,
  };
}

function timelineBlock(plan: DailyPlan): Block {
  const mealsList = getPlanMeals(plan);
  const icons = ['🍳', '🥗', '🍎', '🍲', '🥑', '🥣'];
  const nodes = mealsList
    .map(({ meal }, idx) => `
      <div class="tlNode">
        <div class="tlDot">${icons[idx % icons.length]}</div>
        <div class="tlName">${esc(meal?.name || `وجبة ${idx + 1}`)}</div>
        <div class="tlTime">${esc(meal?.time || '—')}</div>
        <div class="tlKcal">${num(meal?.totalCalories)} سعرة</div>
      </div>`)
    .join('');

  return {
    html: `
    <div class="card">
      <div class="cardTitle">🕐 الخط الزمني ليومك</div>
      <div class="tl"><div class="tlLine"></div>${nodes}</div>
    </div>`,
  };
}

function distributionBlock(plan: DailyPlan, dayCalories: number, target: number): Block {
  const mealsList = getPlanMeals(plan);
  const icons = ['🍳', '🥗', '🍎', '🍲', '🥑', '🥣'];

  const bars = mealsList
    .map(({ meal }, idx) => {
      const k = num(meal?.totalCalories);
      const pct = dayCalories > 0 ? clamp(Math.round((k / dayCalories) * 100), 0, 100) : 0;
      return `
      <div class="barRow">
        <div class="bt"><span>${icons[idx % icons.length]} ${esc(meal?.name || `وجبة ${idx + 1}`)}</span><span>${k} سعرة · ${pct}%</span></div>
        <div class="barTrack"><div class="barFill" style="width:${pct}%"></div></div>
      </div>`;
    })
    .join('');

  let ring = '';
  if (target > 0) {
    const pct = Math.round((dayCalories / target) * 100);
    ring = `
      <div>
        <div class="ringBox">
          ${ringSvg(130, 13, [{ pct: clamp(pct, 0, 100), color: pct > 110 ? '#ef4444' : '#10b981' }])}
          <div class="ringCenter"><b style="font-size:22px">${pct}%</b><span>من الهدف</span></div>
        </div>
        <div class="ringCap">الهدف: ${target} سعرة</div>
      </div>`;
  }

  return {
    html: `
    <div class="card">
      <div class="cardTitle">⚖️ توزيع السعرات على الوجبات</div>
      <div class="dist"><div class="distBars">${bars}</div>${ring}</div>
    </div>`,
  };
}

function mealBlocks(mealKey: string, meal: any, dayCalories: number, index: number): Block[] {
  const items: any[] = Array.isArray(meal?.items) ? meal.items : [];
  const mealCals = num(meal?.totalCalories);
  const share = dayCalories > 0 ? clamp(Math.round((mealCals / dayCalories) * 100), 0, 100) : 0;
  const icons = ['🍳', '🥗', '🍎', '🍲', '🥑', '🥣'];
  const icon = icons[index % icons.length];

  const head = `
    <div class="mealHead">
      <div class="mealLeft">
        <div class="mealIcon">${icon}</div>
        <div>
          <div class="mealName">${esc(meal?.name || `وجبة ${index + 1}`)}</div>
          <div class="mealTime">⏰ التوقيت: ${esc(meal?.time || '—')}</div>
        </div>
      </div>
      <div class="mealKcal"><b>${mealCals}</b><span>سعرة · ${share}% من اليوم</span></div>
    </div>
    <div class="share"><div style="width:${share}%"></div></div>`;

  const contHead = `<div class="mealHead cont"><span>${icon} ${esc(meal?.name || `وجبة ${index + 1}`)} — تابع</span><span>${mealCals} سعرة</span></div>`;

  const thead = `
    <thead><tr>
      <th class="th">المكوّن / الصنف</th><th class="th">الكمية</th>
      <th class="th num">السعرات</th><th class="th num">البروتين</th><th class="th num">الكارب</th><th class="th num">الدهون</th>
    </tr></thead>`;

  const totalRow = `
    <tr class="tfoot">
      <td class="td" colspan="2">إجمالي الوجبة</td>
      <td class="td num">${mealCals}</td>
      <td class="td num">${num(meal?.totalProtein)}g</td>
      <td class="td num">${num(meal?.totalCarbs)}g</td>
      <td class="td num">${num(meal?.totalFat)}g</td>
    </tr>`;

  const rowHtml = (it: any, i: number) => `
    <tr class="${i % 2 ? 'row-alt' : ''}">
      <td class="td">${label(it?.name)}</td>
      <td class="td">${label(it?.quantity)}</td>
      <td class="td num">${num(it?.calories)}</td>
      <td class="td num">${num(it?.protein)}g</td>
      <td class="td num">${num(it?.carbs)}g</td>
      <td class="td num">${num(it?.fat)}g</td>
    </tr>`;

  if (!items.length) {
    return [
      {
        html: `<div class="meal">${head}<table class="table">${thead}<tbody>
          <tr><td class="td muted" colspan="6"><strong>المكونات:</strong> ${label(meal?.name, 'وجبة صحية متكاملة')}</td></tr>
          ${totalRow}</tbody></table></div>`,
      },
    ];
  }

  const chunks: any[][] = [];
  for (let i = 0; i < items.length; i += ROWS_PER_MEAL_CHUNK)
    chunks.push(items.slice(i, i + ROWS_PER_MEAL_CHUNK));

  return chunks.map((chunk, ci) => ({
    html: `<div class="meal">${ci === 0 ? head : contHead}
      <table class="table">${thead}<tbody>
        ${chunk.map((it, i) => rowHtml(it, i)).join('')}
        ${ci === chunks.length - 1 ? totalRow : ''}
      </tbody></table></div>`,
  }));
}

function guidanceBlocks(plan: DailyPlan, weight: number): Block[] {
  return [
    section('إرشادات الخبير الغذائي والتوصيات'),
    {
      html: `
      <div class="advice">
        <div class="adviceH">💡 تعليمات الالتزام بالبرنامج</div>
        <div class="adviceT">${label((plan as any).advice, 'التزم بالمواعيد والكميات المقترحة، وتواصل مع المختص عند أي ملاحظة.')}</div>
      </div>`,
    },
    {
      html: `
      <div class="water">
        <div class="big">💧</div>
        <div>اشرب حوالي <b>${waterLiters(weight)} لتر</b> ماء يومياً موزعة على اليوم، والتزم بمواعيد الوجبات المقترحة.</div>
      </div>`,
    },
  ];
}

function shoppingBlocks(plan: DailyPlan): Block[] {
  const list = buildShoppingList(plan);
  if (!list.length) return [];

  const blocks: Block[] = [section('قائمة المشتريات (لليوم الواحد)')];
  for (let i = 0; i < list.length; i += SHOPPING_PER_CHUNK) {
    const chunk = list.slice(i, i + SHOPPING_PER_CHUNK);
    const half = Math.ceil(chunk.length / 2);
    const col = (arr: typeof chunk) =>
      arr
        .map(
          (it) => `
        <div class="shopItem">
          <i class="chk"></i><span class="shopName">${esc(it.name)}</span><span class="shopQty">${esc(it.qty)}</span>
        </div>`
        )
        .join('');
    blocks.push({
      html: `<div class="card" style="padding:10px 18px">
        <div class="shopCols"><div>${col(chunk.slice(0, half))}</div><div>${col(chunk.slice(half))}</div></div>
      </div>`,
    });
  }
  return blocks;
}

function signBlock(): Block {
  return {
    html: `
    <div class="sign">
      <div class="disclaimer">هذا البرنامج استرشادي ويُبنى على البيانات المُدخلة. يُنصح بمراجعة الطبيب أو أخصائي التغذية عند وجود أمراض مزمنة أو حمل أو رضاعة.</div>
      <div class="signBox"><div class="signLine"></div><div class="signTitle">اعتماد أخصائي التغذية / المدرب</div></div>
    </div>`,
  };
}

type Ctx = {
  args: ExportArgs;
  palette: Palette;
  companyName: string;
  title: string;
  createdAt: string;
  docId: string;
  qr: string | null;
};

function sheet(inner: string, ctx: Ctx, pageNo: number, total: number): string {
  return `
    <section class="sheet">
      <div class="wm">${ctx.companyName}</div>
      ${inner}
      <div class="footer">
        <div>وثيقة معتمدة — ${ctx.companyName} · ${esc(ctx.docId)}</div>
        <div class="pageNo">${pageNo} / ${total}</div>
      </div>
    </section>`;
}

function coverInner(ctx: Ctx, tt: Totals): string {
  const m = ctx.args.metrics as any;
  const qrBlock = ctx.qr
    ? `<img src="${ctx.qr}" alt="QR" />`
    : `<div style="width:96px;height:96px;border-radius:12px;border:1px dashed ${ctx.palette.pb};background:${ctx.palette.ps};display:flex;align-items:center;justify-content:center;font-size:34px">🛡️</div>`;

  return `
    <div class="hero">
      <i class="c1"></i><i class="c2"></i><i class="c3"></i>
      <div class="heroBrand">${ctx.companyName}</div>
      <div class="heroTitle">${ctx.title}</div>
      <div class="heroRule"></div>
      <div class="heroFor">أُعدّ هذا البرنامج خصيصاً لـ</div>
      <div class="heroName">${label(m.name, 'العميل')}</div>
      <div class="heroMeta">
        <span class="goalBadge">🎯 ${formatGoal(m.goal)}</span>
        <span class="goalBadge">📅 ${ctx.createdAt}</span>
      </div>
    </div>

    <div class="coverBody content">
      <div class="blk">
        <div class="card">
          <div class="cardTitle">📋 البيانات الأساسية</div>
          <div class="grid3">
            <div class="kv"><div class="k">الاسم</div><div class="v">${label(m.name)}</div></div>
            <div class="kv"><div class="k">العمر</div><div class="v">${num(m.age)} سنة</div></div>
            <div class="kv"><div class="k">الجنس</div><div class="v">${formatGender(m.gender)}</div></div>
            <div class="kv"><div class="k">الوزن</div><div class="v">${num(m.weight)} كجم</div></div>
            <div class="kv"><div class="k">الطول</div><div class="v">${num(m.height)} سم</div></div>
            <div class="kv"><div class="k">مستوى النشاط</div><div class="v">${label(m.activityLevel)}</div></div>
          </div>
        </div>
      </div>

      <div class="blk">
        <div class="kpiRow">
          <div class="kpi k-cal"><div class="kt">السعرات اليومية</div><div class="kv2">${tt.dayCalories}</div><div class="ku">سعرة</div></div>
          <div class="kpi k-prot"><div class="kt">البروتين</div><div class="kv2">${num(tt.protein)}</div><div class="ku">جرام</div></div>
          <div class="kpi k-carb"><div class="kt">الكاربوهيدرات</div><div class="kv2">${num(tt.carbs)}</div><div class="ku">جرام</div></div>
          <div class="kpi k-fat"><div class="kt">الدهون</div><div class="kv2">${num(tt.fat)}</div><div class="ku">جرام</div></div>
        </div>
      </div>

      <div class="blk">
        <div class="card verify">
          ${qrBlock}
          <div class="verifyT">
            <b>التحقق من الوثيقة</b><br/>
            رقم الوثيقة: <b>${esc(ctx.docId)}</b><br/>
            ${ctx.qr ? 'امسح الرمز لفتح البرنامج أو التحقق من صحته.' : 'وثيقة صادرة إلكترونياً من النظام.'}
          </div>
        </div>
      </div>
    </div>`;
}

function contentSheetInner(blocks: string[], ctx: Ctx): string {
  return `
    <div class="band">
      <div class="docTitle">${ctx.title}</div>
      <div class="brand">${ctx.createdAt}</div>
    </div>
    <div class="content">${blocks.map((h) => `<div class="blk">${h}</div>`).join('')}</div>`;
}

export function buildPlanBlocks(args: ExportArgs): Block[] {
  const { plan, metrics, options } = args;
  const m = metrics as any;
  const inc = {
    bodyMetrics: true,
    timeline: true,
    shoppingList: true,
    tracking: true,
    exchangeGuide: true,
    ...(args.include ?? {}),
  };
  const tt = computeTotals(plan);
  const target = num(args.targetCalories);

  const blocks: Block[] = [];
  const push = (...b: (Block | Block[] | null | undefined)[]) =>
    b.forEach((x) => x && (Array.isArray(x) ? blocks.push(...x) : blocks.push(x)));

  push(section('ملخص البرنامج'), summaryBlock(tt), prefsBlock(options));

  if (inc.bodyMetrics) {
    const body = bodyMetricsBlock(m);
    if (body) push(section('المؤشرات الحيوية'), body);
  }

  if (inc.timeline) push(section('جدولة اليوم'), timelineBlock(plan));
  push(distributionBlock(plan, tt.dayCalories, target));

  push(section('جدول الوجبات اليومية'));
  const mealsList = getPlanMeals(plan);
  mealsList.forEach(({ key, meal }, index) => {
    push(mealBlocks(key, meal, tt.dayCalories, index));
  });

  push(guidanceBlocks(plan, num(m.weight)));
  if (inc.shoppingList) push(shoppingBlocks(plan));
  push(signBlock());

  return blocks;
}

function paginate(blocks: Block[], heights: number[], maxH: number): string[][] {
  const pages: string[][] = [[]];
  let used = 0;
  let i = 0;

  while (i < blocks.length) {
    let j = i;
    let groupH = heights[j];
    while (blocks[j].keepNext && j + 1 < blocks.length) {
      j++;
      groupH += heights[j];
    }

    if (used + groupH > maxH && used > 0) {
      pages.push([]);
      used = 0;
    }
    for (let k = i; k <= j; k++) pages[pages.length - 1].push(blocks[k].html);
    used += groupH;
    i = j + 1;
  }
  return pages.filter((p) => p.length > 0);
}

export async function exportDailyPlanPdf(args: ExportArgs): Promise<void> {
  const { plan, metrics } = args;
  if (!plan) throw new Error('Missing plan');
  if (!metrics) throw new Error('Missing metrics');

  const report = (p: ExportProgress) => {
    try {
      args.onProgress?.(p);
    } catch {}
  };

  const fileName =
    args.fileName?.trim() || `البرنامج-الغذائي-${new Date().toISOString().slice(0, 10)}.pdf`;

  report({ stage: 'fonts', current: 0, total: 1 });
  const [, qr] = await Promise.all([ensureFonts(), makeQr(args.qrUrl)]);

  const palette = paletteFor((metrics as any).goal);
  const ctx: Ctx = {
    args,
    palette,
    companyName: label(args.companyName, 'منصة "صحتي" للرعاية الصحية والرياضية'),
    title: label(args.title, 'تقرير البرنامج الغذائي الاحترافي'),
    createdAt: formatDateTime(),
    docId: args.documentId?.trim() || makeDocumentId(),
    qr,
  };
  const styles = buildStyles(palette);

  const host = createHiddenHost();
  try {
    report({ stage: 'layout', current: 0, total: 1 });
    const blocks = buildPlanBlocks(args);
    host.innerHTML = `<div class="doc" dir="rtl" lang="ar"><style>${styles}</style>
      <div class="measure">${blocks.map((b) => `<div class="blk">${b.html}</div>`).join('')}</div></div>`;
    await nextFrame();
    const heights = Array.from(host.querySelectorAll<HTMLElement>('.measure > .blk')).map(
      (el) => el.offsetHeight
    );

    const contentPages = paginate(blocks, heights, CONTENT_MAX_H);
    const total = contentPages.length + 1;
    const tt = computeTotals(plan);

    const sheetsHtml = [
      sheet(coverInner(ctx, tt), ctx, 1, total),
      ...contentPages.map((p, i) => sheet(contentSheetInner(p, ctx), ctx, i + 2, total)),
    ].join('');

    host.innerHTML = `<div class="doc" dir="rtl" lang="ar"><style>${styles}</style>${sheetsHtml}</div>`;
    await nextFrame();

    const sheets = Array.from(host.querySelectorAll<HTMLElement>('.sheet'));
    if (!sheets.length) throw new Error('PDF template not found');

    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', compress: true });
    const pw = pdf.internal.pageSize.getWidth();
    const ph = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < sheets.length; i++) {
      report({ stage: 'render', current: i + 1, total: sheets.length });
      const canvas = await html2canvas(sheets[i], {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: PAGE.width,
        height: PAGE.height,
        windowWidth: PAGE.width,
      });
      if (i > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pw, ph, undefined, 'FAST');
    }

    pdf.setProperties({
      title: String(args.title || 'البرنامج الغذائي'),
      author: String(args.companyName || 'صحتي'),
      subject: ctx.docId,
    });

    report({ stage: 'save', current: sheets.length, total: sheets.length });
    pdf.save(fileName);
  } finally {
    removeHost(host);
  }
}