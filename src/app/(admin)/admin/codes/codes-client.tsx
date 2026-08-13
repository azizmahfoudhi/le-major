'use client';

import { useState } from 'react';
import { Button, Input, Badge } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { generateCodes, deleteCode } from '../../actions/codes';
import { KeyRound, Plus, Loader2, Trash2, Download } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';

interface Package {
  id: string;
  name: string;
}

interface CodeItem {
  id: string;
  code_raw: string;
  code: React.ReactNode;
  pack: string;
  statut_raw: string;
  statut: React.ReactNode;
  date: string;
}

interface CodesClientProps {
  packages: Package[];
  codes: CodeItem[];
}

export default function CodesClient({ packages, codes }: CodesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(packages[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const columns = [
    { accessorKey: 'code', header: 'Code d\'activation' },
    { accessorKey: 'pack', header: 'Package lié' },
    { accessorKey: 'statut', header: 'Statut' },
    { accessorKey: 'date', header: 'Créé le' },
  ];

  const handleGenerate = async () => {
    if (!selectedPackage || quantity <= 0) return;
    
    setIsGenerating(true);
    const result = await generateCodes(selectedPackage, quantity);
    setIsGenerating(false);
    
    if (result.success) {
      setIsModalOpen(false);
    } else {
      alert('Erreur: ' + result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce code ? S\'il a déjà été imprimé, il ne fonctionnera plus.')) {
      try {
        await deleteCode(id);
      } catch (e) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Code,Package,Statut,Date\n"
      + codes.map(c => `${c.code_raw},"${c.pack}",${c.statut_raw},${c.date}`).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `codes_activation_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Codes d'Activation</h1>
          <p className="text-gray-500 mt-1">Générez et gérez les codes d'accès pour les étudiants.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={codes.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Générer des codes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {codes.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={codes}
            enableSearch={true}
            searchPlaceholder="Rechercher un code..."
            actions={(item: CodeItem) => (
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <KeyRound className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucun code d'activation n'a été généré.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isGenerating && setIsModalOpen(false)}
        title="Générer des codes d'activation"
      >
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Package à débloquer
            </label>
            <select
              className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 focus:border-transparent text-sm"
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              disabled={isGenerating}
            >
              {packages.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité
            </label>
            <Input
              type="number"
              min="1"
              max="500"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              disabled={isGenerating}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsModalOpen(false)}
              disabled={isGenerating}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || packages.length === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Générer
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
