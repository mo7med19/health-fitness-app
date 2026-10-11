import React from 'react';
import { UserMetrics, Goal } from '../../types';

interface UserMetricsCardProps {
  metrics: UserMetrics | null;
  targetCalories: number;
  hasCalories: boolean;
}

export const UserMetricsCard: React.FC<UserMetricsCardProps> = ({ metrics, targetCalories, hasCalories }) => {
  return (
    <div className="mb-8 rounded-3xl border border-gray-100 p-6 bg-white shadow-sm">
      {metrics ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div>الاسم: <b>{metrics.name}</b></div>
          <div>العمر: <b>{metrics.age}</b></div>
          <div>الوزن: <b>{metrics.weight} كجم</b></div>
          <div>الطول: <b>{metrics.height} سم</b></div>
          <div>الهدف: <b>{metrics.goal === Goal.LOSE ? 'خسارة وزن' : metrics.goal === Goal.GAIN ? 'زيادة وزن' : 'ثبات'}</b></div>
          <div>سعرات الهدف: <b>{hasCalories ? Math.round(targetCalories) : '—'}</b></div>
        </div>
      ) : (
        <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-4">
          ما لقينا بيانات محفوظة من الحاسبة. روح للحاسبة وعبّي البيانات أولاً.
        </div>
      )}
    </div>
  );
};