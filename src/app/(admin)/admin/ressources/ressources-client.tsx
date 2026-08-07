'use client';

import React, { useState } from 'react';
import { Plus, FolderOpen, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { deleteContent } from '../../actions/content';
import Link from 'next/link';

type ResourceItem = {
  id: string;
  titre: string;
  matiere: string;
  chapitre: string;
  statut: React.ReactNode;
  date: string;
};

export default function RessourcesClient({ 
  initialResources 
}: { 
  initialResources: ResourceItem[];
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const columns = [
    { accessorKey: 'titre', header: 'Titre de la ressource' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'chapitre', header: 'Chapitre' },
    { accessorKey: 'statut', header: 'Statut' },
    { accessorKey: 'date', header: 'Date d\'ajout' }
  ];

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      setLoadingId(id);
      try {
        await deleteContent(id);
      } catch {
        alert('Erreur lors de la suppression.');
      } finally {
        setLoadingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Ressources Annexes</h1>
          <p className="text-gray-500 mt-1">Gérez les PDFs, documents et liens externes.</p>
        </div>
        <Link href="/admin/contenus/nouveau">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Ressource
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {initialResources.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={initialResources}
            enableSearch={true}
            searchPlaceholder="Rechercher une ressource..."
            actions={(item) => (
              <div className="flex justify-end gap-2">
                <Link href={`/admin/contenus/${item.id}/modifier`}>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 text-gray-500" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDelete(item.id)}
                  disabled={loadingId === item.id}
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucune ressource n'a été créée.</p>
          </div>
        )}
      </div>
    </div>
  );
}
