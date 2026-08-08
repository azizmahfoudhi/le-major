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

export default function ExamClient({ attemptId, title, durationMinutes, questions }: ExamProps) {
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

  if (questions.length === 0) {
    return <div className="p-12 text-center">Aucune question n'a été trouvée pour cet examen.</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden">
      <header className="h-16 bg-navy-900 text-white flex items-center justify-between px-4 sm:px-6 shadow-md z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden p-2 -ml-2 text-white/80 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg hidden sm:block">
              {title}
            </h1>
            <h1 className="font-display font-bold text-lg sm:hidden truncate max-w-[200px]">
              {title}
            </h1>
            <p className="text-xs text-white/70">Session #{attemptId.substring(0, 6)}</p>
          </div>
        </div>

        <div className={cn(
          "flex items-center px-4 py-2 rounded-full font-mono font-bold text-lg transition-colors",
          isWarning ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white"
        )}>
          <Clock className="w-5 h-5 mr-2" />
          {formatTimer(timeLeft)}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <div className={cn(
          "absolute inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-20 transform transition-transform md:relative md:translate-x-0 overflow-y-auto",
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}>
          <div className="p-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
              Questions
            </h2>
            <div className="space-y-2">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setActiveQuestion(q.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors",
                    activeQuestion === q.id
                      ? "bg-navy-900/5 border border-navy-900/20 text-navy-900 font-bold"
                      : "hover:bg-slate-50 text-slate-600 border border-transparent"
                  )}
                >
                  <span className="truncate">Question {q.number}</span>
                  <span className="text-xs font-normal text-slate-400">{q.points} pts</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div 
            className="absolute inset-0 bg-black/20 z-10 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8 scroll-smooth">
          <div className="max-w-3xl mx-auto pb-24">
            {questions.map((q) => (
              <div 
                key={q.id} 
                id={q.id}
                className={cn(
                  "bg-white rounded-card shadow-card p-6 sm:p-10 mb-8 border border-gray-100",
                  activeQuestion === q.id ? "ring-2 ring-gold ring-offset-2" : "hidden"
                )}
              >
                <div className="flex flex-wrap items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <h2 className="text-2xl font-display font-bold text-navy-900">
                    Question {q.number}
                  </h2>
                  <div className="flex items-center space-x-3 mt-2 sm:mt-0">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                      {q.theme}
                    </span>
                    <span className="px-3 py-1 bg-gold-500/10 text-gold-600 rounded-full text-sm font-bold">
                      {q.points} points
                    </span>
                  </div>
                </div>

                <div 
                  className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-lg"
                  dangerouslySetInnerHTML={{ __html: renderMath(q.statement) }}
                />
              </div>
            ))}

            <div className="flex justify-center mt-12 mb-8">
              <Button 
                size="lg"
                onClick={() => setShowConfirmModal(true)}
                className="bg-navy-900 hover:bg-navy-900/90 text-white px-8 py-6 rounded-lg text-lg font-bold shadow-lg"
              >
                <Check className="w-5 h-5 mr-2" />
                Terminer l'examen
              </Button>
            </div>
          </div>
        </main>
      </div>

      {isFinished && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-display font-bold text-navy-900 mb-4">Temps écoulé !</h2>
            <p className="text-slate-600 mb-8">
              Le temps imparti pour cet examen est terminé. Veuillez déposer vos stylos.
            </p>
            <Button 
              className="w-full bg-gold-500 hover:bg-gold-500/90 text-white font-bold py-4 text-lg rounded-lg"
              onClick={handleFinish}
              disabled={isSubmitting}
            >
              Voir la correction
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Terminer l'examen ?"
      >
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6 text-amber-600 bg-amber-50 p-4 rounded-lg">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-medium">
              Êtes-vous sûr de vouloir terminer ? Vous avez encore {formatTimer(timeLeft)} disponibles.
            </p>
          </div>
          <div className="flex space-x-4 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmModal(false)}
              className="px-6 py-2 border-gray-200 text-slate-600 hover:bg-slate-50"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleFinish}
              disabled={isSubmitting}
              className="bg-navy-900 hover:bg-navy-900/90 text-white px-6 py-2"
            >
              {isSubmitting ? 'Enregistrement...' : 'Oui, terminer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
