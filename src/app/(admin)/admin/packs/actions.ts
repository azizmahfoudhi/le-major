'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPack(data: { 
  name: string; 
  description: string; 
  price_tnd: number; 
  is_active: boolean; 
  duration_days: number;
  subject_ids: string[];
}) {
  const supabase = await createClient();
  
  // 1. Create the package
  const { data: newPack, error } = await supabase.from('packages').insert({
    name: data.name,
    description: data.description,
    price_tnd: data.price_tnd,
    is_active: data.is_active,
    duration_days: data.duration_days,
  }).select('id').single();

  if (error) throw new Error(error.message);

  // 2. Insert subject relations
  if (data.subject_ids && data.subject_ids.length > 0 && newPack) {
    const subjectMappings = data.subject_ids.map(subId => ({
      package_id: newPack.id,
      subject_id: subId
    }));
    
    const { error: relError } = await supabase.from('package_subjects').insert(subjectMappings);
    if (relError) console.error("Erreur ajout matières au pack:", relError);
  }

  revalidatePath('/admin/packs');
}

export async function updatePack(id: string, data: { 
  name: string; 
  description: string; 
  price_tnd: number; 
  is_active: boolean; 
  duration_days: number;
  subject_ids: string[];
}) {
  const supabase = await createClient();
  
  // 1. Update package details
  const { error } = await supabase.from('packages').update({
    name: data.name,
    description: data.description,
    price_tnd: data.price_tnd,
    is_active: data.is_active,
    duration_days: data.duration_days,
  }).eq('id', id);

  if (error) throw new Error(error.message);

  // 2. Sync subject relations
  // Delete all existing relations for this pack
  await supabase.from('package_subjects').delete().eq('package_id', id);
  
  // Insert new relations
  if (data.subject_ids && data.subject_ids.length > 0) {
    const subjectMappings = data.subject_ids.map(subId => ({
      package_id: id,
      subject_id: subId
    }));
    
    const { error: relError } = await supabase.from('package_subjects').insert(subjectMappings);
    if (relError) console.error("Erreur mise à jour matières du pack:", relError);
  }

  revalidatePath('/admin/packs');
}

export async function deletePack(id: string) {
  const supabase = await createClient();
  // Supabase ON DELETE CASCADE handles package_subjects cleanup automatically.
  const { error } = await supabase.from('packages').delete().eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/packs');
}
