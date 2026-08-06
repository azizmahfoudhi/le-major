'use client';

import React from 'react';
import { UploadCloud, Image as ImageIcon, FileText, Link, Trash2, FileCode } from 'lucide-react';
import { Button, Card } from '@/components/ui';

const mockAssets = [
  { id: '1', name: 'graph-micro.svg', type: 'svg', size: '12 KB', date: 'Aujourd\'hui', url: '/assets/graph-micro.svg' },
  { id: '2', name: 'chap1-slides.pdf', type: 'pdf', size: '2.4 MB', date: 'Hier', url: '/assets/chap1-slides.pdf' },
  { id: '3', name: 'formula-sheet.png', type: 'image', size: '840 KB', date: '12 Oct 2023', url: '/assets/formula.png' },
  { id: '4', name: 'logo-ihec.png', type: 'image', size: '120 KB', date: '10 Oct 2023', url: '/assets/logo.png' },
];

export default function ResourceManager() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'svg': return <FileCode className="h-8 w-8 text-orange-500" />;
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />;
      case 'image': return <ImageIcon className="h-8 w-8 text-blue-500" />;
      default: return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Médiathèque</h1>
        <p className="text-gray-500 mt-1">Gérez vos images, PDFs et autres ressources.</p>
      </div>

      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
          <UploadCloud className="h-6 w-6 text-gold-500" />
        </div>
        <p className="text-navy-900 font-medium">Cliquez pour uploader ou glissez-déposez</p>
        <p className="text-sm text-gray-500 mt-1">SVG, PNG, JPG, PDF (max. 10MB)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockAssets.map((asset) => (
          <Card key={asset.id} className="p-4 group">
            <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-3 border border-gray-100">
              {getIcon(asset.type)}
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-navy-900 truncate" title={asset.name}>
                {asset.name}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{asset.size}</span>
                <span>{asset.date}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
                <Link className="h-3 w-3 mr-1.5" />
                Copier l'URL
              </Button>
              <Button variant="outline" size="sm" className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
