import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, PenTool, FileText, CheckCircle, Circle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Détail de la matière | Le Major',
  description: 'Contenu de la matière',
};

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // TODO: Fetch from Supabase using slug
  const subjectName = slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ');

  const chapters = [
    { id: '1', title: 'Les fondamentaux', lessonCount: 4, status: 'completed', slug: 'fondamentaux' },
    { id: '2', title: 'Théorie avancée', lessonCount: 6, status: 'in-progress', slug: 'theorie-avancee' },
    { id: '3', title: 'Applications pratiques', lessonCount: 3, status: 'not-started', slug: 'applications' },
  ];

  const exercises = [
    { id: 'ex1', title: 'Série 1 : QCM de révision', difficulty: 'Facile', points: 10, type: 'series', slug: 'serie-1' },
    { id: 'ex2', title: 'Cas pratique complet', difficulty: 'Difficile', points: 25, type: 'exercice', slug: 'cas-pratique' },
  ];

  const exams = [
    { id: 'exm1', title: 'Examen Blanc 2025', year: '2025', session: 'Janvier' },
    { id: 'exm2', title: 'Annales 2024', year: '2024', session: 'Mai' },
  ];

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-8 space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/matieres" className="hover:text-navy-700 transition-colors">Matières</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-navy-900 font-medium">{subjectName}</span>
        </div>
        <h1 className="font-display text-4xl text-navy-900">{subjectName}</h1>
        <p className="text-gray-600">Maîtrisez tous les concepts avec nos cours, exercices et annales.</p>
      </div>

      <Tabs defaultValue="apprendre" className="w-full">
        <TabsList className="w-full justify-start border-b border-gray-200 rounded-none bg-transparent h-auto p-0 gap-6">
          <TabsTrigger 
            value="apprendre" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-gold-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-medium"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Apprendre
          </TabsTrigger>
          <TabsTrigger 
            value="pratiquer"
            className="data-[state=active]:border-b-2 data-[state=active]:border-gold-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-medium"
          >
            <PenTool className="w-4 h-4 mr-2" />
            Pratiquer
          </TabsTrigger>
          <TabsTrigger 
            value="examens"
            className="data-[state=active]:border-b-2 data-[state=active]:border-gold-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-0 pb-3 font-medium"
          >
            <FileText className="w-4 h-4 mr-2" />
            Examens
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          <TabsContent value="apprendre" className="m-0 space-y-4">
            <h2 className="text-xl font-semibold text-navy-900 mb-4">Chapitres</h2>
            <div className="grid grid-cols-1 gap-4">
              {chapters.map(chapter => (
                <Link key={chapter.id} href={`/matieres/${slug}/${chapter.slug}`}>
                  <Card className="hover:border-gold-300 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {chapter.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-emerald-500" />
                        ) : chapter.status === 'in-progress' ? (
                          <div className="w-6 h-6 rounded-full border-2 border-gold-500 border-t-transparent animate-spin" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300" />
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-navy-900 group-hover:text-gold-600 transition-colors">{chapter.title}</h3>
                          <p className="text-sm text-gray-500">{chapter.lessonCount} leçons</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gold-600 transition-colors" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pratiquer" className="m-0 space-y-4">
            <h2 className="text-xl font-semibold text-navy-900 mb-4">Exercices et Séries</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercises.map(exercise => (
                <Link 
                  key={exercise.id} 
                  href={`/matieres/${slug}/${exercise.type === 'series' ? 'series' : 'exercices'}/${exercise.slug}`}
                >
                  <Card className="hover:shadow-card-hover transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className={
                          exercise.difficulty === 'Facile' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 
                          'text-rose-600 border-rose-200 bg-rose-50'
                        }>
                          {exercise.difficulty}
                        </Badge>
                        <span className="text-sm font-medium text-gold-600">{exercise.points} pts</span>
                      </div>
                      <h3 className="text-lg font-medium text-navy-900 mb-2">{exercise.title}</h3>
                      <p className="text-sm text-gray-500">
                        {exercise.type === 'series' ? 'Série d\'exercices' : 'Exercice unique'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="examens" className="m-0 space-y-4">
            <h2 className="text-xl font-semibold text-navy-900 mb-4">Annales et Examens Blancs</h2>
            <div className="grid grid-cols-1 gap-4">
              {exams.map(exam => (
                <Link key={exam.id} href={`/matieres/${slug}/examens/${exam.id}`}>
                  <Card className="hover:border-gold-300 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-navy-900 group-hover:text-gold-600 transition-colors">{exam.title}</h3>
                        <p className="text-sm text-gray-500">Session : {exam.session} {exam.year}</p>
                      </div>
                      <Button variant="outline" className="border-gray-200 group-hover:border-gold-500 group-hover:text-gold-600 transition-colors">
                        S&apos;entraîner
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
