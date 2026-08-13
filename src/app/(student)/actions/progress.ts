'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Mark a chapter as completed for the current authenticated student
 */
export async function markChapterComplete(chapterId: string, redirectPath?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  // Upsert the progress
  const { error } = await supabase
    .from('chapter_progress')
    .upsert({
      student_id: user.id,
      chapter_id: chapterId,
      is_completed: true,
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'student_id, chapter_id'
    });

  if (error) {
    console.error('Error updating progress:', error);
    throw new Error('Erreur lors de la mise à jour de la progression');
  }

  // Revalidate the dashboard and course pages
  revalidatePath('/accueil');
  revalidatePath('/matieres', 'layout');
  
  if (redirectPath) {
    revalidatePath(redirectPath);
  }
}

/**
 * Mark a specific content (lesson/resource) as completed for the current authenticated student
 */
export async function markContentComplete(contentId: string, redirectPath?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Non authentifié');
  }

  // Upsert the content progress
  const { error } = await supabase
    .from('content_progress')
    .upsert({
      student_id: user.id,
      content_id: contentId,
      is_completed: true,
      last_accessed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'student_id, content_id'
    });

  if (error) {
    console.error('Error updating content progress:', error);
    throw new Error('Erreur lors de la mise à jour de la progression');
  }

  // Revalidate the dashboard and course pages
  revalidatePath('/accueil');
  revalidatePath('/matieres', 'layout');
  
  if (redirectPath) {
    revalidatePath(redirectPath);
  }
}

