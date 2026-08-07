import React from 'react';
import { createClient } from '@/lib/supabase/server';
import EtudiantsClient from './etudiants-client';
import { Badge } from '@/components/ui';

export default async function EtudiantsManager() {
  const supabase = await createClient();

  // Fetch profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      role,
      created_at,
      universities (
        name
      ),
      formations (
        name
      )
    `)
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedProfiles = (profiles || []).map((p: any) => ({
    id: p.id,
    nom: p.full_name || 'Utilisateur sans nom',
    role: p.role === 'admin' ? (
      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Admin</Badge>
    ) : (
      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Étudiant</Badge>
    ),
    universite: p.universities?.name || 'Non renseignée',
    formation: p.formations?.name || 'Non renseignée',
    date: new Date(p.created_at).toLocaleDateString('fr-FR'),
    _raw: p
  }));

  return <EtudiantsClient initialStudents={formattedProfiles} />;
}
