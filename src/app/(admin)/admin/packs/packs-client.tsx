'use client';

import React, { useState, useRef } from 'react';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createPack, updatePack, deletePack } from './actions';
import MediaPicker from '@/components/admin/media-picker';

type Subject = {
  id: string;
  name: string;
};

type Pack = {
  id: string;
  nom: string;
  prix: string;
  duree: string;
  etudiants: number;
  subject_count: number;
  is_active: boolean;
  _raw: Record<string, unknown>;
};

export default function PacksClient({ 
  initialPacks, 
  subjects 
}: { 
  initialPacks: Pack[];
  subjects: Subject[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPack, setEditingPack] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceTnd, setPriceTnd] = useState('');
  const [durationDays, setDurationDays] = useState('365');
  const [isActive, setIsActive] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());

  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  const columns = [
    { accessorKey: 'nom', header: 'Nom du pack' },
    { accessorKey: 'prix', header: 'Prix' },
    { accessorKey: 'duree', header: 'Durée' },
    { 
      accessorKey: 'subject_count', 
      header: 'Matières Incluses',
      cell: (item: Pack) => (
        <span className="font-medium text-navy-900">{item.subject_count} matières</span>
      )
    },
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
    setDurationDays('365');
    setIsActive(true);
    setSelectedSubjects(new Set());
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pack: Pack) => {
    setEditingPack(pack._raw);
    setName((pack._raw.name as string) || '');
    setDescription((pack._raw.description as string) || '');
    setPriceTnd((pack._raw.price_tnd as number)?.toString() || '');
    setDurationDays((pack._raw.duration_days as number)?.toString() || '365');
    setIsActive(pack._raw.is_active as boolean);
    setSelectedSubjects(new Set((pack._raw.subject_ids as string[]) || []));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce pack ?')) {
      await deletePack(id);
    }
  };

  const handleToggleSubject = (subId: string) => {
    const next = new Set(selectedSubjects);
    if (next.has(subId)) {
      next.delete(subId);
    } else {
      next.add(subId);
    }
    setSelectedSubjects(next);
  };

  const handleMediaSelect = (markdownLink: string) => {
    if (!descriptionRef.current) return;
    
    const start = descriptionRef.current.selectionStart;
    const end = descriptionRef.current.selectionEnd;
    
    const newContent = description.substring(0, start) + markdownLink + description.substring(end);
    setDescription(newContent);
    
    setTimeout(() => {
      descriptionRef.current?.focus();
      descriptionRef.current?.setSelectionRange(start + markdownLink.length, start + markdownLink.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        description,
        price_tnd: parseFloat(priceTnd) || 0,
        duration_days: parseInt(durationDays) || 365,
        is_active: isActive,
        subject_ids: Array.from(selectedSubjects)
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
          <p className="text-gray-500 mt-1">Créez et gérez les offres commerciales et leurs accès.</p>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-navy-900">
                {editingPack ? 'Modifier le Pack' : 'Nouveau Pack'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Informations Générales */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Informations Générales</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du pack</label>
                    <Input 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="ex: Pack Annuel, Concours Blanc..."
                    />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (TND)</label>
                    <Input 
                      required 
                      type="number" 
                      step="0.1"
                      min="0"
                      value={priceTnd} 
                      onChange={e => setPriceTnd(e.target.value)} 
                    />
                  </div>
                  
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours)</label>
                    <Input 
                      required 
                      type="number" 
                      min="1"
                      value={durationDays} 
                      onChange={e => setDurationDays(e.target.value)} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Actif (Visible et achetable par les étudiants)</label>
                </div>
              </div>

              {/* Matières Incluses */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Accès & Matières Incluses</h3>
                <p className="text-sm text-gray-500">Cochez les matières que ce pack permet de débloquer.</p>
                
                {subjects.length === 0 ? (
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">Aucune matière existante. Veuillez créer des matières d'abord dans la structure.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-60 overflow-y-auto">
                    {subjects.map(sub => (
                      <div key={sub.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`sub-${sub.id}`}
                          checked={selectedSubjects.has(sub.id)}
                          onChange={() => handleToggleSubject(sub.id)}
                          className="rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                        />
                        <label htmlFor={`sub-${sub.id}`} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                          {sub.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description MDX */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Description (Markdown)</h3>
                  <MediaPicker onSelect={handleMediaSelect} />
                </div>
                <textarea 
                  ref={descriptionRef}
                  className="w-full flex min-h-[160px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm font-mono shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-navy-900 disabled:cursor-not-allowed disabled:opacity-50"
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Décrivez les avantages du pack. (ex: - 10 examens blancs\n- Accès aux résumés)"
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 shrink-0">
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
