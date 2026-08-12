'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export async function activateCode(
  prevState: { error?: string; success?: boolean; message?: string }, 
  formData: FormData
) {
  const code = formData.get('code') as string;

  if (!code) {
    return { error: 'Veuillez entrer un code d\'activation.' };
  }

  const supabase = await createClient();
  const cleanCode = code.replace(/\s/g, '').toUpperCase();

  const { data, error } = await supabase.rpc('redeem_activation_code', {
    p_code: cleanCode,
  });

  if (error) {
    console.error('RPC Error:', error);
    return { error: 'Code invalide, déjà utilisé ou expiré.' };
  }

  return { success: true, message: 'Code activé avec succès ! Redirection en cours...' };
}
