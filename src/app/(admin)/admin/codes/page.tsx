import React from 'react';
import { Search, Filter, KeyRound } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
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
    code: <span className="font-mono font-bold tracking-wider">{c.code}</span>,
    pack: c.packages?.name || 'Inconnu',
    statut: c.status === 'activated' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Activé</Badge>
    ) : (
      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Disponible</Badge>
    ),
    date: new Date(c.created_at).toLocaleDateString('fr-FR'),
  }));

  const columns = [
    { accessorKey: 'code', header: 'Code d\'activation' },
    { accessorKey: 'pack', header: 'Package lié' },
    { accessorKey: 'statut', header: 'Statut' },
    { accessorKey: 'date', header: 'Créé le' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Codes d'Activation</h1>
          <p className="text-gray-500 mt-1">Générez et gérez les codes d'accès pour les étudiants.</p>
        </div>
        <CodesClient packages={packages || []} />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher un code..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {formattedCodes.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={formattedCodes}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <KeyRound className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucun code d'activation n'a été généré.</p>
          </div>
        )}
      </div>
    </div>
  );
}
