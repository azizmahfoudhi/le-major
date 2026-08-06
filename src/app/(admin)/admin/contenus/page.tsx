'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Archive, Trash2 } from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { DataTable, Column } from '@/components/admin/data-table';

interface Content {
  id: string;
  title: string;
  type: string;
  subject: string;
  status: 'published' | 'draft' | 'archived';
  date: string;
}

const mockData: Content[] = [
  { id: '1', title: 'Chapitre 1: Introduction à la Microéconomie', type: 'Cours', subject: 'Microéconomie', status: 'published', date: '12 Oct 2023' },
  { id: '2', title: 'Résumé: Les agents économiques', type: 'Résumé', subject: 'Macroéconomie', status: 'published', date: '15 Oct 2023' },
  { id: '3', title: 'Formulaire de Mathématiques', type: 'Ressource', subject: 'Mathématiques', status: 'draft', date: '20 Oct 2023' },
  { id: '4', title: 'Chapitre 2: Le comportement du consommateur', type: 'Cours', subject: 'Microéconomie', status: 'archived', date: '01 Nov 2023' },
];

export default function ContentManager() {
  const router = useRouter();

  const columns: Column<Content>[] = [
    { header: 'Titre', accessorKey: 'title', cell: (item) => <span className="font-medium text-navy-900">{item.title}</span> },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Matière', accessorKey: 'subject' },
    { 
      header: 'Statut', 
      accessorKey: 'status',
      cell: (item) => {
        const variants: Record<string, "success" | "warning" | "default"> = {
          published: 'success',
          draft: 'warning',
          archived: 'default'
        };
        const labels: Record<string, string> = {
          published: 'Publié',
          draft: 'Brouillon',
          archived: 'Archivé'
        };
        return <Badge variant={variants[item.status]}>{labels[item.status]}</Badge>;
      }
    },
    { header: 'Date', accessorKey: 'date' },
  ];

  const actions = (item: Content) => (
    <div className="flex items-center justify-end space-x-2">
      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-navy-900">
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-orange-600">
        <Archive className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-red-600">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Contenus</h1>
          <p className="text-gray-500 mt-1">Gérez les cours, résumés et ressources de la plateforme.</p>
        </div>
        <Button onClick={() => router.push('/admin/contenus/nouveau')}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Contenu
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={mockData}
        searchPlaceholder="Rechercher un contenu..."
        actions={actions}
      />
    </div>
  );
}
