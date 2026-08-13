import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Target, Activity, Award, Brain } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Progression | Le Major',
  description: 'Suivez vos performances et votre évolution',
};

export default async function ProgressPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  // 1. Calculate Average Score
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('score')
    .eq('student_id', user.id)
    .in('status', ['completed', 'evaluated'])
    .not('score', 'is', null);

  let averageScore = 0;
  if (attempts && attempts.length > 0) {
    const total = attempts.reduce((acc, curr) => acc + (curr.score || 0), 0);
    averageScore = Math.round((total / attempts.length) * 10) / 10;
  }

  // 2. Fetch Subjects and Progress
  const { data: activations } = await supabase
    .from('student_activations')
    .select(`
      packages (
        package_subjects (
          subjects (
            id, name, slug
          )
        )
      )
    `)
    .eq('student_id', user.id)
    .eq('is_active', true);

  const subjectsMap = new Map();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activations?.forEach((act: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    act.packages?.package_subjects?.forEach((ps: any) => {
      if (ps.subjects) {
        subjectsMap.set(ps.subjects.id, ps.subjects);
      }
    });
  });
  const mySubjects = Array.from(subjectsMap.values());

  const subjectIds = mySubjects.map(s => s.id);
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, subject_id')
    .in('subject_id', subjectIds);

  const { data: progress } = await supabase
    .from('chapter_progress')
    .select('chapter_id, chapters!inner(subject_id)')
    .eq('student_id', user.id)
    .eq('is_completed', true);

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];

  const subjectsProgress = mySubjects.map((sub, idx) => {
    const subjectChapters = chapters?.filter(c => c.subject_id === sub.id) || [];
    const totalChapters = subjectChapters.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedChapters = progress?.filter(p => (p.chapters as any)?.subject_id === sub.id).length || 0;
    const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    return {
      ...sub,
      progress: progressPercent,
      totalChapters,
      completedChapters,
      color: colors[idx % colors.length]
    };
  });

  const masteredSubjects = subjectsProgress.filter(s => s.progress === 100).length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl text-navy-900">Progression</h1>
        <p className="text-gray-600">Analysez vos performances et ciblez vos révisions.</p>
      </div>

      {/* Global Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Moyenne Générale</p>
                <p className="text-3xl font-display text-navy-900">{averageScore || '-'}<span className="text-xl text-gray-400">/20</span></p>
              </div>
              <div className="p-3 bg-gold-500/10 text-gold-600 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Assiduité</p>
                <p className="text-3xl font-display text-navy-900">{attempts?.length ? 'Élevée' : 'Moyenne'}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Examens passés</p>
                <p className="text-3xl font-display text-navy-900">{attempts?.length || 0}</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sujets Maîtrisés</p>
                <p className="text-3xl font-display text-navy-900">{masteredSubjects}</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                <Brain className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress per subject */}
      <section>
        <h2 className="text-xl font-semibold text-navy-900 mb-4">Progression par matière</h2>
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-0">
            {subjectsProgress.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Vous n'avez pas encore débloqué de matières.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {subjectsProgress.map((sub) => (
                  <div key={sub.id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-navy-900">{sub.name}</h3>
                        <p className="text-sm text-gray-500">{sub.completedChapters}/{sub.totalChapters} chapitres complétés</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-navy-900">{sub.progress}%</p>
                      </div>
                    </div>
                    <ProgressBar value={sub.progress} className="h-2 bg-gray-100" indicatorClassName={sub.color} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Strengths & Weaknesses (Simplified dynamic version) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-emerald-700">Points forts</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectsProgress.filter(s => s.progress >= 50).length > 0 ? (
              <ul className="space-y-3">
                {subjectsProgress.filter(s => s.progress >= 50).map(s => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="text-emerald-600 font-medium">Bon niveau</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Continuez à étudier pour identifier vos points forts.</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-rose-700">À consolider</CardTitle>
          </CardHeader>
          <CardContent>
            {subjectsProgress.filter(s => s.progress < 50 && s.totalChapters > 0).length > 0 ? (
              <ul className="space-y-3">
                {subjectsProgress.filter(s => s.progress < 50 && s.totalChapters > 0).map(s => (
                  <li key={s.id} className="flex items-center justify-between">
                    <span className="text-gray-700">{s.name}</span>
                    <span className="text-rose-600 font-medium">En cours</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">Vous êtes à jour dans vos matières !</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
