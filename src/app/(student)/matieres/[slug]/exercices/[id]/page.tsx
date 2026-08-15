import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { renderMarkdownBody } from '@/lib/markdown/parse';

export const metadata: Metadata = {
  title: 'Exercice | Le Major',
};

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: exercise } = await supabase
    .from('exercises')
    .select(`
      id,
      title,
      difficulty,
      subject_id,
      exam_id,
      theme,
      statement_body,
      solution_body
    `)
    .eq('id', id)
    .single();

  if (!exercise) {
    notFound();
  }

  // Look up subject separately to avoid PostgREST FK cache issues
  const { data: subject } = exercise.subject_id
    ? await supabase
        .from('subjects')
        .select('name, slug')
        .eq('id', exercise.subject_id)
        .single()
    : { data: null };

  // Look up exam title separately
  const { data: examData } = exercise.exam_id
    ? await supabase
        .from('exams')
        .select('title')
        .eq('id', exercise.exam_id)
        .single()
    : { data: null };

  // Pre-render markdown securely using centralized parser
  const statementContent = await renderMarkdownBody(exercise.statement_body || '*Aucun énoncé*');
  const solutionContent = exercise.solution_body ? await renderMarkdownBody(exercise.solution_body) : null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <Link 
        href={`/matieres/${slug}`}
        className="inline-flex items-center text-sm font-medium text-navy-600 hover:text-navy-900 mb-8 transition-colors"
      >
        Retour à {subject?.name || slug}
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Exercice
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'intermediate' ? 'Intermédiaire' : 'Difficile'}
          </span>
          {examData?.title && (
            <span className="text-xs font-semibold text-navy-600 bg-navy-50 px-3 py-1 rounded-full uppercase tracking-wider border border-navy-100">
              {examData.title}
            </span>
          )}
          {exercise.theme && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {exercise.theme}
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-navy-900">
          {exercise.title}
        </h1>
      </div>

      <div className="space-y-8">
        <Card className="border-navy-100 shadow-md">
          <CardContent className="p-8">
            <h2 className="text-xl font-bold text-navy-900 mb-6 border-b border-gray-100 pb-4">Énoncé</h2>
            <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-lg">
              {statementContent}
            </div>
          </CardContent>
        </Card>

        {solutionContent && (
          <details className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden open:ring-2 open:ring-emerald-500 open:ring-offset-2 transition-all">
            <summary className="flex items-center justify-between p-6 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-emerald-500 mr-3" />
                <span className="text-lg font-bold text-navy-900">Voir la correction détaillée</span>
              </div>
              <span className="text-slate-400 group-open:rotate-180 transition-transform duration-300">
                ▼
              </span>
            </summary>
            
            <div className="p-8 border-t border-gray-100 bg-white">
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-lg">
                {solutionContent}
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
