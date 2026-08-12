import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ResourceForm from './resource-form';

export default async function NouvelleRessourcePage() {
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
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Nouvelle Ressource Annexe</h1>
        <p className="text-gray-500 mt-1">Ajoutez un PDF, un lien ou une vidéo (format MDX).</p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ResourceForm chapters={(chapters as any) || []} />
      </div>
    </div>
  );
}
