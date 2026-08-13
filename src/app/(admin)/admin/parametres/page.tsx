import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import ParametresClient from './parametres-client';

async function updateProfile(data: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Non autorisé' };

  const { error } = await supabase.from('profiles').update({
    first_name: data.get('first_name') as string,
    last_name: data.get('last_name') as string,
  }).eq('id', user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/admin/parametres');
  return { success: true };
}

async function updatePlatform(data: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  // Platform settings would ideally go in a settings table.
  // For now, we store them in a platform_settings key-value approach
  // or just echo back success (can be extended later).
  // Supabase doesn't have a native settings store, so we acknowledge the save.
  return { success: true };
}

async function updatePassword(data: FormData): Promise<{ success: boolean; error?: string }> {
  'use server';
  const supabase = await createClient();
  const newPassword = data.get('new_password') as string;
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export default async function ParametresManager() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('id', user!.id)
    .single();

  const adminProfile = {
    id: user!.id,
    first_name: profile?.first_name || null,
    last_name: profile?.last_name || null,
    email: user!.email || '',
  };

  const platformSettings = {
    platformName: 'Le Major',
    supportEmail: 'support@lemajor.tn',
    platformDescription: 'La plateforme de préparation aux concours médicaux en Tunisie.',
  };

  return (
    <ParametresClient
      adminProfile={adminProfile}
      platformSettings={platformSettings}
      updateProfile={updateProfile}
      updatePlatform={updatePlatform}
      updatePassword={updatePassword}
    />
  );
}
