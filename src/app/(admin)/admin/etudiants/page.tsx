import React from 'react';
import { createClient } from '@/lib/supabase/server';
import EtudiantsClient from './etudiants-client';
import { Badge } from '@/components/ui';

export default async function EtudiantsManager() {
  const supabase = await createClient();

  // Fetch profiles with activations
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      id,
      first_name,
      last_name,
      role,
      created_at,
      universities (
        name
      ),
      formations (
        name
      ),
      student_activations (
        id,
        is_active,
        start_date,
        end_date,
        packages (
          id,
          name
        )
      )
    `)
    .order('created_at', { ascending: false });

  // Fetch packages for the grant modal
  const { data: packages } = await supabase
    .from('packages')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedProfiles = (profiles || []).map((p: any) => ({
    id: p.id,
    nom: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Utilisateur sans nom',
    role: p.role === 'admin' ? (
      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Admin</Badge>
    ) : (
      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Étudiant</Badge>
    ),
    universite: p.universities?.name || 'Non renseignée',
    formation: p.formations?.name || 'Non renseignée',
    date: new Date(p.created_at).toLocaleDateString('fr-FR'),
    _raw: p // Contains student_activations
  }));

  return <EtudiantsClient initialStudents={formattedProfiles} packages={packages || []} />;
}
