import React from 'react';
import { createClient } from '@/lib/supabase/server';
import PacksClient from './packs-client';

export default async function PacksManager() {
  const supabase = await createClient();

  const { data: packages } = await supabase
    .from('packages')
    .select(`
      id,
      name,
      description,
      price_tnd,
      is_active,
      student_activations (
        id
      )
    `)
    .order('name', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedPacks = (packages || []).map((p: any) => ({
    id: p.id,
    nom: p.name,
    prix: p.price_tnd ? `${p.price_tnd} TND` : 'Gratuit',
    etudiants: p.student_activations?.length || 0,
    is_active: p.is_active,
    _raw: p
  }));

  return <PacksClient initialPacks={formattedPacks} />;
}
