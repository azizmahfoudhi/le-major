'use client';

import React, { useState, useMemo } from 'react';
import { Plus, FileText, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { deleteContent } from '../../actions/content';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ContentItem = {
  id: string;
  titre: string;
  matiere: string;
  chapitre: string;
  statut: React.ReactNode;
  date: string;
};

export default function ContenusClient({ 
  initialContents 
}: { 
  initialContents: ContentItem[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filterMatiere, setFilterMatiere] = useState('');

  // Get unique matières for the filter dropdown
  const matieres = useMemo(() => {
    const unique = Array.from(new Set(initialContents.map(c => c.matiere))).sort();
    return unique;
  }, [initialContents]);

  // Filter content by selected matière
  const filtered = useMemo(() => {
    if (!filterMatiere) return initialContents;
    return initialContents.filter(c => c.matiere === filterMatiere);
  }, [initialContents, filterMatiere]);

  const columns = [
    { accessorKey: 'titre', header: 'Titre' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'chapitre', header: 'Chapitre' },
    { accessorKey: 'statut', header: 'Statut' },
    { accessorKey: 'date', header: 'Date d\'ajout' }
  ];

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette fiche ?')) {
      setLoadingId(id);
      try {
        await deleteContent(id);
        router.refresh();
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
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Fiches de Révision</h1>
          <p className="text-gray-500 mt-1">Gérez les résumés et fiches par chapitre.</p>
        </div>
        <Link href="/admin/contenus/nouveau">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Fiche
          </Button>
        </Link>
      </div>

      {/* Filter by matière */}
      {matieres.length > 1 && (
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <select
            value={filterMatiere}
            onChange={e => setFilterMatiere(e.target.value)}
            className="h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
          >
            <option value="">Toutes les matières ({initialContents.length})</option>
            {matieres.map(m => (
              <option key={m} value={m}>
                {m} ({initialContents.filter(c => c.matiere === m).length})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {filtered.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={filtered}
            enableSearch={true}
            searchPlaceholder="Rechercher une fiche..."
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
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <p className="mb-4">
              {filterMatiere ? `Aucune fiche pour la matière "${filterMatiere}".` : "Aucune fiche de révision n'a été créée."}
            </p>
            {!filterMatiere && (
              <Link href="/admin/contenus/nouveau">
                <Button><Plus className="w-4 h-4 mr-2" />Créer la première fiche</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
