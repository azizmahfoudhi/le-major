import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, FileText, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chapitre | Le Major',
  description: 'Détails du chapitre',
};

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  
  // TODO: Fetch real data
  const subjectName = slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ');
  const chapterName = chapter.charAt(0).toUpperCase() + chapter.slice(1).replace('-', ' ');

  const lessons = [
    { id: '1', title: 'Introduction aux concepts', read: true, slug: 'intro' },
    { id: '2', title: 'Définitions principales', read: false, slug: 'definitions' },
    { id: '3', title: 'Méthodes de calcul', read: false, slug: 'methodes' },
  ];

  const relatedExercises = [
    { id: 'ex1', title: 'Application directe du cours', difficulty: 'Facile' },
  ];

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-8 space-y-8 pb-12">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
        <Link href="/matieres" className="hover:text-navy-700 transition-colors">Matières</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/matieres/${slug}`} className="hover:text-navy-700 transition-colors">{subjectName}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-900 font-medium">{chapterName}</span>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl text-navy-900">{chapterName}</h1>
        <p className="text-gray-600 max-w-3xl leading-relaxed">
          Ce chapitre aborde les notions essentielles pour comprendre la mécanique sous-jacente du sujet.
          Vous y apprendrez à identifier les variables clés et à résoudre des problèmes simples.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content: Lessons */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-navy-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gold-500" />
            Contenu du chapitre
          </h2>
          <div className="space-y-3">
            {lessons.map((lesson, index) => (
              <Link key={lesson.id} href={`/matieres/${slug}/${chapter}/cours/${lesson.slug}`}>
                <Card className={`transition-all cursor-pointer group ${
                  lesson.read ? 'border-gray-100 bg-white' : 'border-gold-200 bg-gold-50'
                }`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      lesson.read ? 'bg-gray-100 text-gray-500' : 'bg-gold-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-medium group-hover:text-gold-600 transition-colors ${
                        lesson.read ? 'text-gray-700' : 'text-navy-900'
                      }`}>
                        {lesson.title}
                      </h3>
                    </div>
                    {lesson.read ? (
                      <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">Lu</span>
                    ) : (
                      <PlayCircle className="w-5 h-5 text-gold-500" />
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar: Related Exercises */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-navy-900">Exercices liés</h2>
          <div className="space-y-3">
            {relatedExercises.map((exercise) => (
              <Link key={exercise.id} href={`/matieres/${slug}/exercices/${exercise.id}`}>
                <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2 text-emerald-600 border-emerald-200 bg-emerald-50">
                      {exercise.difficulty}
                    </Badge>
                    <h3 className="font-medium text-navy-900 text-sm">{exercise.title}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
