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

  // 2. Fetch the exercises linked to this attempt
  const { data: attemptExercises, error: exercisesError } = await supabase
    .from('exam_attempt_exercises')
    .select(`
      order_index,
      exercises (
        id,
        theme,
        points,
        statement_body
      )
    `)
    .eq('attempt_id', attemptId)
    .order('order_index', { ascending: true });

  if (exercisesError || !attemptExercises || attemptExercises.length === 0) {
    // If no exercises linked, maybe fallback to exam questions if it's an old format (pre-migration)
    // but we assume migration is done and all data is proper.
    console.error("Aucun exercice trouvé pour cette session.");
  }

  // 3. Format questions for the client
  const questions = attemptExercises?.map((ae, index) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ex: any = ae.exercises;
    return {
      id: ex.id,
      number: index + 1,
      theme: ex.theme || 'Exercice',
      points: ex.points || 5,
      statement: ex.statement_body || ''
    };
  }) || [];

  return (
    <ExamClient 
      attemptId={attempt.id}
      title={title}
      durationMinutes={durationMinutes}
      questions={questions}
    />
  );
}
