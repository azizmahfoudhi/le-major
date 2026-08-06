'use client';

import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button, Badge, Modal, Input } from '@/components/ui';
import { DataTable, Column } from '@/components/admin/data-table';

interface Pack {
  id: string;
  name: string;
  duration: number;
  subjectsCount: number;
  codesCount: number;
  status: 'active' | 'inactive';
}

const mockData: Pack[] = [
  { id: '1', name: 'Pack Premium Semestre 1', duration: 180, subjectsCount: 5, codesCount: 1500, status: 'active' },
  { id: '2', name: 'Pack Révision Express S1', duration: 30, subjectsCount: 3, codesCount: 800, status: 'active' },
  { id: '3', name: 'Pack Premium Semestre 2', duration: 180, subjectsCount: 5, codesCount: 0, status: 'inactive' },
];

export default function PackageManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns: Column<Pack>[] = [
    { header: 'Nom du Pack', accessorKey: 'name', cell: (item) => <span className="font-medium text-navy-900">{item.name}</span> },
    { header: 'Durée (jours)', accessorKey: 'duration' },
    { header: 'Matières incluses', accessorKey: 'subjectsCount', cell: (item) => `${item.subjectsCount} matières` },
    { header: 'Codes générés', accessorKey: 'codesCount' },
    { 
      header: 'Statut', 
      accessorKey: 'status',
      cell: (item) => (
        <Badge variant={item.status === 'active' ? 'success' : 'default'}>
          {item.status === 'active' ? 'Actif' : 'Inactif'}
        </Badge>
      )
    },
  ];

  const actions = (item: Pack) => (
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
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Packs</h1>
          <p className="text-gray-500 mt-1">Créez et configurez les packs d'accès pour les étudiants.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Pack
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={mockData}
        searchPlaceholder="Rechercher un pack..."
        actions={actions}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Créer un Pack" className="max-w-xl">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-navy-900">Nom du Pack</label>
            <Input placeholder="Ex: Pack Premium S1" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-navy-900">Durée d'accès (en jours)</label>
            <Input type="number" placeholder="Ex: 180" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-navy-900">Matières incluses</label>
            <div className="p-4 border border-gray-100 rounded-lg bg-gray-50 max-h-48 overflow-y-auto space-y-2">
              {['Microéconomie', 'Macroéconomie', 'Mathématiques', 'Comptabilité I', 'Statistiques'].map((subject, i) => (
                <label key={i} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="rounded text-gold-500 focus:ring-gold-500 border-gray-300" />
                  <span className="text-sm text-navy-900">{subject}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
          <Button onClick={() => setIsModalOpen(false)}>Créer le Pack</Button>
        </div>
      </Modal>
    </div>
  );
}
