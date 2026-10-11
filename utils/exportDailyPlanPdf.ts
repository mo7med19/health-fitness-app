// exportDailyPlanPdf.ts
// Simple PDF export matching Plans page (white + gray borders + emerald accent)
//
// Dependencies:
//   npm i jspdf html2canvas
//
// Usage in Plans.tsx:
//   await exportDailyPlanPdf({ plan: shownPlan, metrics, targetCalories, options: planOptions });

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { DailyPlan, UserMetrics } from '../types';

// ✅ لا نعتمد على PlanOptions من types.ts حتى ما يصير عندك نقص بالتايب
export type PlanOptions = Record<string, any>;

type ExportArgs = {
  plan: DailyPlan;
  metrics: UserMetrics;
  targetCalories?: number;
  options?: PlanOptions;
  fileName?: string;
  title?: string; // عنوان التقرير
};

function n(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? Math.round(x) : 0;
}

function safeLabel(v: any, fallback = '—') {
  const s = String(v ?? '').trim();
  return s ? s : fallback;
}

function formatGoal(goal: any) {
  if (goal === 'lose') return 'خسارة وزن';
  if (goal === 'gain') return 'زيادة وزن';
  return 'ثبات';
}

function formatGender(g: any) {
  if (g === 'male') return 'ذكر';
  if (g === 'female') return 'أنثى';
  return safeLabel(g);
}

function formatDate(now = new Date()) {
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
    now.getMinutes()
  )}`;
}

function createHiddenHost(): HTMLDivElement {
  const host = document.createElement('div');
  host.id = '__pdf_export_host__';
  host.style.position = 'fixed';
  host.style.left = '-100000px';
  host.style.top = '0';
  host.style.width = '794px'; // ~A4 width @96dpi
  host.style.zIndex = '999999';
  host.style.background = 'transparent';
  document.body.appendChild(host);
  return host;
}

function removeHost(host: HTMLElement | null) {
  try {
    if (host && host.parentNode) host.parentNode.removeChild(host);
  } catch {
    // ignore
  }
}

function optText(options?: PlanOptions) {
  if (!options) return '';
  const dietStyle = safeLabel(options.dietStyle, '—');
  const fasting = safeLabel(options.fasting, '—');
  const budget = safeLabel(options.budget, '—');
  const prepTime = safeLabel(options.prepTime, '—');
  const trainingToday = options.trainingToday ? 'نعم' : 'لا';
  const trainingTime = safeLabel(options.trainingTime, '—');
  const excludedFoods = Array.isArray(options.excludedFoods) && options.excludedFoods.length ? options.excludedFoods.join('، ') : '—';
  const allergies = Array.isArray(options.allergies) && options.allergies.length ? options.allergies.join('، ') : '—';
  const notes = safeLabel(options.notes, '—');

  return `
    <div class="box">
      <div class="boxTitle">خيارات التوليد</div>
      <div class="grid2">
        <div class="kv"><div class="k">نمط الأكل</div><div class="v">${dietStyle}</div></div>
        <div class="kv"><div class="k">صيام</div><div class="v">${fasting}</div></div>
        <div class="kv"><div class="k">الميزانية</div><div class="v">${budget}</div></div>
        <div class="kv"><div class="k">وقت التحضير</div><div class="v">${prepTime}</div></div>
        <div class="kv"><div class="k">تمرين اليوم</div><div class="v">${trainingToday}</div></div>
        <div class="kv"><div class="k">وقت التمرين</div><div class="v">${trainingTime}</div></div>
      </div>

      <div class="grid1" style="margin-top:10px">
        <div class="kv"><div class="k">أطعمة ممنوعة</div><div class="v">${excludedFoods}</div></div>
        <div class="kv"><div class="k">حساسية/تحسس</div><div class="v">${allergies}</div></div>
        <div class="kv"><div class="k">ملاحظات</div><div class="v">${notes}</div></div>
      </div>
    </div>
  `;
}

function buildHtml(args: ExportArgs) {
  const { plan, metrics, targetCalories, options } = args;
  const createdAt = formatDate(new Date());
  const title = safeLabel(args.title, 'الخطة اليومية');

  const mealSection = (meal: any) => {
    const items = Array.isArray(meal?.items) ? meal.items : [];
    const rows =
      items.length > 0
        ? items
            .map(
              (it: any) => `
        <tr>
          <td class="td">${safeLabel(it?.name)}</td>
          <td class="td">${safeLabel(it?.quantity)}</td>
          <td class="td num">${n(it?.calories)}</td>
          <td class="td num">${n(it?.protein)}</td>
          <td class="td num">${n(it?.carbs)}</td>
          <td class="td num">${n(it?.fat)}</td>
        </tr>
      `
            )
            .join('')
        : `<tr><td class="td muted" colspan="6">لا توجد مكونات</td></tr>`;

    return `
      <div class="meal">
        <div class="mealHead">
          <div>
            <div class="mealName">${safeLabel(meal?.name)}</div>
            <div class="mealTime">⏰ ${safeLabel(meal?.time)}</div>
          </div>
          <div class="mealTotal">إجمالي الوجبة: <b>${n(meal?.totalCalories)}</b> سعرة</div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th class="th">المكوّن</th>
              <th class="th">الكمية</th>
              <th class="th num">السعرات</th>
              <th class="th num">البروتين</th>
              <th class="th num">الكربوهيدرات</th>
              <th class="th num">الدهون</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="tfoot">
              <td class="td tlabel" colspan="2">إجمالي الوجبة</td>
              <td class="td num">${n(meal?.totalCalories)}</td>
              <td class="td num">${n(meal?.totalProtein)}</td>
              <td class="td num">${n(meal?.totalCarbs)}</td>
              <td class="td num">${n(meal?.totalFat)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  };

  return `
  <div class="page" dir="rtl" lang="ar">
    <style>
      *{ box-sizing:border-box; }
      .page{
        width:794px;
        background:#ffffff;
        color:#111827; /* gray-900 */
        padding:22px;
        font-family: system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
      }

      .header{
        border:1px solid #e5e7eb; /* gray-200 */
        border-radius:18px;
        padding:16px;
        background:#ffffff;
      }

      .titleRow{
        display:flex;
        justify-content:space-between;
        align-items:flex-start;
        gap:12px;
      }

      .hTitle{
        font-size:18px;
        font-weight:800;
      }

      .hSub{
        margin-top:4px;
        font-size:12px;
        color:#6b7280; /* gray-500 */
      }

      .badge{
        border:1px solid #d1d5db; /* gray-300 */
        border-radius:999px;
        padding:8px 12px;
        font-size:12px;
        background:#f9fafb; /* gray-50 */
        color:#374151; /* gray-700 */
        white-space:nowrap;
      }

      .grid3{
        margin-top:12px;
        display:grid;
        grid-template-columns: repeat(3, 1fr);
        gap:10px;
      }

      .kv{
        border:1px solid #f3f4f6; /* gray-100 */
        border-radius:14px;
        padding:10px;
        background:#ffffff;
      }
      .k{
        font-size:11px;
        color:#6b7280;
      }
      .v{
        margin-top:4px;
        font-size:13px;
        font-weight:700;
        color:#111827;
      }

      .box{
        margin-top:12px;
        border:1px solid #e5e7eb;
        border-radius:18px;
        padding:14px;
        background:#ffffff;
      }

      .boxTitle{
        font-size:14px;
        font-weight:800;
        margin-bottom:10px;
        color:#111827;
      }

      .grid2{
        display:grid;
        grid-template-columns: 1fr 1fr;
        gap:10px;
      }
      .grid1{
        display:grid;
        grid-template-columns: 1fr;
        gap:10px;
      }

      .sectionTitle{
        margin-top:14px;
        font-size:15px;
        font-weight:900;
        display:flex;
        align-items:center;
        gap:8px;
      }
      .dot{
        width:10px;height:10px;border-radius:999px;
        background:#059669; /* emerald-600 */
      }

      .meal{
        margin-top:12px;
        border:1px solid #e5e7eb;
        border-radius:18px;
        overflow:hidden;
        background:#ffffff;
      }
      .mealHead{
        padding:12px 14px;
        background:#ecfdf5; /* emerald-50 */
        border-bottom:1px solid #e5e7eb;
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
      }
      .mealName{ font-weight:900; }
      .mealTime{ font-size:12px; color:#065f46; } /* emerald-800 */
      .mealTotal{ font-size:12px; color:#374151; }

      .table{
        width:100%;
        border-collapse:collapse;
        font-size:12px;
      }
      .th{
        padding:10px;
        text-align:right;
        border-bottom:1px solid #e5e7eb;
        background:#f9fafb; /* gray-50 */
        color:#374151;
        font-weight:800;
      }
      .td{
        padding:9px 10px;
        border-bottom:1px solid #f3f4f6;
        color:#111827;
      }
      .num{
        text-align:left;
        direction:ltr;
        font-variant-numeric: tabular-nums;
      }
      .muted{ color:#6b7280; text-align:center; }

      .tfoot{
        background:#f9fafb;
        font-weight:800;
      }
      .tlabel{ color:#111827; }

      .advice{
        margin-top:14px;
        border:1px solid #d1fae5; /* emerald-100 */
        background:#ecfdf5;      /* emerald-50 */
        border-radius:18px;
        padding:12px 14px;
      }
      .adviceH{
        font-weight:900;
        color:#065f46;
        margin-bottom:6px;
      }
      .adviceT{
        font-size:13px;
        color:#065f46;
        line-height:1.7;
        white-space:pre-wrap;
      }

      .footer{
        margin-top:12px;
        font-size:11px;
        color:#6b7280;
        display:flex;
        justify-content:space-between;
        gap:10px;
      }
    </style>

    <div class="header">
      <div class="titleRow">
        <div>
          <div class="hTitle">${title}</div>
          <div class="hSub">تاريخ التصدير: ${createdAt}</div>
        </div>
        <div class="badge">إجمالي اليوم: <b>${n(plan.totalCalories)}</b> سعرة</div>
      </div>

      <div class="grid3">
        <div class="kv">
          <div class="k">الاسم</div>
          <div class="v">${safeLabel(metrics.name)}</div>
        </div>
        <div class="kv">
          <div class="k">العمر</div>
          <div class="v">${n(metrics.age)} سنة</div>
        </div>
        <div class="kv">
          <div class="k">الهدف</div>
          <div class="v">${formatGoal((metrics as any).goal)}</div>
        </div>

        <div class="kv">
          <div class="k">الوزن</div>
          <div class="v">${n(metrics.weight)} كجم</div>
        </div>
        <div class="kv">
          <div class="k">الطول</div>
          <div class="v">${n(metrics.height)} سم</div>
        </div>
        <div class="kv">
          <div class="k">السعرات المستهدفة</div>
          <div class="v">${targetCalories ? n(targetCalories) : '—'}</div>
        </div>

        <div class="kv">
          <div class="k">الجنس</div>
          <div class="v">${formatGender((metrics as any).gender)}</div>
        </div>
        <div class="kv">
          <div class="k">مستوى النشاط</div>
          <div class="v">${safeLabel((metrics as any).activityLevel)}</div>
        </div>
        <div class="kv">
          <div class="k">ملاحظة</div>
          <div class="v">خطة يوم واحد</div>
        </div>
      </div>
    </div>

    ${optText(options)}

    <div class="sectionTitle"><span class="dot"></span> تفاصيل الوجبات</div>

    ${mealSection(plan.breakfast)}
    ${mealSection(plan.lunch)}
    ${mealSection(plan.dinner)}
    ${mealSection(plan.snack)}

    <div class="advice">
      <div class="adviceH">نصيحة</div>
      <div class="adviceT">${safeLabel(plan.advice)}</div>
    </div>

    <div class="footer">
      <div>Generated by AI</div>
      <div>PDF Export</div>
    </div>
  </div>
  `;
}

async function canvasToPdfMultiPage(canvas: HTMLCanvasElement, fileName: string) {
  const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let y = 0;
  let remainingHeight = imgHeight;

  pdf.addImage(imgData, 'JPEG', 0, y, imgWidth, imgHeight);
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    pdf.addPage();
    y -= pageHeight;
    pdf.addImage(imgData, 'JPEG', 0, y, imgWidth, imgHeight);
    remainingHeight -= pageHeight;
  }

  pdf.save(fileName);
}

export async function exportDailyPlanPdf(args: ExportArgs): Promise<void> {
  const { plan, metrics } = args;
  if (!plan) throw new Error('Missing plan');
  if (!metrics) throw new Error('Missing metrics');

  const fileName = args.fileName?.trim() || `خطة-يومية-${new Date().toISOString().slice(0, 10)}.pdf`;

  const host = createHiddenHost();
  try {
    host.innerHTML = buildHtml(args);

    // small delay for layout
    await new Promise((r) => setTimeout(r, 60));

    const pageEl = host.querySelector('.page') as HTMLElement | null;
    if (!pageEl) throw new Error('PDF template not found');

    const canvas = await html2canvas(pageEl, {
      scale: 2, // جودة ممتازة بدون مبالغة
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
      windowWidth: 794,
    });

    await canvasToPdfMultiPage(canvas, fileName);
  } finally {
    removeHost(host);
  }
}
