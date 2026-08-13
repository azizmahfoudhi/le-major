import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PacksClient from './packs-client';

export default async function PacksManager() {
  const supabase = await createClient();

  // 1. Fetch all packages with their basic student count
  const { data: packages } = await supabase
    .from('packages')
    .select(`
      id,
      name,
      description,
      price_tnd,
      is_active,
      duration_days,
      student_activations ( id )
    `)
    .order('name', { ascending: true });

  // 2. Fetch all subjects for the checkboxes
  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name', { ascending: true });

  // 3. Fetch package_subjects mapping
  const { data: packageSubjects } = await supabase
    .from('package_subjects')
    .select('package_id, subject_id');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedPacks = (packages || []).map((p: any) => {
    // Find all subjects associated with this pack
    const associatedSubjectIds = (packageSubjects || [])
      .filter(ps => ps.package_id === p.id)
      .map(ps => ps.subject_id);

    return {
      id: p.id,
      nom: p.name,
      prix: p.price_tnd ? `${p.price_tnd} TND` : 'Gratuit',
      duree: p.duration_days ? `${p.duration_days} j` : 'À vie',
      etudiants: p.student_activations?.length || 0,
      is_active: p.is_active,
      subject_count: associatedSubjectIds.length,
      _raw: {
        ...p,
        subject_ids: associatedSubjectIds
      }
    };
  });

  return <PacksClient initialPacks={formattedPacks} subjects={subjects || []} />;
}
