import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ExamensManager() {
  const supabase = await createClient();

  const { data: exams } = await supabase
    .from('exams')
    .select(`
      id,
      title,
      duration_minutes,
      status,
      is_mock_exam,
      subjects (
        name
      )
    `)
    .order('title', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedExams = (exams || []).map((e: any) => ({
    id: e.id,
    titre: e.title,
    matiere: e.subjects?.name || 'Inconnue',
    type: e.is_mock_exam ? (
      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Examen Blanc</Badge>
    ) : (
      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Sujet Réel</Badge>
    ),
    duree: `${e.duration_minutes} min`,
    statut: e.status === 'published' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Publié</Badge>
    ) : e.status === 'archived' ? (
      <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">Archivé</Badge>
    ) : (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Brouillon</Badge>
    )
  }));

  const columns = [
    { accessorKey: 'titre', header: 'Titre de l\'examen' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'duree', header: 'Durée' },
    { accessorKey: 'statut', header: 'Statut' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Examens</h1>
          <p className="text-gray-500 mt-1">Créez et gérez les examens blancs et sujets de révision.</p>
        </div>
        <Link href="#">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvel Examen
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher un examen..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {formattedExams.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={formattedExams}
          />
        ) : (
          <div className="p-12 text-center text-gray-500">
            Aucun examen disponible.
          </div>
        )}
      </div>
    </div>
  );
}
