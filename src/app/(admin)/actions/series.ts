'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createSeries(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const subject_id = formData.get('subject_id') as string;
  const difficulty = formData.get('difficulty') as string;
  const is_premium = formData.get('is_premium') === 'on';

  if (!title || !subject_id) {
    return { success: false, error: 'Titre et matière sont requis' };
  }

  const { error } = await supabase.from('series').insert({
    title,
    subject_id,
    difficulty,
    is_premium,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/series');
  return { success: true };
}

export async function updateSeries(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const subject_id = formData.get('subject_id') as string;
  const difficulty = formData.get('difficulty') as string;
  const is_premium = formData.get('is_premium') === 'on';

  if (!title || !subject_id) {
    return { success: false, error: 'Titre et matière sont requis' };
  }

  const { error } = await supabase.from('series').update({
    title,
    subject_id,
    difficulty,
    is_premium,
  }).eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/series');
  return { success: true };
}

export async function deleteSeries(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('series').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/series');
}
