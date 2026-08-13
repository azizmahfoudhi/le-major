'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

function generateRandomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'LM-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateCodes(packageId: string, quantity: number) {
  const supabase = await createClient();

  // Validate admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { success: false, error: 'Unauthorized' };

  const codesToInsert = [];
  for (let i = 0; i < quantity; i++) {
    codesToInsert.push({
      code: generateRandomCode(),
      package_id: packageId,
      created_by: user.id,
    });
  }

  const { error } = await supabase.from('activation_codes').insert(codesToInsert);

  if (error) {
    console.error('Error generating codes:', error);
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/codes');
  return { success: true };
}

export async function deleteCode(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('activation_codes').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin/codes');
}
