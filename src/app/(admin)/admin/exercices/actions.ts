'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createExercise(data: { 
  title: string; 
  difficulty: string; 
  subject_id: string; 
  statement_body: string; 
  solution_body: string; 
  exam_id?: string | null;
  theme?: string | null;
  points?: number | null;
  duration_minutes?: number | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('exercises').insert({
    title: data.title,
    difficulty: data.difficulty,
    subject_id: data.subject_id,
    statement_body: data.statement_body,
    solution_body: data.solution_body,
    statement: data.statement_body,
    solution: data.solution_body,
    status: 'published',
    exam_id: data.exam_id || null,
    theme: data.theme || null,
    points: data.points || null,
    duration_minutes: data.duration_minutes || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath('/admin/exercices');
  return { success: true };
}

export async function updateExercise(id: string, data: { 
  title: string; 
  difficulty: string; 
  subject_id: string; 
  statement_body: string; 
  solution_body: string; 
  exam_id?: string | null;
  theme?: string | null;
  points?: number | null;
  duration_minutes?: number | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from('exercises').update({
    title: data.title,
    difficulty: data.difficulty,
    subject_id: data.subject_id,
    statement_body: data.statement_body,
    solution_body: data.solution_body,
    statement: data.statement_body,
    solution: data.solution_body,
    status: 'published',
    exam_id: data.exam_id || null,
    theme: data.theme || null,
    points: data.points || null,
    duration_minutes: data.duration_minutes || null,
  }).eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath('/admin/exercices');
  return { success: true };
}

export async function deleteExercise(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('exercises').delete().eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  revalidatePath('/admin/exercices');
  return { success: true };
}

