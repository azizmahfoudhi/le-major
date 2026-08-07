'use client';

import React, { useState } from 'react';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createPack, updatePack, deletePack } from './actions';

type Pack = {
  id: string;
  nom: string;
  prix: string;
  etudiants: number;
  is_active: boolean;
  _raw: Record<string, unknown>; // original db row
};

export default function PacksClient({ initialPacks }: { initialPacks: Pack[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceTnd, setPriceTnd] = useState('');
  const [isActive, setIsActive] = useState(true);

  const columns = [
    { accessorKey: 'nom', header: 'Nom du pack' },
    { accessorKey: 'prix', header: 'Prix' },
    { accessorKey: 'etudiants', header: 'Étudiants actifs' },
    { 
      accessorKey: 'statut', 
      header: 'Statut',
      cell: (item: Pack) => item.is_active ? (
        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Actif</Badge>
      ) : (
        <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">Inactif</Badge>
      )
    },
  ];

  const handleOpenNew = () => {
    setEditingPack(null);
    setName('');
    setDescription('');
    setPriceTnd('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pack: Pack) => {
    setEditingPack(pack._raw);
    setName((pack._raw.name as string) || '');
    setDescription((pack._raw.description as string) || '');
    setPriceTnd((pack._raw.price_tnd as number)?.toString() || '');
    setIsActive(pack._raw.is_active as boolean);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) {
      await deletePack(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        description,
        price_tnd: parseFloat(priceTnd) || 0,
        is_active: isActive
      };
      
      if (editingPack) {
        await updatePack(editingPack.id as string, payload);
      } else {
        await createPack(payload);
      }
      setIsModalOpen(false);
    } catch {
      alert('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Packs</h1>
          <p className="text-gray-500 mt-1">Créez et gérez les offres commerciales (accès aux matières).</p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Pack
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {initialPacks.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={initialPacks}
            enableSearch={true}
            searchPlaceholder="Rechercher un pack..."
            actions={(item) => (
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)}>
                  <Edit className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Package className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucun pack n'a été créé.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-navy-900">
                {editingPack ? 'Modifier le Pack' : 'Nouveau Pack'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du pack</label>
                <Input 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="ex: Pack Premium..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  className="w-full flex min-h-[80px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prix (TND)</label>
                <Input 
                  required 
                  type="number" 
                  step="0.1"
                  value={priceTnd} 
                  onChange={e => setPriceTnd(e.target.value)} 
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Actif (Visible aux étudiants)</label>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
