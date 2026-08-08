import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ModeExamenClient from './mode-examen-client';

export const metadata: Metadata = {
  title: 'Mode Examen | Le Major',
  description: 'Entraînez-vous dans les conditions réelles',
};

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  // 1. Fetch subjects the student has access to
  const { data: activations } = await supabase
    .from('student_activations')
    .select(`
      packages (
        package_subjects (
          subject_id,
          subjects (
            id,
            name
          )
        )
      )
    `)
    .eq('student_id', user.id)
    .eq('is_active', true);

  const subjectMap = new Map<string, { id: string, name: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activations?.forEach((act: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    act.packages?.package_subjects?.forEach((ps: any) => {
      if (ps.subjects) {
        subjectMap.set(ps.subjects.id, { id: ps.subjects.id, name: ps.subjects.name });
      }
    });
  });

  const subjects = Array.from(subjectMap.values());
  const subjectIds = Array.from(subjectMap.keys());

  // 2. Fetch exams for these subjects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let exams: any[] = [];
  if (subjectIds.length > 0) {
    const { data } = await supabase
      .from('exams')
      .select(`
        id, 
        title, 
        description, 
        duration_minutes, 
        is_mock_exam,
        subjects!inner (
          name,
          slug
        )
      `)
      .in('subject_id', subjectIds)
      .eq('status', 'published');
    exams = data || [];
  }

  // 3. Fetch user's previous exam attempts
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('exam_id, status, score')
    .eq('student_id', user.id)
    .not('exam_id', 'is', null);

  // Map attempts to exams
  const examsWithAttempts = exams.map(exam => {
    const examAttempts = attempts?.filter(a => a.exam_id === exam.id) || [];
    const bestAttempt = examAttempts.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    return {
      ...exam,
      attemptsCount: examAttempts.length,
      bestScore: bestAttempt?.score || null,
      isCompleted: examAttempts.some(a => a.status === 'completed' || a.status === 'evaluated')
    };
  });

  return <ModeExamenClient exams={examsWithAttempts} subjects={subjects} />;
}
