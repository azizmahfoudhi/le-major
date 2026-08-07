import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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
      exams (
        id,
        title,
        questions
      )
    `)
    .eq('id', attemptId)
    .single();

  if (!attempt || !attempt.exams) {
    redirect('/mode-examen');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = ((attempt.exams as unknown as { questions: any[] })?.questions) || [];

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
          Vous avez complété l'épreuve "{(attempt.exams as unknown as { title: string })?.title}".
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
                  <div className="prose prose-slate max-w-none text-slate-800">
                    {/* For now, just show a placeholder correction or render from q.solution if we add it to JSON */}
                    <p className="italic text-slate-500">
                      La correction détaillée pour cette question sera affichée ici. Vous pouvez comparer votre brouillon avec cette réponse attendue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        <div className="bg-amber-50 rounded-xl p-8 border border-amber-100 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-navy-900 mb-2">Auto-Évaluation</h3>
          <p className="text-slate-600 mb-6 max-w-lg mx-auto">
            Comparez votre brouillon avec la correction officielle ci-dessus, puis estimez votre note pour cet examen.
          </p>
          <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
            <input 
              type="number" 
              min="0" 
              max="20"
              placeholder="/ 20"
              disabled
              className="w-24 text-center text-2xl font-bold h-14 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
            />
            <Button size="lg" disabled className="bg-navy-900 opacity-50 cursor-not-allowed">
              Enregistrer ma note
            </Button>
          </div>
          <p className="text-xs text-amber-600 mt-4">
            *L'enregistrement des notes sera bientôt disponible.
          </p>
        </div>
      </div>
    </div>
  );
}
