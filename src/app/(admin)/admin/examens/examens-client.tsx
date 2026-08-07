'use client';

import React, { useState } from 'react';
import { Plus, Edit, Trash2, ClipboardList, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createExam, updateExam, deleteExam } from '../../actions/examens';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ExamensClient({ initialExams, subjects }: { initialExams: any[]; subjects: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingExam, setEditingExam] = useState<any>(null);

  const columns = [
    { accessorKey: 'titre', header: 'Titre de l\'examen' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'duree', header: 'Durée' },
    { accessorKey: 'statut', header: 'Statut' },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    
    let result;
    if (editingExam) {
      result = await updateExam(editingExam._raw.id, formData);
    } else {
      result = await createExam(formData);
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      try {
        await deleteExam(id);
      } catch {
        alert('Erreur lors de la suppression.');
      }
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEdit = (exam: any) => {
    setEditingExam(exam);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingExam(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Gestion des Examens</h1>
          <p className="text-gray-500 mt-1">Créez et gérez les examens blancs et sujets de révision.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Examen
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {initialExams.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={initialExams}
            enableSearch={true}
            searchPlaceholder="Rechercher un examen..."
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
            <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucun examen n'a été créé.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-navy-900">
                {editingExam ? 'Modifier l\'Examen' : 'Nouvel Examen'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="exam-form" onSubmit={handleSubmit} className="space-y-4">
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
                    defaultValue={editingExam?._raw.title}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject_id" className="text-sm font-medium text-navy-900">Matière</label>
                  <select 
                    id="subject_id" 
                    name="subject_id" 
                    required
                    defaultValue={editingExam?._raw.subject_id}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  >
                    <option value="">Sélectionner une matière</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="duration_minutes" className="text-sm font-medium text-navy-900">Durée (minutes)</label>
                  <Input 
                    id="duration_minutes" 
                    name="duration_minutes" 
                    type="number"
                    min="1"
                    required 
                    defaultValue={editingExam?._raw.duration_minutes || 120}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium text-navy-900">Statut</label>
                  <select 
                    id="status" 
                    name="status" 
                    required
                    defaultValue={editingExam?._raw.status || 'draft'}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_mock_exam" 
                    name="is_mock_exam"
                    defaultChecked={editingExam?._raw.is_mock_exam}
                    className="rounded border-gray-300 text-navy-900 focus:ring-navy-900"
                  />
                  <label htmlFor="is_mock_exam" className="text-sm font-medium text-navy-900">
                    S'agit-il d'un Examen Blanc ?
                  </label>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" form="exam-form" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
