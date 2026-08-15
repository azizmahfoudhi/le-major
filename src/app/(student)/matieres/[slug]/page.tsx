import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PenTool, FileText, CheckCircle, Circle, ChevronRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

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
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  // Fetch the subject details
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('id, name, slug, description')
    .eq('slug', slug)
    .single();

  if (subjectError || !subject) {
    return notFound();
  }

  // Fetch all chapters for this subject
  const { data: chaptersData } = await supabase
    .from('chapters')
    .select(`
      id, 
      title, 
      slug, 
      is_free,
      order_index,
      contents (id)
    `)
    .eq('subject_id', subject.id)
    .order('order_index', { ascending: true });

  // Fetch student progress for these chapters
  const { data: progressData } = await supabase
    .from('chapter_progress')
    .select('chapter_id, is_completed')
    .eq('student_id', user.id);

  const progressSet = new Set(progressData?.filter(p => p.is_completed).map(p => p.chapter_id));

  // Determine if the user has full access to this subject (through an active package)
  // For the sake of UI, if they don't, we show lock icons on non-free chapters.
  const { data: accessData } = await supabase
    .rpc('has_subject_access', { p_user_id: user.id, p_subject_id: subject.id });

  const hasFullAccess = accessData === true;

  const chapters = (chaptersData || []).map(chap => {
    const isCompleted = progressSet.has(chap.id);
    const isLocked = !hasFullAccess && !chap.is_free;
    const lessonCount = chap.contents ? chap.contents.length : 0;
    
    return {
      id: chap.id,
      title: chap.title,
      lessonCount,
      slug: chap.slug,
      status: isCompleted ? 'completed' : 'not-started',
      isLocked
    };
  });

  // Fetch real exercises for this subject, sorted by exam then order
  const { data: exercisesData, error: exercisesError } = await supabase
    .from('exercises')
    .select('id, title, difficulty, subject_id, exam_id, theme')
    .eq('subject_id', subject.id)
    .order('exam_id', { ascending: true, nullsFirst: false })
    .order('title');

  if (exercisesError) {
    console.error('Error fetching exercises on student page:', exercisesError.message);
  }

  // Manually fetch exam titles to avoid FK join cache issues in production
  const examIds = [...new Set((exercisesData || []).map(e => e.exam_id).filter(Boolean))];
  let examTitleMap: Record<string, string> = {};
  if (examIds.length > 0) {
    const { data: examTitles } = await supabase
      .from('exams')
      .select('id, title')
      .in('id', examIds);
    examTitleMap = Object.fromEntries((examTitles || []).map(e => [e.id, e.title]));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const exercises = (exercisesData || []).map((ex: any) => ({
    ...ex,
    examTitle: ex.exam_id ? (examTitleMap[ex.exam_id] || null) : null,
  }));

  // Group exercises: first all standalone (no exam), then by exam
  const standaloneExercises = exercises.filter(ex => !ex.exam_id);
  const exercisesByExam: Record<string, typeof exercises> = {};
  exercises.filter(ex => ex.exam_id).forEach(ex => {
    const key = ex.exam_id;
    if (!exercisesByExam[key]) exercisesByExam[key] = [];
    exercisesByExam[key].push(ex);
  });

  // Fetch real exams for this subject
  const { data: examsData } = await supabase
    .from('exams')
    .select('id, title, duration_minutes, is_mock_exam')
    .eq('subject_id', subject.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const exams = examsData || [];

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-8 space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Link href="/matieres" className="hover:text-navy-700 transition-colors">Matières</Link>
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="text-navy-900 font-medium">{subject.name}</span>
        </div>
        <h1 className="font-display text-4xl text-navy-900">{subject.name}</h1>
        <p className="text-gray-600">{subject.description || 'Maîtrisez tous les concepts avec nos cours, exercices et annales.'}</p>
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
            {chapters.length === 0 ? (
              <p className="text-gray-500 italic">Aucun chapitre disponible pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {chapters.map(chapter => (
                  <Link key={chapter.id} href={chapter.isLocked ? '#' : `/matieres/${slug}/${chapter.slug}`}>
                    <Card className={`transition-colors cursor-pointer group ${chapter.isLocked ? 'opacity-70 bg-gray-50 cursor-not-allowed' : 'hover:border-gold-300'}`}>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {chapter.isLocked ? (
                            <Lock className="w-6 h-6 text-gray-300" />
                          ) : chapter.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-emerald-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-300 group-hover:text-gold-400 transition-colors" />
                          )}
                          <div>
                            <h3 className={`text-lg font-medium transition-colors ${chapter.isLocked ? 'text-gray-500' : 'text-navy-900 group-hover:text-gold-600'}`}>
                              {chapter.title}
                            </h3>
                            <p className="text-sm text-gray-500">{chapter.lessonCount} leçons</p>
                          </div>
                        </div>
                        {!chapter.isLocked && (
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gold-600 transition-colors" />
                        )}
                        {chapter.isLocked && (
                          <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-600">Verrouillé</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pratiquer" className="m-0 space-y-8">
            <h2 className="text-xl font-semibold text-navy-900">Exercices</h2>
            {exercises.length === 0 ? (
              <p className="text-gray-500 italic">Aucun exercice disponible pour le moment.</p>
            ) : (
              <div className="space-y-8">

                {/* Standalone exercises (not linked to an exam) */}
                {standaloneExercises.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Exercices indépendants</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {standaloneExercises.map((exercise, idx) => (
                        <Link key={exercise.id} href={`/matieres/${slug}/exercices/${exercise.id}`}>
                          <Card className="hover:border-gold-300 transition-colors cursor-pointer group h-full">
                            <CardContent className="p-5 flex items-center justify-between gap-3">
                              <div className="flex items-start gap-3 min-w-0">
                                <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-semibold text-navy-900 group-hover:text-gold-700 transition-colors line-clamp-2">
                                    {exercise.title}
                                  </h4>
                                  {exercise.theme && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{exercise.theme}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className={`text-xs ${exercise.difficulty === 'easy' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : exercise.difficulty === 'intermediate' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-rose-200 text-rose-700 bg-rose-50'}`}>
                                  {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'intermediate' ? 'Moyen' : 'Difficile'}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gold-500 transition-colors" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercises grouped by exam */}
                {Object.entries(exercisesByExam).map(([examId, examExercises]) => {
                  const examTitle = examExercises[0]?.examTitle || 'Examen';
                  return (
                    <div key={examId}>
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-navy-500 shrink-0" />
                        <h3 className="text-sm font-semibold text-navy-700 uppercase tracking-wider">{examTitle}</h3>
                        <span className="text-xs text-gray-400">— {examExercises.length} exercice{examExercises.length > 1 ? 's' : ''}</span>
                      </div>
                      <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
                        {examExercises.map((exercise, idx) => (
                          <Link key={exercise.id} href={`/matieres/${slug}/exercices/${exercise.id}`}>
                            <div className="flex items-center justify-between gap-3 px-5 py-4 bg-white hover:bg-gold-50 transition-colors group cursor-pointer">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center group-hover:bg-gold-100 group-hover:text-gold-700 transition-colors">
                                  {idx + 1}
                                </span>
                                <div className="min-w-0">
                                  <h4 className="text-sm font-semibold text-navy-900 group-hover:text-gold-700 transition-colors truncate">
                                    {exercise.title}
                                  </h4>
                                  {exercise.theme && (
                                    <p className="text-xs text-gray-400 mt-0.5 truncate">{exercise.theme}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Badge variant="outline" className={`text-xs ${exercise.difficulty === 'easy' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : exercise.difficulty === 'intermediate' ? 'border-amber-200 text-amber-700 bg-amber-50' : 'border-rose-200 text-rose-700 bg-rose-50'}`}>
                                  {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'intermediate' ? 'Moyen' : 'Difficile'}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gold-500 transition-colors" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="examens" className="m-0 space-y-4">
            <h2 className="text-xl font-semibold text-navy-900 mb-4">Annales et Examens Blancs</h2>
            {exams.length === 0 ? (
              <p className="text-gray-500 italic">Aucun examen disponible pour le moment.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {exams.map(exam => (
                  <Link key={exam.id} href={`/mode-examen/session/${exam.id}`}>
                    <Card className="hover:border-gold-300 transition-colors cursor-pointer group">
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className={`mb-2 ${exam.is_mock_exam ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50'}`}>
                            {exam.is_mock_exam ? 'Examen Blanc' : 'Sujet Réel'}
                          </Badge>
                          <h3 className="text-lg font-medium text-navy-900 group-hover:text-gold-600 transition-colors">
                            {exam.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{exam.duration_minutes} minutes</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gold-600 transition-colors" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
