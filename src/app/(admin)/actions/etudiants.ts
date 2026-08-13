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

export async function grantPackageToStudent(studentId: string, packageId: string) {
  const supabase = await createClient();
  
  // Get package duration
  const { data: pkg, error: pkgError } = await supabase
    .from('packages')
    .select('duration_days')
    .eq('id', packageId)
    .single();
    
  if (pkgError || !pkg) return { success: false, error: 'Package introuvable' };

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (pkg.duration_days || 365));

  // Check if they already have it active
  const { data: existing } = await supabase
    .from('student_activations')
    .select('id')
    .eq('student_id', studentId)
    .eq('package_id', packageId)
    .eq('is_active', true)
    .single();

  if (existing) {
    return { success: false, error: 'Cet étudiant possède déjà ce pack actif.' };
  }

  const { error } = await supabase.from('student_activations').insert({
    student_id: studentId,
    package_id: packageId,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    is_active: true
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/etudiants');
  return { success: true };
}

export async function revokePackageFromStudent(activationId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('student_activations')
    .update({ is_active: false })
    .eq('id', activationId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/etudiants');
  return { success: true };
}
