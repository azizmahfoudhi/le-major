'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Modal } from '@/components/ui/modal';
import { generateCodes } from '../../actions/codes';
import { KeyRound, Plus, Loader2 } from 'lucide-react';

interface Package {
  id: string;
  name: string;
}

interface CodesClientProps {
  packages: Package[];
}

export default function CodesClient({ packages }: CodesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(packages[0]?.id || '');
  const [quantity, setQuantity] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

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

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Générer des codes
      </Button>

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
              max="100"
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
    </>
  );
}
