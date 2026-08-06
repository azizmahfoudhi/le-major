import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ChevronLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Série d\'exercices | Le Major',
  description: "Série d'exercices d'entraînement",
};

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug } = await params;
  const subjectName = slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' ');

  const series = {
    title: 'Série 1 : Les bases du raisonnement',
    description: 'Une série de 3 exercices progressifs pour valider vos acquis.',
    progress: 33, // 1 out of 3
  };

  const exercises = [
    {
      id: '1',
      title: 'Exercice 1 : QCM rapide',
      points: 5,
      statement: 'Quels sont les déterminants de l\'offre ?',
      correction: 'L\'offre dépend principalement des coûts de production, de la technologie et des anticipations.',
      completed: true,
    },
    {
      id: '2',
      title: 'Exercice 2 : Calcul de variations',
      points: 10,
      statement: 'Si le prix passe de 10 à 12 et la quantité de 100 à 80, calculez l\'élasticité.',
      correction: 'Élasticité = (ΔQ/Q) / (ΔP/P) = (-20/100) / (2/10) = -0.2 / 0.2 = -1',
      completed: false,
    },
    {
      id: '3',
      title: 'Exercice 3 : Mini-cas',
      points: 15,
      statement: 'Analysez l\'impact d\'une taxe sur le marché représenté ci-dessous.',
      correction: 'La taxe déplace la courbe d\'offre vers la gauche, augmentant le prix d\'équilibre et réduisant la quantité.',
      completed: false,
    }
  ];

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
        <Link href={`/matieres/${slug}`} className="hover:text-navy-900 transition-colors flex items-center">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Retour à {subjectName}
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="font-display text-3xl text-navy-900">{series.title}</h1>
        <p className="text-gray-600">{series.description}</p>
        
        <div className="bg-white p-4 rounded-card border border-gray-100 shadow-sm flex items-center gap-6 mt-2">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 font-medium">Progression globale</span>
              <span className="text-navy-900 font-bold">{series.progress}%</span>
            </div>
            <ProgressBar value={series.progress} className="h-3" indicatorClassName="bg-gold-500" />
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Exercices réussis</p>
            <p className="text-xl font-medium text-navy-900">1 / 3</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {exercises.map((exo, index) => (
          <Card key={exo.id} className={`rounded-card border transition-all ${
            exo.completed ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-200 bg-white shadow-sm'
          }`}>
            <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-medium text-navy-900 flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  {exo.title}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gold-600">{exo.points} pts</span>
                  {exo.completed && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">{exo.statement}</p>
              </div>

              <details className="group">
                <summary className="flex items-center gap-2 cursor-pointer list-none text-sm font-medium text-navy-900 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors w-fit">
                  <CheckCircle className="w-4 h-4" />
                  <span>Voir la correction</span>
                </summary>
                
                <div className="mt-4 p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900 prose prose-sm max-w-none">
                  <p>{exo.correction}</p>
                </div>
              </details>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
