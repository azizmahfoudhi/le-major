import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ExamClient from './exam-client';

export const metadata: Metadata = {
  title: 'Examen en cours | Le Major',
  description: 'Ne fermez pas cette page pendant l\'examen.',
};

export default async function ExamSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: examId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/connexion');
  }

  // 1. Fetch the exam details
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select('id, title, duration_minutes, questions')
    .eq('id', examId)
    .single();

  if (examError || !exam) {
    redirect('/mode-examen');
  }

  // 2. Check for an existing in_progress attempt
  let { data: attempt } = await supabase
    .from('exam_attempts')
    .select('id, status')
    .eq('exam_id', examId)
    .eq('student_id', user.id)
    .eq('status', 'in_progress')
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  // 3. If no in_progress attempt, create a new one
  if (!attempt) {
    const { data: newAttempt, error: insertError } = await supabase
      .from('exam_attempts')
      .insert({
        exam_id: examId,
        student_id: user.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select('id, status')
      .single();

    if (insertError) {
      console.error('Error creating exam attempt:', insertError);
      redirect('/mode-examen');
    }
    attempt = newAttempt;
  }

  // Handle JSONB questions safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions = (exam.questions as any[]) || [];

  return (
    <ExamClient 
      examId={exam.id}
      attemptId={attempt.id}
      title={exam.title}
      durationMinutes={exam.duration_minutes}
      questions={questions}
    />
  );
}
