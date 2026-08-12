import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ContentForm from './content-form';

export default async function NouveauContenuPage() {
  const supabase = await createClient();

  // Fetch chapters with their subjects to populate the select dropdown
  const { data: chapters } = await supabase
    .from('chapters')
    .select(`
      id,
      title,
      subjects (
        name
      )
    `)
    .order('subject_id', { ascending: true })
    .order('order_index', { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Nouvelle Fiche de Révision</h1>
        <p className="text-gray-500 mt-1">Créez une nouvelle fiche de révision au format MDX.</p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ContentForm chapters={(chapters as any) || []} />
      </div>
    </div>
  );
}
