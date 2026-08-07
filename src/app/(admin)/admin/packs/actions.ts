'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPack(data: { name: string; description: string; price_tnd: number; is_active: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.from('packages').insert({
    name: data.name,
    description: data.description,
    price_tnd: data.price_tnd,
    is_active: data.is_active,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/admin/packs');
}

export async function updatePack(id: string, data: { name: string; description: string; price_tnd: number; is_active: boolean }) {
  const supabase = await createClient();
  const { error } = await supabase.from('packages').update({
    name: data.name,
    description: data.description,
    price_tnd: data.price_tnd,
    is_active: data.is_active,
  }).eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/packs');
}

export async function deletePack(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('packages').delete().eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/packs');
}
