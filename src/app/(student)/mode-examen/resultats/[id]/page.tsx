import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import ScoreForm from './score-form';

export const metadata: Metadata = {
  title: 'Résultats Examen | Le Major',
};

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

export default async function ExamResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: attemptId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/connexion');
  }

  const { data: attempt } = await supabase
    .from('exam_attempts')
    .select(`
      id,
      status,
      score,
      exam_id,
      exams (
        title
      )
    `)
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single();

  if (!attempt) {
    redirect('/mode-examen');
  }

  // @ts-expect-error Types Supabase
  const title = attempt.exams ? (attempt.exams as {title: string}).title : 'Examen Le Major (Personnalisé)';

  // Fetch the exercises
  const { data: attemptExercises } = await supabase
    .from('exam_attempt_exercises')
    .select(`
      order_index,
      student_score,
      exercises (
        id,
        theme,
        points,
        statement_body,
        solution_body
      )
    `)
    .eq('attempt_id', attemptId)
    .order('order_index', { ascending: true });

  const questions = attemptExercises?.map((ae, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ex: any = ae.exercises;
    return {
      id: ex.id,
      number: index + 1,
      theme: ex.theme || 'Exercice',
      points: ex.points || 5,
      statement: ex.statement_body || '',
      solution: ex.solution_body || ''
    };
  }) || [];

  const maxTotalScore = questions.reduce((acc, q) => acc + (parseFloat(q.points as string) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <Link 
        href="/mode-examen"
        className="inline-flex items-center text-sm font-medium text-navy-600 hover:text-navy-900 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour aux examens
      </Link>

      <div className="bg-white rounded-card shadow-card p-8 border border-gray-100 text-center mb-10">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-display font-bold text-navy-900 mb-2">
          Examen Terminé
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Vous avez complété l'épreuve "{title}".
        </p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-6">Correction Détaillée</h2>

        {questions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-xl">
            La correction n'est pas encore disponible pour cet examen.
          </div>
        ) : (
          questions.map((q) => (
            <div key={q.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-slate-50 border-b border-gray-100 p-6 flex flex-wrap items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-navy-900">Question {q.number}</h3>
                  <p className="text-slate-500 text-sm mt-1">{q.theme}</p>
                </div>
                <div className="mt-2 sm:mt-0 px-4 py-1.5 bg-gold-50 text-gold-700 font-bold rounded-full text-sm">
                  Barème: {q.points} points
                </div>
              </div>
              
              <div className="p-6 sm:p-8">
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Énoncé</h4>
                  <div 
                    className="prose prose-slate max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: renderMath(q.statement) }}
                  />
                </div>
                
                <div className="bg-emerald-50/50 rounded-lg p-6 border border-emerald-100">
                  <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Correction Officielle
                  </h4>
                  <div 
                    className="prose prose-slate max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: renderMath(q.solution || "Pas de correction fournie.") }}
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {attempt.status !== 'evaluated' ? (
          <ScoreForm attemptId={attempt.id} maxScore={maxTotalScore || 20} />
        ) : (
          <div className="bg-navy-50 rounded-xl p-8 border border-navy-100 text-center">
            <h3 className="text-xl font-bold text-navy-900 mb-2">Note Enregistrée</h3>
            <p className="text-slate-600 mb-4">
              Votre score de {attempt.score} / {maxTotalScore || 20} a été pris en compte.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
