'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Clock, BarChart, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const SUBJECTS = [
  { id: 'maths', name: 'Mathématiques' },
  { id: 'physique', name: 'Physique-Chimie' }
];

const CHAPTERS = {
  maths: [
    { id: 'c1', name: 'Nombres Complexes' },
    { id: 'c2', name: 'Intégration' },
    { id: 'c3', name: 'Probabilités' }
  ],
  physique: [
    { id: 'p1', name: 'Mécanique Quantique' },
    { id: 'p2', name: 'Thermodynamique' }
  ]
};

const DURATIONS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1h' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2h' },
  { value: '150', label: '2h30' },
  { value: '180', label: '3h' }
];

export default function ConfigExamenPage() {
  const router = useRouter();
  const [subject, setSubject] = useState('maths');
  const [chapters, setChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState('intermediaire');
  const [duration, setDuration] = useState('120');

  const handleChapterToggle = (id: string) => {
    setChapters(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (chapters.length === 0) return;
    
    // Generate a mock ID
    const sessionId = Math.random().toString(36).substring(7);
    router.push(`/mode-examen/session/${sessionId}`);
  };

  const currentChapters = CHAPTERS[subject as keyof typeof CHAPTERS];

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-navy-900 mb-4">
          Configuration de l'Examen
        </h1>
        <p className="text-lg text-slate-600">
          Personnalisez votre session d'entraînement pour cibler vos besoins.
        </p>
      </div>

      <Card className="p-8 shadow-card rounded-card border-gray-100 bg-white">
        <div className="space-y-8">
          {/* Matière */}
          <div>
            <h2 className="flex items-center text-xl font-bold text-navy-900 mb-4">
              <BookOpen className="w-5 h-5 mr-2 text-gold-600" />
              Matière
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUBJECTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSubject(s.id);
                    setChapters([]); // Reset chapters on subject change
                  }}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-colors font-medium",
                    subject === s.id
                      ? "border-gold-500 bg-gold-500/5 text-navy-900"
                      : "border-gray-200 text-slate-600 hover:border-gray-300"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chapitres */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center text-xl font-bold text-navy-900">
                <CheckCircle className="w-5 h-5 mr-2 text-gold-600" />
                Chapitres
              </h2>
              <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {currentChapters.length * 3} exercices disponibles
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentChapters.map(c => (
                <label
                  key={c.id}
                  className={cn(
                    "flex items-start p-4 rounded-lg border cursor-pointer transition-colors",
                    chapters.includes(c.id)
                      ? "border-navy-900 bg-navy-900/5"
                      : "border-gray-200 hover:bg-slate-50"
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 mr-3 w-4 h-4 text-navy-900 border-gray-300 rounded focus:ring-navy-500"
                    checked={chapters.includes(c.id)}
                    onChange={() => handleChapterToggle(c.id)}
                  />
                  <span className="font-medium text-navy-900">{c.name}</span>
                </label>
              ))}
            </div>
            {chapters.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                Veuillez sélectionner au moins un chapitre.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Difficulté */}
            <div>
              <h2 className="flex items-center text-xl font-bold text-navy-900 mb-4">
                <BarChart className="w-5 h-5 mr-2 text-gold-600" />
                Difficulté
              </h2>
              <div className="space-y-3">
                {[
                  { id: 'facile', label: 'Facile' },
                  { id: 'intermediaire', label: 'Intermédiaire' },
                  { id: 'difficile', label: 'Difficile' }
                ].map(d => (
                  <label
                    key={d.id}
                    className="flex items-center p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-slate-50"
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      className="w-4 h-4 text-navy-900 border-gray-300 focus:ring-navy-500 mr-3"
                      checked={difficulty === d.id}
                      onChange={() => setDifficulty(d.id)}
                    />
                    <span className="font-medium text-navy-900">{d.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Durée */}
            <div>
              <h2 className="flex items-center text-xl font-bold text-navy-900 mb-4">
                <Clock className="w-5 h-5 mr-2 text-gold-600" />
                Durée
              </h2>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-4 rounded-lg border border-gray-200 bg-white text-navy-900 font-medium focus:ring-2 focus:ring-navy-500 focus:border-navy-900 outline-none"
              >
                {DURATIONS.map(d => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <Button 
              size="lg" 
              onClick={handleStart}
              disabled={chapters.length === 0}
              className="bg-gold-500 hover:bg-gold-500/90 text-white font-bold px-8 py-6 rounded-lg text-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            >
              Commencer l'examen
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
