'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Clock, AlertTriangle, Check, LayoutList } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatTimer } from '@/lib/utils/dates';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { completeExamAttempt } from '../../../actions/exams';

interface Question {
  id: string;
  number: number;
  theme: string;
  points: number;
  statement: string;
}

interface ExamProps {
  attemptId: string;
  title: string;
  durationMinutes: number;
  questions: Question[];
  matiere?: string | null;
  filiere?: string | null;
}

function renderMath(text: string) {
  let html = text;
  
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  html = html.replace(/\$([^\$]+)\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });

  html = html.replace(/\n\n/g, '<br/><br/>');
  html = html.replace(/\n/g, '<br/>');
  
  return html;
}

export default function ExamClient({ attemptId, title, durationMinutes, questions, matiere, filiere }: ExamProps) {
  const router = useRouter();
  const examDurationSeconds = durationMinutes * 60;
  
  const [timeLeft, setTimeLeft] = useState(examDurationSeconds);
  const [isFinished, setIsFinished] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(questions[0]?.id || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleFinish = async () => {
    setIsSubmitting(true);
    await completeExamAttempt(attemptId);
    router.push(`/mode-examen/resultats/${attemptId}`);
  };

  const isWarning = timeLeft < examDurationSeconds * 0.1;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  if (questions.length === 0) {
    return <div className="p-12 text-center">Aucune question n&apos;a été trouvée pour cet examen.</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col overflow-hidden">

      {/* Top bar - timer + controls */}
      <header className="h-14 bg-[#3d1a1a] text-white flex items-center justify-between px-4 sm:px-6 shadow-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-1.5 text-white/70 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-white/80 hidden sm:block truncate max-w-xs">{title}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full font-mono font-bold text-sm transition-colors",
            isWarning ? "bg-red-500 text-white animate-pulse" : "bg-white/15 text-white"
          )}>
            <Clock className="w-4 h-4" />
            {formatTimer(timeLeft)}
          </div>
          <Button
            size="sm"
            onClick={() => setShowConfirmModal(true)}
            className="bg-white text-[#3d1a1a] hover:bg-white/90 font-semibold text-sm px-4"
          >
            <Check className="w-4 h-4 mr-1.5" />
            Terminer
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className={cn(
          "absolute inset-y-0 left-0 w-56 bg-white border-r border-gray-200 z-20 transform transition-transform md:relative md:translate-x-0 overflow-y-auto flex flex-col",
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}>
          <div className="p-4 border-b border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Exercices</p>
            <p className="text-xs text-gray-500 mt-0.5">{totalPoints} points au total</p>
          </div>
          <div className="p-3 space-y-1 flex-1 overflow-y-auto">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => { setActiveQuestion(q.id); setMobileMenuOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors text-sm",
                  activeQuestion === q.id
                    ? "bg-[#3d1a1a]/8 border border-[#3d1a1a]/20 text-[#3d1a1a] font-semibold"
                    : "hover:bg-gray-50 text-gray-600 border border-transparent"
                )}
              >
                <span className="truncate">Exercice {q.number}</span>
                <span className="text-xs text-gray-400 shrink-0 ml-1">{q.points}pts</span>
              </button>
            ))}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="absolute inset-0 bg-black/20 z-10 md:hidden" onClick={() => setMobileMenuOpen(false)} />
        )}

        {/* Main content - exam paper */}
        <main className="flex-1 overflow-y-auto bg-gray-100 py-6 px-4 sm:px-8">
          <div className="max-w-3xl mx-auto space-y-6 pb-24">

            {/* IHEC-style exam header card */}
            <div className="bg-white shadow-sm border border-gray-300 font-serif" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              
              {/* Row 1: logos + ministry */}
              <div className="grid grid-cols-3 border-b border-gray-300 text-center text-xs">
                <div className="border-r border-gray-300 p-3 flex flex-col items-center justify-center gap-1">
                  <div className="w-10 h-10 bg-[#3d1a1a] rounded flex items-center justify-center text-white font-bold text-sm">
                    LM
                  </div>
                  <span className="text-[10px] text-gray-500 leading-tight">Le Major</span>
                </div>
                <div className="border-r border-gray-300 p-3 flex flex-col items-center justify-center gap-0.5">
                  <p className="text-[9px] font-semibold leading-tight text-gray-700">Ministère de l&apos;Enseignement Supérieur</p>
                  <p className="text-[9px] font-semibold leading-tight text-gray-700">et de la Recherche Scientifique</p>
                  <p className="text-[9px] text-gray-500 mt-0.5" dir="rtl">وزارة التعليم العالي والبحث العلمي</p>
                </div>
                <div className="p-3 flex flex-col items-center justify-center gap-0.5">
                  <div className="flex items-end gap-0.5 mb-0.5">
                    {[4,6,8,6,4].map((h, i) => (
                      <div key={i} className="w-1 bg-[#3d1a1a] rounded-t" style={{height: `${h}px`}} />
                    ))}
                  </div>
                  <p className="text-[9px] text-gray-700 font-semibold" dir="rtl">جامعة قرطاج</p>
                  <p className="text-[9px] text-gray-600">Université de Carthage</p>
                </div>
              </div>

              {/* Row 2: Exam title */}
              <div className="border-b border-gray-300 px-4 py-2.5 text-center">
                <p className="font-bold text-sm tracking-wide">{title}</p>
              </div>

              {/* Row 3: Filière / Matière / Durée */}
              <div className="grid grid-cols-[1fr_3fr_1fr] text-xs">
                <div className="border-r border-gray-300 px-3 py-3 flex items-center">
                  {filiere && <span className="text-gray-500">{filiere}</span>}
                </div>
                <div className="border-r border-gray-300 px-4 py-3 space-y-1">
                  {filiere && <p><span className="font-semibold">Filière :</span> {filiere}</p>}
                  {matiere && <p><span className="font-semibold">Matière :</span> {matiere}</p>}
                  <p><span className="font-semibold">Session Le Major</span> — Mode Examen</p>
                </div>
                <div className="px-3 py-3 flex flex-col items-center justify-center gap-1">
                  <p className="text-[10px] text-gray-500">Durée</p>
                  <div className="border-2 border-gray-800 rounded px-2 py-0.5">
                    <span className="font-bold text-sm">{durationMinutes >= 60 ? `${Math.floor(durationMinutes/60)}H${durationMinutes % 60 > 0 ? (durationMinutes%60).toString().padStart(2,'0') : ''}` : `${durationMinutes}min`}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NB note */}
            <p className="text-xs text-gray-600 italic px-1">
              NB. Arrondir tous les calculs au troisième chiffre après la virgule.
            </p>
            <hr className="border-gray-400" />

            {/* Exercises */}
            {questions.map((q) => (
              <div
                key={q.id}
                id={q.id}
                className={cn(
                  "bg-white shadow-sm border border-gray-200 p-6 sm:p-8",
                  activeQuestion === q.id ? "ring-2 ring-[#3d1a1a]/30" : "hidden"
                )}
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
                  <h2 className="font-bold text-base underline underline-offset-2">
                    Exercice {q.number} : <span className="font-normal">({q.points} points)</span>
                  </h2>
                  {q.theme && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{q.theme}</span>
                  )}
                </div>
                <div
                  className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMath(q.statement) }}
                />
              </div>
            ))}

            {/* Question navigation arrows */}
            <div className="flex justify-between items-center px-1">
              <button
                onClick={() => {
                  const idx = questions.findIndex(q => q.id === activeQuestion);
                  if (idx > 0) setActiveQuestion(questions[idx - 1].id);
                }}
                disabled={questions.findIndex(q => q.id === activeQuestion) === 0}
                className="text-sm text-gray-500 hover:text-[#3d1a1a] disabled:opacity-30 flex items-center gap-1 transition-colors"
              >
                ← Précédent
              </button>
              <span className="text-xs text-gray-400">
                {questions.findIndex(q => q.id === activeQuestion) + 1} / {questions.length}
              </span>
              <button
                onClick={() => {
                  const idx = questions.findIndex(q => q.id === activeQuestion);
                  if (idx < questions.length - 1) setActiveQuestion(questions[idx + 1].id);
                }}
                disabled={questions.findIndex(q => q.id === activeQuestion) === questions.length - 1}
                className="text-sm text-gray-500 hover:text-[#3d1a1a] disabled:opacity-30 flex items-center gap-1 transition-colors"
              >
                Suivant →
              </button>
            </div>

          </div>
        </main>
      </div>

      {/* Time's up overlay */}
      {isFinished && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#3d1a1a] mb-4">Temps écoulé !</h2>
            <p className="text-gray-600 mb-8">Le temps imparti pour cet examen est terminé.</p>
            <Button className="w-full bg-[#3d1a1a] hover:bg-[#3d1a1a]/90 text-white font-bold py-4 text-lg rounded-lg" onClick={handleFinish} disabled={isSubmitting}>
              Voir la correction
            </Button>
          </div>
        </div>
      )}

      {/* Confirm finish modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Terminer l'examen ?">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6 text-amber-700 bg-amber-50 p-4 rounded-lg">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">
              Êtes-vous sûr de vouloir terminer ? Il vous reste encore {formatTimer(timeLeft)}.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Annuler</Button>
            <Button onClick={handleFinish} disabled={isSubmitting} className="bg-[#3d1a1a] text-white hover:bg-[#3d1a1a]/90">
              {isSubmitting ? 'Enregistrement...' : 'Oui, terminer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
