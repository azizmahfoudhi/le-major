'use client';

import React, { useState } from 'react';
import { Plus, Copy, Download, XCircle } from 'lucide-react';
import { Button, Badge, Modal, Input, Select } from '@/components/ui';
import { DataTable, Column } from '@/components/admin/data-table';
import { generateActivationCode } from '@/lib/utils/format';

interface ActivationCode {
  id: string;
  code: string;
  packName: string;
  status: 'active' | 'used' | 'revoked';
  usedBy?: string;
  createdAt: string;
}

const mockData: ActivationCode[] = [
  { id: '1', code: 'LM-A7B9K2', packName: 'Pack Premium Semestre 1', status: 'used', usedBy: 'Ahmed Ben Ali', createdAt: '12 Oct 2023' },
  { id: '2', code: 'LM-X4M8P9', packName: 'Pack Premium Semestre 1', status: 'active', createdAt: '15 Oct 2023' },
  { id: '3', code: 'LM-J2N5L7', packName: 'Pack Révision Express S1', status: 'revoked', createdAt: '20 Oct 2023' },
];

export default function CodeManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const columns: Column<ActivationCode>[] = [
    { 
      header: 'Code', 
      accessorKey: 'code', 
      cell: (item) => <span className="font-mono font-medium text-navy-900">{item.code}</span> 
    },
    { header: 'Pack', accessorKey: 'packName' },
    { 
      header: 'Statut', 
      accessorKey: 'status',
      cell: (item) => {
        const variants: Record<string, "success" | "warning" | "default" | "error"> = {
          active: 'success',
          used: 'default',
          revoked: 'error'
        };
        const labels: Record<string, string> = {
          active: 'Actif',
          used: 'Utilisé',
          revoked: 'Révoqué'
        };
        return <Badge variant={variants[item.status]}>{labels[item.status]}</Badge>;
      }
    },
    { header: 'Utilisé par', accessorKey: 'usedBy', cell: (item) => item.usedBy || '-' },
    { header: 'Date création', accessorKey: 'createdAt' },
  ];

  const actions = (item: ActivationCode) => (
    <div className="flex items-center justify-end space-x-2">
      <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-navy-900" title="Copier">
        <Copy className="h-4 w-4" />
      </Button>
      {item.status === 'active' && (
        <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-red-600" title="Révoquer">
          <XCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const handleGenerate = () => {
    const codes = Array.from({ length: quantity }, () => generateActivationCode());
    setGeneratedCodes(codes);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Codes d'Activation</h1>
          <p className="text-gray-500 mt-1">Générez et gérez les codes d'accès aux packs.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter (CSV)
          </Button>
          <Button onClick={() => { setGeneratedCodes([]); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Générer des codes
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={mockData}
        searchPlaceholder="Rechercher un code ou un étudiant..."
        actions={actions}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Générer des Codes" className="max-w-xl">
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-navy-900">Sélectionner un Pack</label>
            <Select
              options={[
                { label: 'Pack Premium Semestre 1', value: '1' },
                { label: 'Pack Révision Express S1', value: '2' },
              ]}
              placeholder="Choisir un pack"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-navy-900">Quantité (1-100)</label>
            <Input 
              type="number" 
              min={1} 
              max={100} 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))} 
            />
          </div>

          {generatedCodes.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-navy-900">{generatedCodes.length} codes générés</span>
                <Button variant="ghost" size="sm" className="h-7 text-gold-600">
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Tout copier
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto font-mono text-sm space-y-1">
                {generatedCodes.map((c, i) => (
                  <div key={i} className="px-2 py-1 bg-white border border-gray-100 rounded">{c}</div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Fermer</Button>
          {!generatedCodes.length && <Button onClick={handleGenerate}>Générer</Button>}
        </div>
      </Modal>
    </div>
  );
}
