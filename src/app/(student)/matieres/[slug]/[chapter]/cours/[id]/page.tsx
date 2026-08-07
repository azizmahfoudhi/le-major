import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { renderMarkdownBody } from '@/lib/markdown/parse';
import { extractTableOfContents, injectHeadingIds } from '@/lib/utils/markdown';
import { CompleteButton } from '../../../../../components/complete-button';

export const metadata: Metadata = {
  title: 'Cours | Le Major',
  description: 'Lecture du cours',
};

export default async function LessonReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string; id: string }>;
}) {
  const { slug, chapter, id } = await params;
  
  const supabase = await createClient();
  
  // Fetch the current content
  const { data: content, error: contentError } = await supabase
    .from('contents')
    .select(`
      id,
      title,
      body,
      order_index,
      type,
      chapter_id,
      chapters!inner (
        id,
        title,
        slug,
        subject_id,
        subjects!inner (
          id,
          name,
          slug
        )
      )
    `)
    .eq('id', id)
    .single();
    
  if (contentError || !content) {
    return notFound();
  }

  // Type assertion for nested relations due to Supabase query structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chapterData = content.chapters as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subjectData = chapterData?.subjects as any;
  
  // Enforce valid URL paths
  if (chapterData?.slug !== chapter || subjectData?.slug !== slug) {
    return notFound();
  }

  const rawBody = content.body || '';
  const bodyWithIds = injectHeadingIds(rawBody);
  const renderedContent = await renderMarkdownBody(bodyWithIds);
  const toc = extractTableOfContents(rawBody);

  // Fetch sibling contents for next/prev navigation
  const { data: siblingContents } = await supabase
    .from('contents')
    .select('id, title, order_index, type')
    .eq('chapter_id', content.chapter_id)
    .eq('status', 'published')
    .order('order_index', { ascending: true });

  const siblings = siblingContents || [];
  const currentIndex = siblings.findIndex(s => s.id === id);
  const prevContent = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextContent = currentIndex !== -1 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 pb-12">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6 max-w-4xl">
        {/* Navigation / Breadcrumbs */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 mb-4">
          <Link href={`/matieres/${slug}/${chapter}`} className="hover:text-navy-700 transition-colors flex items-center font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour à {chapterData.title}
          </Link>
        </div>

        {/* Reader Container */}
        <Card className="overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <article className="prose-reader">
              <h1 className="text-3xl font-display text-navy-900 mb-8">{content.title}</h1>
              
              {rawBody ? (
                renderedContent
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <AlertTriangle className="w-12 h-12 mb-4 text-gray-300" />
                  <p>Ce contenu est vide pour le moment.</p>
                </div>
              )}
            </article>
          </CardContent>
        </Card>

        {/* Next/Prev Navigation */}
        <div className="flex items-center justify-between pt-4">
          {prevContent ? (
            <Link href={`/matieres/${slug}/${chapter}/cours/${prevContent.id}`}>
              <Button variant="outline" className="text-gray-600">
                <ChevronLeft className="w-4 h-4 mr-2" />
                {prevContent.title}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          
          <CompleteButton 
            chapterId={content.chapter_id} 
            nextContentId={nextContent?.id} 
            slug={slug} 
            chapterSlug={chapter}
            title={nextContent?.title}
          />
        </div>
      </div>

      {/* Sidebar: Table of Contents */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="sticky top-24">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-medium text-navy-900 flex items-center gap-2 mb-4">
                <List className="w-4 h-4 text-gold-500" />
                Sommaire
              </h3>
              {toc.length > 0 ? (
                <ul className="space-y-3">
                  {toc.map((item, index) => (
                    <li key={item.id} style={{ marginLeft: item.level === 3 ? '1rem' : '0' }}>
                      <a 
                        href={`#${item.id}`} 
                        className={`text-sm hover:text-gold-600 transition-colors ${
                          index === 0 && item.level === 2 ? 'text-gold-600 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">Aucun titre détecté.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
