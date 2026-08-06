'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button, Badge, Modal, Input, Select, Textarea } from '@/components/ui';
import { DataTable, Column } from '@/components/admin/data-table';

interface Exam {
  id: string;
  title: string;
  subject: string;
  year: string;
  session: 'Principale' | 'Contrôle';
  status: 'published' | 'draft';
}

const mockData: Exam[] = [
  { id: '1', title: 'Examen Microéconomie 2023', subject: 'Microéconomie', year: '2023', session: 'Principale', status: 'published' },
  { id: '2', title: 'Examen Microéconomie 2022', subject: 'Microéconomie', year: '2022', session: 'Principale', status: 'published' },
  { id: '3', title: 'Examen Macroéconomie 2023', subject: 'Macroéconomie', year: '2023', session: 'Contrôle', status: 'draft' },
];

export default function ExamManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<Exam>[] = [
    { header: 'Titre', accessorKey: 'title', cell: (item) => <span className="font-medium text-navy-900">{item.title}</span> },
    { header: 'Matière', accessorKey: 'subject' },
    { header: 'Année', accessorKey: 'year' },
    { 
      header: 'Session', 
      accessorKey: 'session',
      cell: (item) => (
        <Badge variant={item.session === 'Principale' ? 'success' : 'warning'}>
          {item.session}
        </Badge>
      )
    },
    { 
      header: 'Statut', 
      accessorKey: 'status',
      cell: (item) => (
        <Badge variant={item.status === 'published' ? 'success' : 'default'}>
          {item.status === 'published' ? 'Publié' : 'Brouillon'}
        </Badge>
      )
    },
  ];

  const actions = (item: Exam) => (
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
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Examens</h1>
          <p className="text-gray-500 mt-1">Gérez les anciens examens et leurs corrections.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Examen
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={mockData}
        searchPlaceholder="Rechercher un examen..."
        actions={actions}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ajouter un Examen" className="max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Titre</label>
              <Input placeholder="Titre de l'examen" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-900">Matière</label>
                <Input placeholder="Matière" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-navy-900">Année</label>
                <Input placeholder="Ex: 2023" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Session</label>
              <Select
                options={[
                  { label: 'Principale', value: 'principale' },
                  { label: 'Contrôle', value: 'controle' },
                ]}
                placeholder="Session"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Énoncé (Markdown)</label>
              <Textarea placeholder="Saisissez l'énoncé en Markdown..." className="h-32 font-mono text-sm" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-navy-900">Correction détaillée (Markdown)</label>
              <Textarea placeholder="Saisissez la correction détaillée..." className="h-32 font-mono text-sm" />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button variant="outline">Enregistrer Brouillon</Button>
          <Button onClick={() => setIsModalOpen(false)}>Publier</Button>
        </div>
      </Modal>
    </div>
  );
}
