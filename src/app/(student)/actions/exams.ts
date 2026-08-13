'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function generateCustomExam(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non autorisé');
  }

  const subjectId = formData.get('subject') as string;
  const difficulty = formData.get('difficulty') as string;
  const duration = parseInt(formData.get('duration') as string, 10);
  const count = parseInt(formData.get('count') as string, 10);
  const theme = formData.get('theme') as string;

  if (!subjectId || !duration || !count) {
    throw new Error('Champs manquants');
  }

  // Build the query to fetch exercises
  let query = supabase
    .from('exercises')
    .select('id, duration_minutes, points, chapters!inner(subject_id)')
    .eq('chapters.subject_id', subjectId);

  if (difficulty !== 'all') {
    query = query.eq('difficulty', difficulty);
  }

  if (theme && theme.trim() !== '') {
    // Simple ilike search for themes. A robust implementation might use Full Text Search.
    query = query.ilike('theme', `%${theme.trim()}%`);
  }

  const { data: availableExercises, error: fetchError } = await query;

  if (fetchError || !availableExercises || availableExercises.length === 0) {
    return { success: false, error: "Aucun exercice trouvé avec ces critères." };
  }

  // Shuffle array (Fisher-Yates)
  for (let i = availableExercises.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableExercises[i], availableExercises[j]] = [availableExercises[j], availableExercises[i]];
  }

  // Select exercises up to the requested count and duration
  const selectedExercises = [];
  let totalDuration = 0;

  for (const ex of availableExercises) {
    if (selectedExercises.length >= count) break;
    
    const exDuration = ex.duration_minutes || 30; // Default to 30 if null
    
    // We allow a small overflow of duration (e.g., if we are at 100/120 and the next is 30, we accept it)
    if (totalDuration < duration) {
      selectedExercises.push(ex);
      totalDuration += exDuration;
    }
  }

  if (selectedExercises.length === 0) {
    return { success: false, error: "Impossible de générer un examen avec ces critères." };
  }

  // 1. Create the exam attempt (Custom, so exam_id is null)
  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .insert({
      student_id: user.id,
      exam_id: null,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (attemptError || !attempt) {
    return { success: false, error: "Erreur lors de la création de la session." };
  }

  // 2. Link the selected exercises
  const attemptExercises = selectedExercises.map((ex, index) => ({
    attempt_id: attempt.id,
    exercise_id: ex.id,
    order_index: index,
  }));

  const { error: linkError } = await supabase
    .from('exam_attempt_exercises')
    .insert(attemptExercises);

  if (linkError) {
    return { success: false, error: "Erreur lors de l'ajout des exercices." };
  }

  // Redirect to the new custom session
  redirect(`/mode-examen/session/${attempt.id}`);
}

export async function startOfficialExam(examId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non autorisé');

  // Check for existing in_progress attempt
  const { data: existingAttempt } = await supabase
    .from('exam_attempts')
    .select('id')
    .eq('exam_id', examId)
    .eq('student_id', user.id)
    .eq('status', 'in_progress')
    .single();

  if (existingAttempt) {
    redirect(`/mode-examen/session/${existingAttempt.id}`);
  }

  // Create new attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('exam_attempts')
    .insert({
      student_id: user.id,
      exam_id: examId,
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (attemptError || !attempt) throw new Error("Erreur création session");

  // Fetch all exercises for this official exam
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id')
    .eq('exam_id', examId);

  // Link them if they exist
  if (exercises && exercises.length > 0) {
    const attemptExercises = exercises.map((ex, index) => ({
      attempt_id: attempt.id,
      exercise_id: ex.id,
      order_index: index,
    }));
    await supabase.from('exam_attempt_exercises').insert(attemptExercises);
  }

  redirect(`/mode-examen/session/${attempt.id}`);
}

export async function completeExamAttempt(attemptId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non autorisé');

  await supabase
    .from('exam_attempts')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', attemptId)
    .eq('student_id', user.id);
}

export async function saveExamScore(attemptId: string, score: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Non autorisé');

  const { error } = await supabase
    .from('exam_attempts')
    .update({ score, status: 'evaluated' })
    .eq('id', attemptId)
    .eq('student_id', user.id);

  if (error) throw new Error("Erreur enregistrement de la note");
  
  redirect('/mode-examen');
}
