// src/components/plans/PlanActionsBar.tsx
import React from 'react';
import type { DailyPlan, UserMetrics } from '../../types';

interface PlanActionsBarProps {
  metrics: UserMetrics | null;
  loadingDaily: boolean;
  dailyPlan: DailyPlan | null;
  editMode: boolean;
  exporting: boolean;
  exportStep?: string;
  shownPlan: DailyPlan | null;
  onGenerateDaily: () => void;
  onClearPlan: () => void;
  onExportPdf: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export const PlanActionsBar: React.FC<PlanActionsBarProps> = ({
  metrics,
  loadingDaily,
  dailyPlan,
  editMode,
  exporting,
  exportStep,
  shownPlan,
  onGenerateDaily,
  onClearPlan,
  onExportPdf,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
}) => {
  return (
    <div className="mb-10 flex flex-wrap gap-3">
      <button
        onClick={onGenerateDaily}
        disabled={!metrics || loadingDaily || editMode}
        className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold disabled:opacity-50 hover:bg-emerald-700 transition-colors"
      >
        {loadingDaily ? 'جاري التوليد...' : dailyPlan ? 'إعادة توليد خطة يومية' : 'توليد خطة يومية'}
      </button>

      <button
        onClick={onClearPlan}
        disabled={loadingDaily || exporting}
        className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-800 hover:bg-gray-50"
      >
        مسح الخطة
      </button>

      <button
        onClick={onExportPdf}
        disabled={!shownPlan || loadingDaily || editMode || exporting}
        className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
      >
        {exporting ? `جاري تصدير PDF${exportStep ? ` (${exportStep})` : '...'}` : 'تصدير PDF'}
      </button>

      {!editMode ? (
        <button
          onClick={onStartEdit}
          disabled={!dailyPlan || loadingDaily || exporting}
          className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-800 hover:bg-gray-50 disabled:opacity-50"
        >
          تفعيل وضع التعديل
        </button>
      ) : (
        <>
          <button onClick={onCancelEdit} className="px-6 py-3 rounded-2xl border border-gray-200 font-bold text-gray-800">
            إلغاء التعديل
          </button>
          <button onClick={onSaveEdit} className="px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold">
            حفظ التعديلات
          </button>
        </>
      )}
    </div>
  );
};