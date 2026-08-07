import React from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ContenusManager() {
  const supabase = await createClient();

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
    .order('created_at', { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedContents = (contents || []).map((c: any) => ({
    id: c.id,
    titre: c.title,
    matiere: c.chapters?.subjects?.name || 'Inconnue',
    chapitre: c.chapters?.title || 'Inconnu',
    type: c.type === 'lesson' ? 'Leçon' : c.type === 'summary' ? 'Résumé' : 'Ressource',
    statut: c.status === 'published' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Publié</Badge>
    ) : c.status === 'archived' ? (
      <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">Archivé</Badge>
    ) : (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Brouillon</Badge>
    ),
    date: new Date(c.created_at).toLocaleDateString('fr-FR')
  }));

  const columns = [
    { accessorKey: 'titre', header: 'Titre' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'chapitre', header: 'Chapitre' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'statut', header: 'Statut' },
    { accessorKey: 'date', header: 'Date d\'ajout' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Contenus de Cours</h1>
          <p className="text-gray-500 mt-1">Gérez les leçons, résumés et ressources.</p>
        </div>
        <Link href="#">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau Contenu
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Rechercher un contenu..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {formattedContents.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={formattedContents}
          />
        ) : (
          <div className="p-12 text-center text-gray-500">
            Aucun contenu disponible.
          </div>
        )}
      </div>
    </div>
  );
}
