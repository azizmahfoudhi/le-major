import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import { Book } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Vos Matières | Le Major',
  description: 'Explorez toutes vos matières disponibles',
};

export default async function SubjectsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  // Fetch all subjects
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .order('name');

  // Fetch all chapters
  const { data: chaptersData } = await supabase
    .from('chapters')
    .select('id, subject_id');

  // Fetch student progress
  const { data: progressData } = await supabase
    .from('chapter_progress')
    .select('chapter_id, is_completed, chapters!inner(subject_id)')
    .eq('student_id', user.id)
    .eq('is_completed', true);

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];

  const subjects = (subjectsData || []).map((sub, idx) => {
    const subjectChapters = chaptersData?.filter(c => c.subject_id === sub.id) || [];
    const totalChapters = subjectChapters.length;
    
    // Using any for the inner join due to supabase typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedChapters = progressData?.filter(p => (p.chapters as any)?.subject_id === sub.id).length || 0;
    const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    return {
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      totalChapters,
      progress: progressPercent,
      colorClass: colors[idx % colors.length]
    };
  });

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
          description="Les matières seront ajoutées prochainement."
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
