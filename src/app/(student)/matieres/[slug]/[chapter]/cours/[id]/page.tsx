import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cours | Le Major',
  description: 'Lecture du cours',
};

export default async function LessonReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string; id: string }>;
}) {
  const { slug, chapter } = await params;
  
  // TODO: Fetch real data
  const chapterName = chapter.charAt(0).toUpperCase() + chapter.slice(1).replace('-', ' ');
  
  const toc = [
    { id: 'intro', title: 'Les Fondements' },
    { id: 'concept1', title: '1. Concepts de base' },
    { id: 'dev', title: '2. Développements' },
  ];

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8 pb-12">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6 max-w-4xl">
        {/* Navigation / Breadcrumbs */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2 mb-4">
          <Link href={`/matieres/${slug}/${chapter}`} className="hover:text-navy-700 transition-colors flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour à {chapterName}
          </Link>
        </div>

        {/* Reader Container */}
        <Card className="overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <article className="prose-reader">
              {/* For a real app, this would use the Reader and renderMarkdown components */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-blue-900 font-medium">
                <span className="font-bold text-blue-800">Définition : Coût total</span>
                <p className="mt-1 text-sm">Le coût total est la somme du coût fixe et du coût variable : CT = CF + CV</p>
              </div>
              
              <h1 className="text-3xl font-display text-navy-900 mb-6">Les Fondements</h1>
              <p className="text-gray-700 leading-relaxed mb-4">
                Dans ce chapitre, nous allons découvrir les bases essentielles. La rigueur analytique 
                est indispensable pour structurer votre pensée.
              </p>
              
              <h2 className="text-2xl font-display text-navy-900 mt-8 mb-4">1. Concepts de base</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                La compréhension de ces concepts est primordiale pour la suite.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
                <li>Premier point important : l&apos;analyse marginale</li>
                <li>Deuxième point à retenir : l&apos;équilibre</li>
                <li>Troisième concept clé : l&apos;élasticité</li>
              </ul>
              
              <blockquote className="border-l-4 border-gold-400 bg-gray-50 p-4 rounded-r-lg italic text-gray-700 mb-6">
                &quot;La rigueur est la première qualité requise pour exceller.&quot;
              </blockquote>

              <h2 className="text-2xl font-display text-navy-900 mt-8 mb-4">2. Développements</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous pouvons aller plus loin en analysant les implications à long terme...
              </p>
            </article>
          </CardContent>
        </Card>

        {/* Next/Prev Navigation */}
        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" className="text-gray-600">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Leçon précédente
          </Button>
          <Button>
            Leçon suivante
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Sidebar: Table of Contents */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="sticky top-24">
          <Card>
            <CardContent className="p-5">
              <h3 className="font-medium text-navy-900 flex items-center gap-2 mb-4">
                <List className="w-4 h-4 text-gold-500" />
                Sommaire du cours
              </h3>
              <ul className="space-y-3">
                {toc.map((item, index) => (
                  <li key={item.id}>
                    <a 
                      href={`#${item.id}`} 
                      className={`text-sm hover:text-gold-600 transition-colors ${
                        index === 0 ? 'text-gold-600 font-medium' : 'text-gray-600'
                      }`}
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
