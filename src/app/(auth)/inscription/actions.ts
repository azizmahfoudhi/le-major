'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export async function register(prevState: { error: string } | undefined, formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!fullName || !email || !password || !confirmPassword) {
    return { error: 'Veuillez remplir tous les champs.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Les mots de passe ne correspondent pas.' };
  }

  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  const supabase = await createClient();

  // Split fullName into first_name and last_name for the database trigger
  const nameParts = fullName.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      },
    },
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      return { error: 'Un compte avec cet email existe déjà.' };
    }
    console.error('Signup error:', error);
    return { error: `Erreur: ${error.message}` };
  }

  // After signup, redirect to home/activation
  redirect(ROUTES.activation);
}
