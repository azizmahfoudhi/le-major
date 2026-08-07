import React from 'react';
import { Plus, Search, Filter, Layers } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function SeriesManager() {
  const supabase = await createClient();

  const { data: series } = await supabase
    .from('series')
    .select(`
      id,
      title,
      difficulty,
      is_premium,
      subjects (
        name
      ),
      series_exercises (
        id
      )
    `)
    .order('title', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedSeries = (series || []).map((s: any) => ({
    id: s.id,
    titre: s.title,
    matiere: s.subjects?.name || 'Inconnue',
    exercices: s.series_exercises?.length || 0,
    difficulte: s.difficulty === 'easy' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Facile</Badge>
    ) : s.difficulty === 'intermediate' ? (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Moyen</Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Difficile</Badge>
    ),
    acces: s.is_premium ? (
      <span className="text-gold-600 font-semibold text-sm">Premium</span>
    ) : (
      <span className="text-green-600 font-semibold text-sm">Gratuit</span>
    ),
  }));

  const columns = [
    { accessorKey: 'titre', header: 'Titre de la série' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'exercices', header: 'Nombre d\'exercices' },
    { accessorKey: 'difficulte', header: 'Difficulté' },
    { accessorKey: 'acces', header: 'Accès' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Séries d'Exercices</h1>
          <p className="text-gray-500 mt-1">Gérez les séries (regroupements d'exercices).</p>
        </div>
        <Link href="#">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Série
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher une série..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {formattedSeries.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={formattedSeries}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Layers className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucune série n'a été créée.</p>
          </div>
        )}
      </div>
    </div>
  );
}
