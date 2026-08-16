'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import { ImageIcon, Upload, Loader2, X, Image as ImageIconLucide, Trash2 } from 'lucide-react';
import { uploadMedia, listMedia, deleteMedia, type CloudinaryMedia } from '@/lib/cloudinary/actions';

interface MediaPickerProps {
  onSelect: (markdownLink: string) => void;
}

export default function MediaPicker({ onSelect }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [files, setFiles] = useState<CloudinaryMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const loadFiles = React.useCallback(async () => {
    setIsLoading(true);
    const media = await listMedia();
    setFiles(media);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
    }
  }, [isOpen, loadFiles]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadMedia(formData);
    if (!result.success) {
      alert("Erreur lors de l'upload: " + result.error);
      setIsUploading(false);
      return;
    }

    await loadFiles();
    setIsUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (e: React.MouseEvent, publicId: string) => {
    e.stopPropagation();
    if (!window.confirm('Voulez-vous vraiment supprimer ce fichier ?')) return;

    setIsDeleting(publicId);
    const result = await deleteMedia(publicId);

    if (!result.success) {
      alert('Erreur lors de la suppression: ' + result.error);
      setIsDeleting(null);
      return;
    }

    await loadFiles();
    setIsDeleting(null);
  };

  const handleSelect = (file: CloudinaryMedia) => {
    const isImage = file.url.match(/\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i) || file.url.includes('image');
    const markdown = isImage
      ? `![${file.name}](${file.url})`
      : `[Telecharger ${file.name}](${file.url})`;
    onSelect(markdown);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-gray-600 bg-gray-50 hover:bg-gray-100"
      >
        <ImageIconLucide className="w-4 h-4 mr-2" />
        Ajouter un media
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-navy-900 font-playfair flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-400" />
                Bibliotheque de Medias
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-sm text-gray-500">Selectionnez une image ou importez-en une nouvelle.</p>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button type="button" disabled={isUploading}>
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  {isUploading ? 'Importation...' : 'Importer un fichier'}
                </Button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-navy-900 animate-spin" />
                </div>
              ) : files.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {files.map(file => (
                    <div
                      key={file.publicId}
                      onClick={() => handleSelect(file)}
                      className="group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:border-navy-900 hover:shadow-md transition-all relative aspect-square bg-gray-50 flex items-center justify-center"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => handleDelete(e, file.publicId)}
                        disabled={isDeleting === file.publicId}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-500 hover:text-rose-600 rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-10 shadow-sm"
                        title="Supprimer ce fichier"
                      >
                        {isDeleting === file.publicId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                      <div className="absolute inset-0 bg-navy-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="text-white text-sm font-medium">Inserer</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>Aucun media dans la bibliotheque.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
