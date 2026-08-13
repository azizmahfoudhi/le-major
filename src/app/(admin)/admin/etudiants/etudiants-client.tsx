'use client';

import React, { useState } from 'react';
import { Edit, Users, Loader2, Download, PackagePlus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { updateProfileRole, grantPackageToStudent, revokePackageFromStudent } from '../../actions/etudiants';

interface Package {
  id: string;
  name: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EtudiantsClient({ initialStudents, packages }: { initialStudents: any[], packages: Package[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingStudent, setEditingStudent] = useState<any>(null);
  
  // Package granting state
  const [selectedPackageToGrant, setSelectedPackageToGrant] = useState(packages[0]?.id || '');
  const [isGranting, setIsGranting] = useState(false);

  const columns = [
    { accessorKey: 'nom', header: 'Nom Complet' },
    { accessorKey: 'role', header: 'Rôle' },
    { accessorKey: 'universite', header: 'Université' },
    { accessorKey: 'formation', header: 'Formation' },
    { accessorKey: 'date', header: 'Inscription' }
  ];

  const handleSubmitRole = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const handleGrantPackage = async () => {
    if (!selectedPackageToGrant || !editingStudent) return;
    setIsGranting(true);
    setError('');
    
    const result = await grantPackageToStudent(editingStudent._raw.id, selectedPackageToGrant);
    
    if (!result.success) {
      setError(result.error || 'Erreur lors de l\'attribution du pack.');
    } else {
      // Force close to refresh data, or we could mutate state locally. Let's close it to keep it simple.
      setIsModalOpen(false);
    }
    setIsGranting(false);
  };

  const handleRevokePackage = async (activationId: string) => {
    if (confirm('Êtes-vous sûr de vouloir révoquer ce pack pour cet étudiant ?')) {
      setError('');
      const result = await revokePackageFromStudent(activationId);
      if (!result.success) {
        setError(result.error || 'Erreur lors de la révocation.');
      } else {
        setIsModalOpen(false);
      }
    }
  };

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nom,Role,Universite,Formation,Date_Inscription\n"
      + initialStudents.map(s => `"${s.nom}",${s._raw.role},"${s.universite}","${s.formation}",${s.date}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `etudiants_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openEdit = (student: any) => {
    setEditingStudent(student);
    setIsModalOpen(true);
    setError('');
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Étudiants</h1>
          <p className="text-gray-500 mt-1">Gérez les comptes utilisateurs, leurs rôles et leurs accès.</p>
        </div>
        <Button variant="outline" onClick={exportToCSV} disabled={initialStudents.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Exporter CSV
        </Button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-navy-900">
                Gérer le Compte: {editingStudent?.nom}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Rôle et Infos de base */}
              <form id="student-form" onSubmit={handleSubmitRole} className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
                  <p className="mb-2"><strong>Email/ID:</strong> {editingStudent?._raw.id}</p>
                  <p className="mb-2"><strong>Université:</strong> {editingStudent?.universite}</p>
                  <p><strong>Formation:</strong> {editingStudent?.formation}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium text-navy-900">Rôle de l'utilisateur</label>
                  <select 
                    id="role" 
                    name="role" 
                    required
                    defaultValue={editingStudent?._raw.role || 'student'}
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                  >
                    <option value="student">Étudiant (Accès normal)</option>
                    <option value="admin">Administrateur (Accès total au back-office)</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting} variant="outline">
                    {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mise à jour...</> : 'Mettre à jour le rôle'}
                  </Button>
                </div>
              </form>

              {/* Accès et Packs */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-navy-900">Accès et Packs de l'étudiant</h3>
                
                {/* Liste des accès actifs */}
                <div className="space-y-2">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {editingStudent?._raw.student_activations?.filter((a: any) => a.is_active).length > 0 ? (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    editingStudent._raw.student_activations.filter((a: any) => a.is_active).map((activation: any) => (
                      <div key={activation.id} className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <div>
                          <p className="font-medium text-emerald-900">{activation.packages?.name || 'Pack Inconnu'}</p>
                          <p className="text-xs text-emerald-600">Jusqu'au {new Date(activation.end_date).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRevokePackage(activation.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Révoquer cet accès"
                        >
                          <ShieldAlert className="w-4 h-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">Cet étudiant n'a aucun pack actif actuellement.</p>
                  )}
                </div>

                {/* Ajout manuel d'un pack */}
                <div className="flex gap-2 items-end mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-medium text-gray-700">Débloquer un pack manuellement</label>
                    <select
                      className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
                      value={selectedPackageToGrant}
                      onChange={(e) => setSelectedPackageToGrant(e.target.value)}
                    >
                      {packages.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={handleGrantPackage} disabled={isGranting || packages.length === 0}>
                    {isGranting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackagePlus className="w-4 h-4 mr-2" />}
                    Débloquer
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Idéal si l'étudiant a payé en espèces ou par virement bancaire.</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0 bg-gray-50">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Fermer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
