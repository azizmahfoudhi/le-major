'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, Folder, FolderOpen, Book } from 'lucide-react';
import { Button, Card, EmptyState, Modal, Input } from '@/components/ui';

interface TreeNode {
  id: string;
  name: string;
  type: string;
  children?: TreeNode[];
}

const mockStructure: TreeNode[] = [
  {
    id: 'u1',
    name: 'IHEC Carthage',
    type: 'Université',
    children: [
      {
        id: 'f1',
        name: 'Licence en Gestion',
        type: 'Formation',
        children: [
          {
            id: 'n1',
            name: '1ère Année',
            type: 'Niveau',
            children: [
              {
                id: 'e1',
                name: 'Édition 2023-2024',
                type: 'Édition',
                children: [
                  {
                    id: 's1',
                    name: 'Semestre 1',
                    type: 'Semestre',
                    children: [
                      { id: 'm1', name: 'Microéconomie', type: 'Matière' },
                      { id: 'm2', name: 'Comptabilité Financière I', type: 'Matière' },
                      { id: 'm3', name: 'Mathématiques', type: 'Matière' },
                    ]
                  },
                  {
                    id: 's2',
                    name: 'Semestre 2',
                    type: 'Semestre',
                    children: [
                      { id: 'm4', name: 'Macroéconomie', type: 'Matière' },
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

function TreeItem({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div 
        className="flex items-center group py-2 hover:bg-gray-50 rounded-md px-2 transition-colors cursor-pointer"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-5 flex items-center justify-center mr-1">
          {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <span className="w-4 h-4" />
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-1">
          {node.type === 'Matière' ? (
            <Book className="h-4 w-4 text-blue-500" />
          ) : isOpen && hasChildren ? (
            <FolderOpen className="h-4 w-4 text-gold-500" />
          ) : (
            <Folder className="h-4 w-4 text-gold-500" />
          )}
          <span className="font-medium text-navy-900">{node.name}</span>
          <span className="text-xs text-gray-400 font-normal px-2 py-0.5 bg-gray-100 rounded-full">
            {node.type}
          </span>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.type !== 'Matière' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-navy-900" onClick={(e) => e.stopPropagation()}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-navy-900" onClick={(e) => e.stopPropagation()}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-700" onClick={(e) => e.stopPropagation()}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StructureManager() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Structure Académique</h1>
          <p className="text-gray-500 mt-1">Gérez les universités, formations, niveaux et matières.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une Université
        </Button>
      </div>

      <Card className="p-4">
        <div className="space-y-1">
          {mockStructure.map((node) => (
            <TreeItem key={node.id} node={node} />
          ))}
        </div>
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Ajouter une Université">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-navy-900">Nom de l'Université</label>
            <Input placeholder="Ex: IHEC Carthage" />
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
            <Button onClick={() => setIsAddModalOpen(false)}>Enregistrer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
