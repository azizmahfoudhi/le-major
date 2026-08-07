'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Layers, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createSeries, updateSeries, deleteSeries } from '../../actions/series';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SeriesClient({ initialSeries, subjects }: { initialSeries: any[]; subjects: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingSeries, setEditingSeries] = useState<any>(null);

  const columns = [
    { accessorKey: 'titre', header: 'Titre de la série' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'exercices', header: 'Nombre d\'exercices' },
    { accessorKey: 'difficulte', header: 'Difficulté' },
    { accessorKey: 'acces', header: 'Accès' }
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    let result;
    if (editingSeries) {
      result = await updateSeries(editingSeries._raw.id, formData);
    } else {
      result = await createSeries(formData);
    }

    if (!result.success) {
      setError(result.error || 'Une erreur est survenue');
      setIsSubmitting(false);
      return;
    }

    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette série ?')) {
      try {
        await deleteSeries(id);
      } catch {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEdit = (series: any) => {
    setEditingSeries(series);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingSeries(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Séries d'Exercices</h1>
          <p className="text-gray-500 mt-1">Gérez les séries (regroupements d'exercices).</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Série
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {initialSeries.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={initialSeries}
            enableSearch={true}
            searchPlaceholder="Rechercher une série..."
            actions={(item) => (
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
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
            <Layers className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucune série n'a été créée.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-navy-900">
                {editingSeries ? 'Modifier la Série' : 'Nouvelle Série'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="series-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium text-navy-900">Titre</label>
                  <Input 
                    id="title" 
                    name="title" 
                    required 
                    defaultValue={editingSeries?._raw.title}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject_id" className="text-sm font-medium text-navy-900">Matière</label>
                  <select 
                    id="subject_id" 
                    name="subject_id" 
                    required
                    defaultValue={editingSeries?._raw.subject_id}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  >
                    <option value="">Sélectionner une matière</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="difficulty" className="text-sm font-medium text-navy-900">Difficulté</label>
                  <select 
                    id="difficulty" 
                    name="difficulty" 
                    required
                    defaultValue={editingSeries?._raw.difficulty || 'easy'}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  >
                    <option value="easy">Facile</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_premium" 
                    name="is_premium"
                    defaultChecked={editingSeries?._raw.is_premium}
                    className="rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                  />
                  <label htmlFor="is_premium" className="text-sm font-medium text-navy-900">
                    Série Premium (réservée aux abonnés)
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" form="series-form" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
