// src/components/Progress.tsx
import React, { useState } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorageState';

interface WeightLog {
  id: string;
  date: string;
  weight: number;
  note?: string;
}

const STORAGE_KEY = 'userWeightLogs_v1';

const Progress: React.FC = () => {
  const [logs, setLogs] = useLocalStorageState<WeightLog[]>(STORAGE_KEY, []);
  const [currentWeightInput, setCurrentWeightInput] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sortedAscLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedDescLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const initialWeight = logs.length > 0 ? sortedAscLogs[0].weight : null;
  const latestWeight = logs.length > 0 ? sortedAscLogs[sortedAscLogs.length - 1].weight : null;
  const weightDifference = initialWeight !== null && latestWeight !== null ? Number((latestWeight - initialWeight).toFixed(1)) : 0;

  // حساب التحليلات الأسبوعية البسيطة (آخر 7 أيام)
  const totalLogsCount = logs.length;
  const averageWeight = totalLogsCount > 0 ? Number((logs.reduce((acc, l) => acc + l.weight, 0) / totalLogsCount).toFixed(1)) : 0;

  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const weightNum = parseFloat(currentWeightInput);
    if (!Number.isFinite(weightNum) || weightNum < 20 || weightNum > 350) {
      setError('يرجى إدخال وزن صحيح بين 20 و 350 كجم.');
      return;
    }

    const newLog: WeightLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      weight: weightNum,
      note: currentNote.trim() || undefined,
    };

    setLogs([newLog, ...logs]);
    setCurrentWeightInput('');
    setCurrentNote('');
  };

  const handleDeleteLog = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  const chartHeight = 160;
  const chartWidth = 600;
  const padding = 30;

  let points = '';
  if (sortedAscLogs.length > 1) {
    const weights = sortedAscLogs.map((l) => l.weight);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const rangeW = maxW - minW || 1;

    const availableWidth = chartWidth - padding * 2;
    const availableHeight = chartHeight - padding * 2;

    points = sortedAscLogs
      .map((log, idx) => {
        const x = padding + (idx / (sortedAscLogs.length - 1)) * availableWidth;
        const y = chartHeight - padding - ((log.weight - minW) / rangeW) * availableHeight;
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">تتبع الوزن والملخص الأسبوعي</h2>
          <p className="text-gray-600 mt-2">راقب تقدمك البدني واحصِ إحصائياتك بانتظام</p>
        </div>

        {/* بطاقات الملخص البدني والتحليلات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl border shadow-sm text-center">
            <div className="text-xs text-gray-500">الوزن الحالي</div>
            <div className="text-xl font-extrabold text-emerald-700 mt-1">
              {latestWeight !== null ? `${latestWeight} كجم` : '—'}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border shadow-sm text-center">
            <div className="text-xs text-gray-500">الوزن المبدئي</div>
            <div className="text-xl font-extrabold text-gray-800 mt-1">
              {initialWeight !== null ? `${initialWeight} كجم` : '—'}
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border shadow-sm text-center">
            <div className="text-xs text-gray-500">إجمالي التغيير</div>
            <div className={`text-xl font-extrabold mt-1 ${weightDifference <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {weightDifference > 0 ? `+${weightDifference}` : weightDifference} كجم
            </div>
          </div>
          <div className="bg-white p-5 rounded-3xl border shadow-sm text-center">
            <div className="text-xs text-gray-500">متوسط الأوزان المسجلة</div>
            <div className="text-xl font-extrabold text-blue-600 mt-1">
              {averageWeight > 0 ? `${averageWeight} كجم` : '—'}
            </div>
          </div>
        </div>

        {/* نموذج الإضافة */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">إضافة تسجيل قياس جديد</h3>
          <form onSubmit={handleAddWeight} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الوزن (كجم)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeightInput}
                onChange={(e) => setCurrentWeightInput(e.target.value)}
                placeholder="مثال: 68.5"
                className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظة (اختياري)</label>
              <input
                type="text"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="مثال: صباحاً قبل الوجبة الأولى"
                className="w-full px-4 py-3 border rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                إضافة القياس
              </button>
            </div>
          </form>
          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </div>

        {/* قسم الرسم البياني البصري */}
        {sortedAscLogs.length > 1 && (
          <div className="bg-white p-6 rounded-3xl border shadow-sm mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">مخطط تطور الوزن</h3>
            <div className="w-full overflow-x-auto flex justify-center">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full max-w-xl h-44">
                <polyline
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3"
                  points={points}
                />
                {sortedAscLogs.map((log, idx) => {
                  const weights = sortedAscLogs.map((l) => l.weight);
                  const minW = Math.min(...weights) - 1;
                  const maxW = Math.max(...weights) + 1;
                  const rangeW = maxW - minW || 1;
                  const availableWidth = chartWidth - padding * 2;
                  const availableHeight = chartHeight - padding * 2;
                  const x = padding + (idx / (sortedAscLogs.length - 1)) * availableWidth;
                  const y = chartHeight - padding - ((log.weight - minW) / rangeW) * availableHeight;

                  return (
                    <g key={log.id}>
                      <circle cx={x} cy={y} r="5" fill="#047857" />
                      <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#374151">
                        {log.weight}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* جدول السجلات */}
        <div className="bg-white p-6 rounded-3xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">سجل القياسات السابقة</h3>
          {sortedDescLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-6">لا توجد سجلات وزن حتى الآن. أضف قياسك الأول بالأعلى!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-2xl overflow-hidden">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="text-right p-3 border-b">التاريخ</th>
                    <th className="text-right p-3 border-b">الوزن</th>
                    <th className="text-right p-3 border-b">ملاحظة</th>
                    <th className="text-center p-3 border-b">إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDescLogs.map((log) => (
                    <tr key={log.id} className="text-gray-700 border-b hover:bg-gray-50">
                      <td className="p-3">{log.date}</td>
                      <td className="p-3 font-bold text-emerald-700">{log.weight} كجم</td>
                      <td className="p-3 text-gray-500">{log.note || '—'}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-red-500 hover:text-red-700 text-xs px-3 py-1 rounded-full bg-red-50 border border-red-100"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;