'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createContent } from '../../../actions/content';

interface Chapter {
  id: string;
  title: string;
  subjects: { name: string };
}

interface ContentFormProps {
  chapters: Chapter[];
}

export default function ContentForm({ chapters }: ContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const result = await createContent(formData);
    
    if (result && !result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // Note: if success, action will redirect
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-navy-900">
            Titre du contenu
          </label>
          <Input 
            id="title" 
            name="title" 
            placeholder="Ex: Les suites arithmétiques" 
            required 
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="chapter_id" className="text-sm font-medium text-navy-900">
            Chapitre
          </label>
          <select 
            id="chapter_id"
            name="chapter_id"
            required
            disabled={isSubmitting}
            className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
          >
            <option value="">Sélectionner un chapitre</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.subjects?.name} - {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-navy-900">
            Type de contenu
          </label>
          <select 
            id="type"
            name="type"
            required
            disabled={isSubmitting}
            className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
          >
            <option value="lesson">Leçon</option>
            <option value="summary">Résumé (Fiche de révision)</option>
            <option value="resource">Ressource Annexe</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="difficulty" className="text-sm font-medium text-navy-900">
            Difficulté
          </label>
          <select 
            id="difficulty"
            name="difficulty"
            required
            disabled={isSubmitting}
            className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
          >
            <option value="easy">Facile</option>
            <option value="intermediate">Intermédiaire</option>
            <option value="hard">Difficile</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="mdx_content" className="text-sm font-medium text-navy-900 flex justify-between">
          <span>Contenu (Format MDX)</span>
          <span className="text-gray-400 font-normal">Prend en charge KaTeX ($$)</span>
        </label>
        <textarea 
          id="mdx_content"
          name="mdx_content"
          required
          disabled={isSubmitting}
          className="w-full h-96 p-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono text-sm resize-y"
          placeholder="# Titre principal&#10;&#10;Voici une formule : $$f(x) = x^2$$"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link href="/admin/contenus">
          <Button variant="outline" type="button" disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="bg-navy-900 hover:bg-navy-900/90">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Publier le contenu
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
