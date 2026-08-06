'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button, Modal, Input, Textarea, Badge } from '@/components/ui';
import { DataTable, Column } from '@/components/admin/data-table';

interface Series {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  exerciseCount: number;
}

const mockData: Series[] = [
  { id: '1', title: 'Série 1: Comportement du consommateur', subject: 'Microéconomie', chapter: 'Chapitre 2', exerciseCount: 5 },
  { id: '2', title: 'Série 2: La fonction de production', subject: 'Microéconomie', chapter: 'Chapitre 3', exerciseCount: 4 },
  { id: '3', title: 'Série 1: Modèle Keynesien simple', subject: 'Macroéconomie', chapter: 'Chapitre 1', exerciseCount: 6 },
];

export default function SeriesManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<Series>[] = [
    { header: 'Titre', accessorKey: 'title', cell: (item) => <span className="font-medium text-navy-900">{item.title}</span> },
    { header: 'Matière', accessorKey: 'subject' },
    { header: 'Chapitre', accessorKey: 'chapter' },
    { 
      header: 'Exercices', 
      accessorKey: 'exerciseCount',
      cell: (item) => <Badge variant="default">{item.exerciseCount} exercices</Badge>
    },
  ];

  const actions = (item: Series) => (
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
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Séries</h1>
          <p className="text-gray-500 mt-1">Regroupez des exercices en séries thématiques.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Série
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={mockData}
        searchPlaceholder="Rechercher une série..."
        actions={actions}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer une Série" className="max-w-3xl">
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-navy-900">Titre de la série</label>
              <Input placeholder="Ex: Série 1: Élasticités" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Matière</label>
              <Input placeholder="Matière" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Chapitre</label>
              <Input placeholder="Chapitre" />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-navy-900">Description (Optionnelle)</label>
              <Textarea placeholder="Objectifs de la série..." />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-navy-900">Exercices inclus</label>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Ajouter un exercice
              </Button>
            </div>
            
            <div className="border border-gray-100 rounded-lg bg-gray-50 divide-y divide-gray-100">
              {/* Mock items for sorting */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center p-3 bg-white">
                  <div className="cursor-grab text-gray-400 mr-3 hover:text-navy-900">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-navy-900">Exercice {i}: Titre mock de l'exercice</p>
                    <p className="text-xs text-gray-500">Difficulté: Moyen • 5 points</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button onClick={() => setIsModalOpen(false)}>Enregistrer la série</Button>
        </div>
      </Modal>
    </div>
  );
}
