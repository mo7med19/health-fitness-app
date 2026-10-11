// src/components/Exercises.tsx
import React, { useState } from 'react';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import type { ExerciseEntry } from '../types/exercise';
import { ExerciseSummaryCard } from './exercises/ExerciseSummaryCard';
import { ExerciseForm } from './exercises/ExerciseForm';
import { ExerciseTable } from './exercises/ExerciseTable';

const STORAGE_EXERCISES = 'userExercises_v1';

const Exercises: React.FC = () => {
  const [exercises, setExercises] = useLocalStorageState<ExerciseEntry[]>(STORAGE_EXERCISES, []);
  const [editingExercise, setEditingExercise] = useState<ExerciseEntry | null>(null);

  const handleSaveExercise = (exerciseData: Omit<ExerciseEntry, 'id' | 'date'>) => {
    if (editingExercise) {
      // تحديث تمرين موجود
      setExercises(
        exercises.map((item) =>
          item.id === editingExercise.id ? { ...item, ...exerciseData } : item
        )
      );
      setEditingExercise(null);
    } else {
      // إضافة تمرين جديد
      const newExercise: ExerciseEntry = {
        ...exerciseData,
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 10),
      };
      setExercises([newExercise, ...exercises]);
    }
  };

  const handleDelete = (id: string) => {
    setExercises(exercises.filter((item) => item.id !== id));
    if (editingExercise?.id === id) {
      setEditingExercise(null);
    }
  };

  const handleStartEdit = (exercise: ExerciseEntry) => {
    setEditingExercise(exercise);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">متعقب التمارين والنشاط الرياضي</h2>
          <p className="text-gray-600 mt-2">سجّل تمارينك اليومية، احسب سعراتك ذكياً، وتابع إحصائياتك الأسبوعية</p>
        </div>

        <ExerciseSummaryCard exercises={exercises} />
        
        <ExerciseForm
          onSave={handleSaveExercise}
          editingExercise={editingExercise}
          onCancelEdit={() => setEditingExercise(null)}
        />

        <ExerciseTable
          exercises={exercises}
          onDelete={handleDelete}
          onEdit={handleStartEdit}
        />
      </div>
    </div>
  );
};

export default Exercises;