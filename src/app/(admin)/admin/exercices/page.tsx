'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, Textarea } from '@/components/ui';
import { DataTable, Column } from '@/components/admin/data-table';

interface Exercise {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  points: number;
  status: 'published' | 'draft';
}

const mockData: Exercise[] = [
  { id: '1', title: 'Calcul d\'élasticité', subject: 'Microéconomie', chapter: 'Chapitre 2', difficulty: 'Moyen', points: 5, status: 'published' },
  { id: '2', title: 'Maximisation du profit', subject: 'Microéconomie', chapter: 'Chapitre 3', difficulty: 'Difficile', points: 10, status: 'published' },
  { id: '3', title: 'Équilibre IS-LM', subject: 'Macroéconomie', chapter: 'Chapitre 1', difficulty: 'Moyen', points: 8, status: 'draft' },
];

export default function ExerciseManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<Exercise>[] = [
    { header: 'Titre', accessorKey: 'title', cell: (item) => <span className="font-medium text-navy-900">{item.title}</span> },
    { header: 'Matière', accessorKey: 'subject' },
    { header: 'Chapitre', accessorKey: 'chapter' },
    { 
      header: 'Difficulté', 
      accessorKey: 'difficulty',
      cell: (item) => (
        <Badge variant={item.difficulty === 'Facile' ? 'success' : item.difficulty === 'Moyen' ? 'warning' : 'default'} 
               className={item.difficulty === 'Difficile' ? 'bg-red-50 text-red-700' : ''}>
          {item.difficulty}
        </Badge>
      )
    },
    { header: 'Points', accessorKey: 'points' },
    { 
      header: 'Statut', 
      accessorKey: 'status',
      cell: (item) => (
        <Badge variant={item.status === 'published' ? 'success' : 'warning'}>
          {item.status === 'published' ? 'Publié' : 'Brouillon'}
        </Badge>
      )
    },
  ];

  const actions = (item: Exercise) => (
    <div className="flex items-center justify-end space-x-2">
      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-navy-900">
        <Edit2 className="h-4 w-4" />
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
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Exercices</h1>
          <p className="text-gray-500 mt-1">Gérez la base d'exercices et leurs corrections.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Exercice
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={mockData}
        searchPlaceholder="Rechercher un exercice..."
        actions={actions}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer un Exercice" className="max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Titre</label>
              <Input placeholder="Titre de l'exercice" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-900">Matière</label>
                <Select
                  options={[
                    { label: 'Microéconomie', value: 'micro' },
                    { label: 'Macroéconomie', value: 'macro' },
                  ]}
                  placeholder="Matière"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-900">Chapitre</label>
                <Input placeholder="Chapitre" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-900">Difficulté</label>
                <Select
                  options={[
                    { label: 'Facile', value: 'facile' },
                    { label: 'Moyen', value: 'moyen' },
                    { label: 'Difficile', value: 'difficile' },
                  ]}
                  placeholder="Difficulté"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-900">Points</label>
                <Input type="number" placeholder="Points" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Énoncé (Markdown)</label>
              <Textarea placeholder="Saisissez l'énoncé en Markdown..." className="h-32 font-mono text-sm" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Correction (Markdown)</label>
              <Textarea placeholder="Saisissez la correction détaillée..." className="h-32 font-mono text-sm" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button variant="outline">Enregistrer Brouillon</Button>
          <Button onClick={() => setIsModalOpen(false)}>Publier l'Exercice</Button>
        </div>
      </Modal>
    </div>
  );
}
