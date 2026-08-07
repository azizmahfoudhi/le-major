'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function completeExamAttempt(attemptId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('exam_attempts')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', attemptId);

  if (error) {
    console.error('Failed to complete exam:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/mode-examen');
  return { success: true };
}
