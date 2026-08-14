import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/lib/markdown/components';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

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
      statement_body,
      solution_body,
      exams (
        title
      )
    `)
    .eq('id', id)
    .single();

  if (!exercise) {
    notFound();
  }

  // Look up subject separately to avoid PostgREST FK cache issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: subject } = (exercise as any).subject_id
    ? await supabase
        .from('subjects')
        .select('name, slug')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .eq('id', (exercise as any).subject_id)
        .single()
    : { data: null };


  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <Link 
        href={`/matieres/${slug}`}
        className="inline-flex items-center text-sm font-medium text-navy-600 hover:text-navy-900 mb-8 transition-colors"
      >
        Retour à {subject?.name || slug}
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Exercice
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'intermediate' ? 'Intermédiaire' : 'Difficile'}
          </span>
          {/* @ts-expect-error Types Supabase */}
          {exercise.exams?.title && (
            <span className="text-xs font-semibold text-navy-600 bg-navy-50 px-3 py-1 rounded-full uppercase tracking-wider border border-navy-100">
              {/* @ts-expect-error Types Supabase */}
              Source: {exercise.exams.title}
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
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <MDXRemote source={exercise.statement_body || '*Aucun énoncé*'} components={mdxComponents} options={mdxOptions as any} />
            </div>
          </CardContent>
        </Card>

        {exercise.solution_body && (
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
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <MDXRemote source={exercise.solution_body} components={mdxComponents} options={mdxOptions as any} />
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
