'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfileRole(profileId: string, role: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId);
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath('/admin/etudiants');
  return { success: true };
}
