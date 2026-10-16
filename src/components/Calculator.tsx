// src/components/Calculator.tsx
import React, { useState, useMemo } from 'react';
import type { CalculatorResults } from '../types';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { calculateNutrition } from '../domain/nutrition';
import {
  DEFAULT_DRAFT,
  validate,
  parseMetrics,
  sanitizeResults,
  generatePDFReport,
} from './calculator/calculator.utils';
import { CalculatorForm } from './calculator/CalculatorForm';
import { CalculatorResultsView } from './calculator/CalculatorResultsView';

const Calculator: React.FC = () => {
  const [draft, setDraft] = useLocalStorageState('userMetricsDraft', DEFAULT_DRAFT);
  const [results, setResults] = useLocalStorageState<CalculatorResults | null>('calculatorResults', null);
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => validate(draft), [draft]);
  const canCalculate = useMemo(() => Object.keys(errors).length === 0, [errors]);
  const safeResults = useMemo(() => (results ? sanitizeResults(results) : null), [results]);

  const handleCalculate = async () => {
    const metrics = parseMetrics(draft);
    if (!metrics) return;

    setLoading(true);
    try {
      const computed = calculateNutrition(metrics as any);
      const cleaned = sanitizeResults(computed);
      setResults(cleaned);
    } catch (err) {
      console.error('Error calculating nutrition:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setDraft(DEFAULT_DRAFT);
    setResults(null);
  };

  const handleGeneratePDF = () => {
    if (!safeResults) return;
    generatePDFReport(draft, safeResults);
  };

  return (
    <section className="py-12 bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">حاسبة السعرات والماكروز الذكية</h1>
          <p className="text-gray-600 mt-2">احسب احتياجك بدقة علمية متكاملة لتحقيق هدفك الرياضي والغذائي</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <CalculatorForm
            draft={draft}
            errors={errors}
            canCalculate={canCalculate}
            loading={loading}
            onChange={setDraft}
            onCalculate={handleCalculate}
            onReset={handleResetForm}
          />

          <CalculatorResultsView
            safeResults={safeResults}
            onGeneratePdf={handleGeneratePDF}
          />
        </div>
      </div>
    </section>
  );
};

export default Calculator;