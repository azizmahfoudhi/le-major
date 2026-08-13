import React from 'react';
import { Badge } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';
import CodesClient from './codes-client';

export default async function CodesManager() {
  const supabase = await createClient();

  // Fetch codes
  const { data: codes } = await supabase
    .from('activation_codes')
    .select(`
      id,
      code,
      status,
      created_at,
      packages (
        name
      )
    `)
    .order('created_at', { ascending: false });

  // Fetch packages for the generator modal
  const { data: packages } = await supabase
    .from('packages')
    .select('id, name')
    .order('name', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedCodes = (codes || []).map((c: any) => ({
    id: c.id,
    code_raw: c.code,
    code: <span className="font-mono font-bold tracking-wider">{c.code}</span>,
    pack: c.packages?.name || 'Inconnu',
    statut_raw: c.status,
    statut: c.status === 'activated' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Activé</Badge>
    ) : (
      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Disponible</Badge>
    ),
    date: new Date(c.created_at).toLocaleDateString('fr-FR'),
  }));

  return (
    <CodesClient 
      packages={packages || []} 
      codes={formattedCodes} 
    />
  );
}
