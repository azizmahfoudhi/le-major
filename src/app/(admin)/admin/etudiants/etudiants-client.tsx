'use client';

import React, { useState } from 'react';
import { Edit, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { updateProfileRole } from '../../actions/etudiants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EtudiantsClient({ initialStudents }: { initialStudents: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingStudent, setEditingStudent] = useState<any>(null);

  const columns = [
    { accessorKey: 'nom', header: 'Nom Complet' },
    { accessorKey: 'role', header: 'Rôle' },
    { accessorKey: 'universite', header: 'Université' },
    { accessorKey: 'formation', header: 'Formation' },
    { accessorKey: 'date', header: 'Inscription' }
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const role = formData.get('role') as string;
    
    const result = await updateProfileRole(editingStudent._raw.id, role);

    if (!result.success) {
      setError(result.error || 'Une erreur est survenue');
      setIsSubmitting(false);
      return;
    }

    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEdit = (student: any) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Étudiants</h1>
          <p className="text-gray-500 mt-1">Gérez les comptes utilisateurs de la plateforme.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {initialStudents.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={initialStudents}
            enableSearch={true}
            searchPlaceholder="Rechercher un étudiant..."
            actions={(item) => (
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                  <Edit className="w-4 h-4 text-gray-500" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Users className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucun étudiant inscrit pour le moment.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-navy-900">
                Gérer le Compte: {editingStudent?.nom}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium text-navy-900">Rôle (Droits d'accès)</label>
                  <select 
                    id="role" 
                    name="role" 
                    required
                    defaultValue={editingStudent?._raw.role || 'student'}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  >
                    <option value="student">Étudiant (Accès normal)</option>
                    <option value="admin">Administrateur (Accès total)</option>
                  </select>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p className="mb-2"><strong>ID:</strong> {editingStudent?._raw.id}</p>
                  <p className="mb-2"><strong>Université:</strong> {editingStudent?.universite}</p>
                  <p><strong>Formation:</strong> {editingStudent?.formation}</p>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" form="student-form" disabled={isSubmitting}>
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enregistrement...</> : 'Enregistrer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
