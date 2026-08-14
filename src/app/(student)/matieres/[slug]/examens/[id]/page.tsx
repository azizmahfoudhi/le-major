import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, FileText, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/lib/markdown/components';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'Examen | Le Major',
  description: "Annales et examens blancs",
};

export default async function ExamPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase
    .from('exams')
    .select(`
      id,
      title,
      description,
      duration_minutes,
      is_mock_exam,
      subjects!inner (
        name,
        slug
      )
    `)
    .eq('id', id)
    .single();

  if (!exam) {
    notFound();
  }

  // @ts-expect-error Types Supabase
  if (exam.subjects?.slug !== slug) {
    notFound();
  }

  const { data: exercises } = await supabase
    .from('exercises')
    .select(`
      id,
      title,
      statement_body,
      solution_body,
      points
    `)
    .eq('exam_id', id)
    .or('status.eq.published,status.is.null')
    .order('title', { ascending: true });

  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }
  };

  // @ts-expect-error Types Supabase
  const subjectName = exam.subjects?.name || slug;
  
  const formattedDuration = exam.duration_minutes 
    ? `${Math.floor(exam.duration_minutes / 60)}h${(exam.duration_minutes % 60).toString().padStart(2, '0')}`
    : 'Non spécifiée';

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 mb-2">
        <Link href={`/matieres/${slug}`} className="hover:text-navy-900 transition-colors flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour à {subjectName}
        </Link>
      </div>

      <div className="flex flex-col gap-4 bg-navy-900 text-white p-8 rounded-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <div className="flex gap-2 mb-3">
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium uppercase tracking-wider">
              {exam.is_mock_exam ? 'Examen Blanc' : 'Sujet Réel'}
            </span>
            <span className="px-3 py-1 bg-gold-500/20 text-gold-600 rounded-full text-xs font-medium">{subjectName}</span>
          </div>
          <h1 className="font-display text-4xl mb-4">{exam.title}</h1>
          <div className="flex flex-wrap gap-6 text-sm text-gray-300">
            {exam.duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gold-600" />
                Durée conseillée : {formattedDuration}
              </div>
            )}
            {exam.description && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold-600" />
                {exam.description}
              </div>
            )}
          </div>
        </div>
      </div>

      <Card className="rounded-card border border-gray-100 bg-white shadow-sm">
        <CardContent className="p-8 md:p-12">
          <div className="flex items-center gap-2 text-navy-900 font-display text-2xl mb-6 border-b pb-4">
            <FileText className="w-6 h-6 text-gold-600" />
            <h2>Sujet de l'examen</h2>
          </div>
          
          <div className="space-y-12 mb-12">
            {exercises && exercises.length > 0 ? (
              exercises.map((exercise) => (
                <div key={exercise.id} className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-lg">
                  <h3 className="font-display text-navy-900 flex items-center justify-between">
                    {exercise.title}
                    {exercise.points && (
                      <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                        {exercise.points} points
                      </span>
                    )}
                  </h3>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <MDXRemote source={exercise.statement_body || '*Aucun énoncé*'} components={mdxComponents} options={mdxOptions as any} />
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Aucun exercice n'a encore été associé à cet examen.</p>
            )}
          </div>

          {(exercises && exercises.some(ex => ex.solution_body)) && (
            <details className="group mt-12">
              <summary className="flex items-center gap-3 cursor-pointer list-none justify-center py-4 border-2 border-navy-900 text-navy-900 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                <CheckCircle className="w-5 h-5" />
                <span>Consulter le corrigé officiel</span>
              </summary>
              
              <div className="mt-8 p-8 rounded-xl bg-gray-50 border border-gray-200">
                <h3 className="text-2xl font-display text-navy-900 mb-8 pb-4 border-b border-gray-200">Corrigé de l'examen</h3>
                
                <div className="space-y-12">
                  {exercises.map((exercise) => (
                    exercise.solution_body ? (
                      <div key={exercise.id} className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-lg">
                        <h4 className="text-xl text-emerald-800 font-medium border-l-4 border-emerald-500 pl-4">
                          Correction : {exercise.title}
                        </h4>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <MDXRemote source={exercise.solution_body} components={mdxComponents} options={mdxOptions as any} />
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
