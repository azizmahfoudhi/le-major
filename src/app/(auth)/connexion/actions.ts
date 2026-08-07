'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export async function login(prevState: { error: string } | undefined, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email ou mot de passe incorrect.' };
    }
    return { error: 'Une erreur est survenue lors de la connexion.' };
  }

  // Fetch the user's profile to check their role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (profile?.role === 'admin') {
    redirect(ROUTES.admin);
  } else {
    redirect(ROUTES.accueil);
  }
}
