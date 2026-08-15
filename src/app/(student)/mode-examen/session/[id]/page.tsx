import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ExamClient from './exam-client';
import { renderMarkdownBody } from '@/lib/markdown/parse';

export const metadata: Metadata = {
  title: 'Examen en cours | Le Major',
  description: 'Ne fermez pas cette page pendant l\'examen.',
};

export default async function ExamSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: attemptId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/connexion');
  }

  // 1. Fetch the attempt details
  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .select('id, status, exam_id')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single();

  if (attemptError || !attempt) {
    console.error('Error fetching attempt:', attemptError);
    redirect('/mode-examen');
  }

  // 1.5 Fetch Exam Details if exam_id exists
  let title = 'Examen Le Major (Personnalisé)';
  let durationMinutes = 120;
  let matiere = null;
  let filiere = null;

  if (attempt.exam_id) {
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select(`
        title, duration_minutes, is_mock_exam, description, subject_id,
        subjects ( name )
      `)
      .eq('id', attempt.exam_id)
      .single();
      
    if (!examError && examData) {
      title = examData.title;
      durationMinutes = examData.duration_minutes;
      // @ts-expect-error Types Supabase
      matiere = examData.subjects?.name || null;
      
      // Manually fetch filiere to avoid deep join errors
      if (examData.subject_id) {
        const { data: subData } = await supabase
          .from('subjects')
          .select('semesters(editions(levels(formations(name))))')
          .eq('id', examData.subject_id)
          .single();
        
        // @ts-expect-error Deeply nested extraction
        filiere = subData?.semesters?.editions?.levels?.formations?.name || null;
      }
    }
  }

  // 2. Fetch the exercises linked to this attempt via the junction table
  const { data: attemptExercises } = await supabase
    .from('exam_attempt_exercises')
    .select(`
      order_index,
      exercises (
        id,
        title,
        theme,
        points,
        statement_body,
        statement
      )
    `)
    .eq('attempt_id', attemptId)
    .order('order_index', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let finalExercises: any[] = [];

  if (attemptExercises && attemptExercises.length > 0) {
    // Normal path: junction table has entries
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    finalExercises = attemptExercises.map((ae: any) => ae.exercises);
  } else if (attempt.exam_id) {
    // Fallback: read exercises directly from the exercises table by exam_id
    // (handles cases where exam_attempt_exercises was never populated)
    const { data: directExercises } = await supabase
      .from('exercises')
      .select('id, title, theme, points, statement_body, statement')
      .eq('exam_id', attempt.exam_id)
      .order('created_at', { ascending: true });
    finalExercises = directExercises || [];
  }

  // 3. Format questions for the client with rich MDX rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = await Promise.all(finalExercises.map(async (ex: any, index: number) => ({
    id: ex.id,
    number: index + 1,
    theme: ex.theme || ex.title || 'Exercice',
    points: ex.points || 5,
    statement: await renderMarkdownBody(ex.statement_body || ex.statement || '')
  })));


  return (
    <ExamClient 
      attemptId={attempt.id}
      title={title}
      durationMinutes={durationMinutes}
      questions={questions}
      matiere={matiere}
      filiere={filiere}
    />
  );
}
