import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ResourceForm from '../../nouveau/resource-form';
import { notFound } from 'next/navigation';

export default async function ModifierRessourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: content } = await supabase
    .from('contents')
    .select('*')
    .eq('id', id)
    .single();

  if (!content) {
    notFound();
  }

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

  const initialData = {
    id: content.id,
    title: content.title,
    chapter_id: content.chapter_id,
    body: content.body,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Modifier la Ressource</h1>
        <p className="text-gray-500 mt-1">Mettez à jour votre ressource annexe.</p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6 sm:p-8">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ResourceForm chapters={(chapters as any) || []} initialData={initialData} />
      </div>
    </div>
  );
}
