'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { saveExamScore } from '../../../actions/exams';

export default function ScoreForm({ attemptId, maxScore }: { attemptId: string, maxScore: number }) {
  const [score, setScore] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numScore = parseFloat(score);
    if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
      setError(`Veuillez entrer une note entre 0 et ${maxScore}`);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await saveExamScore(attemptId, numScore);
    } catch (err) {
      if (err instanceof Error && err.message !== 'NEXT_REDIRECT') {
        setError("Une erreur est survenue.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="bg-amber-50 rounded-xl p-8 border border-amber-100 text-center">
      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-navy-900 mb-2">Auto-Évaluation</h3>
      <p className="text-slate-600 mb-6 max-w-lg mx-auto">
        Comparez votre brouillon avec la correction officielle ci-dessus, puis estimez votre note pour cet examen.
      </p>
      
      {error && (
        <div className="mb-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center justify-center gap-4 max-w-sm mx-auto">
        <input 
          type="number" 
          step="0.25"
          min="0" 
          max={maxScore}
          value={score}
          onChange={e => setScore(e.target.value)}
          placeholder={`/ ${maxScore}`}
          required
          className="w-24 text-center text-2xl font-bold h-14 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <Button size="lg" type="submit" disabled={isSubmitting} className="bg-navy-900 hover:bg-navy-800 text-white shadow-sm">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enregistrer ma note'}
        </Button>
      </form>
    </div>
  );
}
