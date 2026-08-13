import { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, FileText, PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Chapitre | Le Major',
  description: 'Détails du chapitre',
};

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter: chapterSlug } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  // 1. Fetch Subject
  const { data: subject, error: subjectError } = await supabase
    .from('subjects')
    .select('id, name, slug')
    .eq('slug', slug)
    .single();

  if (subjectError || !subject) {
    return notFound();
  }

  // 2. Fetch Chapter
  const { data: chapter, error: chapterError } = await supabase
    .from('chapters')
    .select('id, title, slug, is_free')
    .eq('subject_id', subject.id)
    .eq('slug', chapterSlug)
    .single();

  if (chapterError || !chapter) {
    return notFound();
  }

  // 3. Check access
  const { data: accessData } = await supabase
    .rpc('has_subject_access', { p_user_id: user.id, p_subject_id: subject.id });
  
  const hasFullAccess = accessData === true;
  if (!hasFullAccess && !chapter.is_free) {
    redirect(`/matieres/${subject.slug}`); // Redirect back if locked
  }

  // 4. Fetch Lessons (Contents)
  const { data: lessonsData } = await supabase
    .from('contents')
    .select('id, title, slug, order_index')
    .eq('chapter_id', chapter.id)
    .order('order_index', { ascending: true });

  // 5. We don't track individual lesson progress in this schema, only chapter progress.
  // We can fetch if the chapter is completed to mark lessons as read.
  const { data: chapterProgress } = await supabase
    .from('chapter_progress')
    .select('is_completed')
    .eq('student_id', user.id)
    .eq('chapter_id', chapter.id)
    .single();

  const isChapterCompleted = chapterProgress?.is_completed || false;

  const lessons = (lessonsData || []).map(lesson => ({
    id: lesson.id,
    title: lesson.title,
    slug: lesson.slug,
    read: isChapterCompleted
  }));

  // 6. Fetch related exercises
  const { data: exercisesData } = await supabase
    .from('exercises')
    .select('id, title, difficulty')
    .eq('chapter_id', chapter.id)
    .order('created_at', { ascending: true });

  const relatedExercises = exercisesData || [];

  return (
    <div className="max-w-content mx-auto px-4 md:px-8 py-8 space-y-8 pb-12">
      {/* Breadcrumbs */}
      <div className="flex flex-wrap items-center text-sm text-gray-500 gap-2">
        <Link href="/matieres" className="hover:text-navy-700 transition-colors">Matières</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/matieres/${subject.slug}`} className="hover:text-navy-700 transition-colors">{subject.name}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-navy-900 font-medium">{chapter.title}</span>
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl text-navy-900">{chapter.title}</h1>
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
            {lessons.length === 0 ? (
              <p className="text-gray-500 italic">Aucune leçon disponible dans ce chapitre.</p>
            ) : (
              lessons.map((lesson, index) => (
                <Link key={lesson.id} href={`/matieres/${subject.slug}/${chapter.slug}/cours/${lesson.id}`}>
                  <Card className={`transition-all cursor-pointer group ${
                    lesson.read ? 'border-gray-100 bg-white' : 'border-gold-200 bg-gold-50'
                  }`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
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
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded shrink-0">Lu</span>
                      ) : (
                        <PlayCircle className="w-5 h-5 text-gold-500 shrink-0" />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Related Exercises */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-navy-900">Exercices liés</h2>
          <div className="space-y-3">
            {relatedExercises.length === 0 ? (
              <p className="text-gray-500 italic">Aucun exercice pour l'instant.</p>
            ) : (
              relatedExercises.map((exercise) => (
                <Link key={exercise.id} href={`/matieres/${subject.slug}/exercices/${exercise.id}`}>
                  <Card className="hover:shadow-card-hover transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <Badge variant="outline" className="mb-2 text-emerald-600 border-emerald-200 bg-emerald-50">
                        {exercise.difficulty === 'easy' ? 'Facile' : exercise.difficulty === 'intermediate' ? 'Moyen' : 'Difficile'}
                      </Badge>
                      <h3 className="font-medium text-navy-900 text-sm">{exercise.title}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
