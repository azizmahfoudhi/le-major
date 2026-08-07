'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createExam(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const subject_id = formData.get('subject_id') as string;
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10);
  const status = formData.get('status') as string;
  const is_mock_exam = formData.get('is_mock_exam') === 'on';

  if (!title || !subject_id || isNaN(duration_minutes)) {
    return { success: false, error: 'Champs invalides' };
  }

  const { error } = await supabase.from('exams').insert({
    title,
    subject_id,
    duration_minutes,
    status,
    is_mock_exam,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/examens');
  return { success: true };
}

export async function updateExam(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const subject_id = formData.get('subject_id') as string;
  const duration_minutes = parseInt(formData.get('duration_minutes') as string, 10);
  const status = formData.get('status') as string;
  const is_mock_exam = formData.get('is_mock_exam') === 'on';

  if (!title || !subject_id || isNaN(duration_minutes)) {
    return { success: false, error: 'Champs invalides' };
  }

  const { error } = await supabase.from('exams').update({
    title,
    subject_id,
    duration_minutes,
    status,
    is_mock_exam,
  }).eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/examens');
  return { success: true };
}

export async function deleteExam(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('exams').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/examens');
}
