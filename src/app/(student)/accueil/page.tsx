import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, CheckCircle, Clock, Trophy, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Tableau de bord | Le Major',
  description: 'Votre tableau de bord étudiant',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  // Auto-heal: if profile is missing the name, pull from auth metadata and persist it
  let firstName = profile?.first_name;
  let lastName = profile?.last_name;

  if (!firstName) {
    firstName = user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || null;
    lastName = lastName || user.user_metadata?.last_name || (user.user_metadata?.full_name?.split(' ').slice(1).join(' ')) || null;

    if (firstName) {
      await supabase.from('profiles').update({ first_name: firstName, last_name: lastName }).eq('id', user.id);
    }
  }

  const studentName = firstName
    ? `${firstName}`.trim()
    : user.email?.split('@')[0] || 'Étudiant';
  
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Fetch student's active packs and their subjects
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

  // Extract unique subjects from active packs
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
  const hasActivePack = mySubjects.length > 0;

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500', 'bg-rose-500'];

  // Fetch chapters for the student's subjects
  const subjectIds = mySubjects.map(s => s.id);
  
  const [chaptersResult, progressResult, exerciseStatsResult, examStatsResult] = await Promise.all([
    subjectIds.length > 0
      ? supabase.from('chapters').select('id, subject_id').in('subject_id', subjectIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from('chapter_progress')
      .select('chapter_id, chapters!inner(subject_id)')
      .eq('student_id', user.id)
      .eq('is_completed', true),
    supabase
      .from('exercise_progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('status', 'completed'),    // <-- Fixed: use 'status' not 'is_completed'
    supabase
      .from('exam_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('status', 'completed'),
  ]);

  const chapters = chaptersResult.data || [];
  const progress = progressResult.data || [];

  const subjectsProgress = mySubjects.map((sub, idx) => {
    const subjectChapters = chapters.filter(c => c.subject_id === sub.id);
    const totalChapters = subjectChapters.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const completedChapters = progress.filter(p => (p.chapters as any)?.subject_id === sub.id).length;
    const progressPercent = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    return {
      ...sub,
      progress: progressPercent,
      totalChapters,
      completedChapters,
      color: colors[idx % colors.length]
    };
  });

  const stats = {
    completedChapters: progress.length,
    completedExercises: exerciseStatsResult.count || 0,
    examAttempts: examStatsResult.count || 0,
  };

  // Fetch last accessed chapter
  const { data: lastProgress } = await supabase
    .from('chapter_progress')
    .select(`
      last_accessed_at,
      chapters!inner (
        id,
        title,
        slug,
        subjects!inner (
          name,
          slug
        )
      )
    `)
    .eq('student_id', user.id)
    .order('last_accessed_at', { ascending: false })
    .limit(1)
    .single();

  let lastAccessed = null;
  if (lastProgress) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chap = lastProgress.chapters as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subj = chap.subjects as any;
    
    const { data: content } = await supabase
      .from('contents')
      .select('id')
      .eq('chapter_id', chap.id)
      .order('order_index', { ascending: true })
      .limit(1)
      .single();

    if (content) {
      lastAccessed = {
        title: chap.title,
        subjectName: subj.name,
        link: `/matieres/${subj.slug}/${chap.slug}/cours/${content.id}`,
        lastReadAt: new Date(lastProgress.last_accessed_at).toLocaleDateString('fr-FR'),
      };
    }
  }

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-8 space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-4xl text-navy-900">Bonjour, {studentName} 👋</h1>
        <p className="text-gray-500 capitalize">{today}</p>
      </div>

      {/* No Pack Banner */}
      {!hasActivePack && (
        <div className="flex items-start gap-4 p-5 rounded-xl border border-amber-200 bg-amber-50">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
            <Lock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-900">Aucun pack actif</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Vous n'avez pas encore activé de pack d'accès. Utilisez votre code d'activation pour débloquer les matières.
            </p>
          </div>
          <Link href="/activation">
            <Button size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700">Activer un code</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-8">

          {/* Continue Learning */}
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-4">
              {lastAccessed ? 'Reprendre l\'apprentissage' : 'Commencer l\'apprentissage'}
            </h2>
            {lastAccessed ? (
              <Card className="overflow-hidden">
                <div className="p-0">
                  <div className="flex flex-col md:flex-row border-l-4 border-gold-500">
                    <div className="p-6 flex-1">
                      <Badge variant="outline" className="mb-2 text-gold-600 border-gold-300">{lastAccessed.subjectName}</Badge>
                      <h3 className="text-lg font-medium text-navy-900 mb-2">{lastAccessed.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        Dernier accès : {lastAccessed.lastReadAt}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-6 flex flex-col justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-gray-100 min-w-[200px]">
                      <Link href={lastAccessed.link}>
                        <Button className="w-full md:w-auto">
                          Continuer <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Vous n'avez pas encore commencé de chapitre.</p>
                {hasActivePack && (
                  <Link href="/matieres">
                    <Button className="mt-4">Explorer les matières</Button>
                  </Link>
                )}
              </Card>
            )}
          </section>

          {/* Subjects Grid */}
          {hasActivePack && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-navy-900">Vos matières</h2>
                <Link href="/matieres">
                  <Button variant="ghost" className="text-gold-600 hover:text-gold-700 hover:bg-gold-50">
                    Voir tout
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subjectsProgress.map(subject => (
                  <Link key={subject.id} href={`/matieres/${subject.slug}`}>
                    <Card className="hover:shadow-card-hover transition-shadow cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-medium text-navy-900 line-clamp-1">{subject.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>{subject.completedChapters} / {subject.totalChapters} chapitres</span>
                          <span className="font-medium">{subject.progress}%</span>
                        </div>
                        <ProgressBar value={subject.progress} className="h-2" indicatorClassName={subject.color} />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-4">Vos statistiques</h2>
            <div className="grid grid-cols-1 gap-3">
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-900">{stats.completedChapters}</p>
                    <p className="text-sm text-gray-500">Chapitres terminés</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-900">{stats.completedExercises}</p>
                    <p className="text-sm text-gray-500">Exercices réussis</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-navy-900">{stats.examAttempts}</p>
                    <p className="text-sm text-gray-500">Examens passés</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Quick Links */}
          <section>
            <h2 className="text-xl font-semibold text-navy-900 mb-4">Accès rapide</h2>
            <div className="space-y-2">
              <Link href="/progression" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-gold-300 hover:bg-gold-50 transition-colors group">
                <span className="text-sm font-medium text-navy-900 group-hover:text-gold-700">Ma progression</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gold-600" />
              </Link>
              <Link href="/mode-examen" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-gold-300 hover:bg-gold-50 transition-colors group">
                <span className="text-sm font-medium text-navy-900 group-hover:text-gold-700">Mode Examen</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gold-600" />
              </Link>
              <Link href="/profil" className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-gold-300 hover:bg-gold-50 transition-colors group">
                <span className="text-sm font-medium text-navy-900 group-hover:text-gold-700">Mon profil</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gold-600" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
