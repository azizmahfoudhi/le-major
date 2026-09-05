'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Trash2, Upload, Search, ImageIcon, FileText as FileIcon } from 'lucide-react';
import { Button } from '@/components/ui';
import { listMedia, deleteMedia, uploadMedia, type CloudinaryMedia } from '@/lib/cloudinary/actions';

export default function MediasPage() {
  const [files, setFiles] = useState<CloudinaryMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const media = await listMedia();
      setFiles(media);
    } catch {
      setError('Impossible de charger les fichiers.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDelete = async (publicId: string, name: string) => {
    if (!window.confirm(`Supprimer « ${name} » ? Cette action est irréversible.`)) return;
    setIsDeleting(publicId);
    setError(null);
    const result = await deleteMedia(publicId);
    if (!result.success) {
      setError('Erreur lors de la suppression : ' + result.error);
    } else {
      showSuccess('Fichier supprimé.');
      await loadFiles();
    }
    setIsDeleting(null);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadMedia(formData);
    if (!result.success) {
      setError("Erreur lors de l'import : " + result.error);
    } else {
      showSuccess('Fichier importé.');
      await loadFiles();
    }
    setIsUploading(false);
    e.target.value = '';
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isImage = (file: CloudinaryMedia) =>
    /\.(jpeg|jpg|gif|png|webp|svg)(\?.*)?$/i.test(file.url) || file.url.includes('/image/');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Bibliothèque de Médias</h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? '...' : `${files.length} fichier${files.length !== 1 ? 's' : ''} au total`}
          </p>
        </div>
        <div className="relative">
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
          <Button disabled={isUploading}>
            {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
            {isUploading ? 'Import...' : 'Importer un fichier'}
          </Button>
        </div>
      </div>

      {/* Feedback banners */}
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">⚠️ {error}</div>
      )}
      {success && (
        <div className="p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">✓ {success}</div>
      )}

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-navy-900 animate-spin" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>{searchQuery ? 'Aucun résultat pour cette recherche.' : 'Aucun fichier dans la bibliothèque.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredFiles.map(file => (
            <div
              key={file.publicId}
              className="group relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:border-navy-300 hover:shadow-md transition-all"
            >
              {/* Preview */}
              <div className="aspect-square flex items-center justify-center bg-gray-100">
                {isImage(file) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileIcon className="w-10 h-10 text-gray-400" />
                )}
              </div>

              {/* Name */}
              <div className="p-2 border-t border-gray-100 bg-white">
                <p className="text-xs text-gray-600 truncate" title={file.name}>{file.name}</p>
              </div>

              {/* Delete button */}
              <button
                onClick={() => handleDelete(file.publicId, file.name)}
                disabled={isDeleting === file.publicId}
                className="absolute top-2 right-2 p-1.5 bg-white/90 text-gray-400 hover:text-rose-600 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 shadow-sm border border-gray-200"
                title="Supprimer ce fichier"
              >
                {isDeleting === file.publicId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
