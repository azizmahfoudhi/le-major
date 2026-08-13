import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ContenusClient from './contenus-client';
import { Badge } from '@/components/ui';

export default async function ContenusManager() {
  const supabase = await createClient();

  // Get all summaries and resources
  const { data: contents } = await supabase
    .from('contents')
    .select(`
      id,
      title,
      type,
      status,
      created_at,
      chapters (
        title,
        subjects (
          name
        )
      )
    `)
    .in('type', ['summary', 'resource'])
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedContents = (contents || []).map((c: any) => ({
    id: c.id,
    titre: c.title,
    matiere: c.chapters?.subjects?.name || 'Inconnue',
    chapitre: c.chapters?.title || 'Inconnu',
    type: c.type, // 'summary' or 'resource'
    statut: c.status === 'published' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Publié</Badge>
    ) : c.status === 'archived' ? (
      <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">Archivé</Badge>
    ) : (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Brouillon</Badge>
    ),
    date: new Date(c.created_at).toLocaleDateString('fr-FR')
  }));

  return <ContenusClient initialContents={formattedContents} />;
}
