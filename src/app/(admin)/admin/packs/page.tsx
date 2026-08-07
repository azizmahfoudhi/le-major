import React from 'react';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

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
    statut: p.is_active ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Actif</Badge>
    ) : (
      <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">Inactif</Badge>
    ),
  }));

  const columns = [
    { accessorKey: 'nom', header: 'Nom du pack' },
    { accessorKey: 'prix', header: 'Prix' },
    { accessorKey: 'etudiants', header: 'Étudiants actifs' },
    { accessorKey: 'statut', header: 'Statut' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Packs</h1>
          <p className="text-gray-500 mt-1">Créez et gérez les offres commerciales (accès aux matières).</p>
        </div>
        <Link href="#">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Pack
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher un pack..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {formattedPacks.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={formattedPacks}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Package className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucun pack n'a été créé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
