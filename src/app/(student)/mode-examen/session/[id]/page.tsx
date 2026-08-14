import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ExamClient from './exam-client';

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
    .select('id, status, exam_id, exams(title, duration_minutes)')
    .eq('id', attemptId)
    .eq('student_id', user.id)
    .single();

  if (attemptError || !attempt) {
    redirect('/mode-examen');
  }

  // @ts-expect-error Types Supabase
  const title = attempt.exams ? (attempt.exams as {title: string}).title : 'Examen Le Major (Personnalisé)';
  // @ts-expect-error Types Supabase
  const durationMinutes = attempt.exams ? (attempt.exams as {duration_minutes: number}).duration_minutes : 120; // fallback if custom

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

  // 3. Format questions for the client
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = finalExercises.map((ex: any, index: number) => ({
    id: ex.id,
    number: index + 1,
    theme: ex.theme || ex.title || 'Exercice',
    points: ex.points || 5,
    statement: ex.statement_body || ex.statement || ''
  }));


  return (
    <ExamClient 
      attemptId={attempt.id}
      title={title}
      durationMinutes={durationMinutes}
      questions={questions}
    />
  );
}
