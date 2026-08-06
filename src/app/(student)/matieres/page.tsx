import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { Book } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Vos Matières | Le Major',
  description: 'Explorez toutes vos matières disponibles',
};

interface Subject {
  id: string;
  name: string;
  slug: string;
  totalChapters: number;
  progress: number;
  colorClass: string;
}

export default async function SubjectsPage() {
  // TODO: Fetch from Supabase
  // const supabase = await createClient();
  // const { data: subjects } = await supabase.from('subjects').select('*');

  const subjects: Subject[] = [
    { id: '1', name: 'Mathématiques Appliquées', slug: 'mathematiques', totalChapters: 12, progress: 30, colorClass: 'bg-blue-500' },
    { id: '2', name: 'Microéconomie', slug: 'microeconomie', totalChapters: 8, progress: 65, colorClass: 'bg-emerald-500' },
    { id: '3', name: 'Macroéconomie', slug: 'macroeconomie', totalChapters: 10, progress: 0, colorClass: 'bg-purple-500' },
    { id: '4', name: 'Droit Civil', slug: 'droit-civil', totalChapters: 15, progress: 10, colorClass: 'bg-amber-500' },
    { id: '5', name: 'Histoire de la Pensée Économique', slug: 'histoire-eco', totalChapters: 6, progress: 100, colorClass: 'bg-rose-500' },
  ];

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-8 space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl text-navy-900">Vos matières</h1>
        <p className="text-gray-600">Retrouvez tous vos cours, exercices et examens classés par matière.</p>
      </div>

      {subjects.length === 0 ? (
        <EmptyState 
          icon={<Book className="w-12 h-12 text-gray-300" />}
          title="Aucune matière disponible"
          description="Vous n'êtes inscrit à aucune matière pour le moment."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Link key={subject.id} href={`/matieres/${subject.slug}`}>
              <Card className="rounded-card border border-gray-100 bg-white shadow-sm hover:shadow-card transition-all cursor-pointer h-full group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-medium text-navy-900 group-hover:text-gold-600 transition-colors">{subject.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${subject.colorClass}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 mb-4">{subject.totalChapters} chapitres</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-medium">{subject.progress}%</span>
                    </div>
                    <ProgressBar 
                      value={subject.progress} 
                      className="h-2" 
                      indicatorClassName={subject.colorClass} 
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
