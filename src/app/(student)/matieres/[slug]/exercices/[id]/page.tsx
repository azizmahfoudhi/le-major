import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { components } from '@/lib/markdown/components';
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
      statement_body,
      solution_body,
      subjects (
        name,
        slug
      )
    `)
    .eq('id', id)
    .single();

  if (!exercise) {
    notFound();
  }

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
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour à {exercise.subjects?.name}
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-gold-600 bg-gold-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Exercice
          </span>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'intermediate' ? 'Intermédiaire' : 'Difficile'}
          </span>
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
              <MDXRemote source={exercise.statement_body || '*Aucun énoncé*'} components={components} options={mdxOptions as any} />
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
                <MDXRemote source={exercise.solution_body} components={components} options={mdxOptions as any} />
              </div>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
