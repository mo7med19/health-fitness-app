import React from 'react';
import type { MealAlternativeResponse } from '../../services/geminiService';

export interface AlternativeRowProps {
  alternative: MealAlternativeResponse;
  colSpan: number;
  onApply: () => void;
  onCancel: () => void;
}

export const AlternativeRow: React.FC<AlternativeRowProps> = ({
  alternative,
  colSpan,
  onApply,
  onCancel,
}) => {
  return (
    <tr>
      <td colSpan={colSpan} className="p-3 bg-indigo-50/80 border-b border-indigo-100">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-bold text-indigo-900 text-sm">البديل المقترح: </span>
            <span className="font-semibold text-indigo-800 text-sm">{alternative.alternativeMealName}</span>
            <p className="text-xs text-indigo-700 mt-0.5">{alternative.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onApply}
              className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >
              اعتماد البديل
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};