import React from 'react';
import { Plus, Search, Filter, PenTool } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ExercisesManager() {
  const supabase = await createClient();

  const { data: exercises } = await supabase
    .from('exercises')
    .select(`
      id,
      title,
      difficulty,
      is_premium,
      subjects (
        name
      )
    `)
    .order('title', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedExercises = (exercises || []).map((e: any) => ({
    id: e.id,
    titre: e.title,
    matiere: e.subjects?.name || 'Inconnue',
    difficulte: e.difficulty === 'easy' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Facile</Badge>
    ) : e.difficulty === 'intermediate' ? (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Moyen</Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Difficile</Badge>
    ),
    acces: e.is_premium ? (
      <span className="text-gold-600 font-semibold text-sm">Premium</span>
    ) : (
      <span className="text-green-600 font-semibold text-sm">Gratuit</span>
    ),
  }));

  const columns = [
    { accessorKey: 'titre', header: 'Titre de l\'exercice' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'difficulte', header: 'Difficulté' },
    { accessorKey: 'acces', header: 'Accès' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Banque d'Exercices</h1>
          <p className="text-gray-500 mt-1">Gérez tous les exercices et leurs corrections détaillées.</p>
        </div>
        <Link href="#">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Exercice
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher un exercice..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {formattedExercises.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={formattedExercises}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <PenTool className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucun exercice n'a été créé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
