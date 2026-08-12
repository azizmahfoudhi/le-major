'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Save, ArrowLeft, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { createContent, updateContent } from '../../../actions/content';

interface Chapter {
  id: string;
  title: string;
  subjects: { name: string };
}

interface ContentFormProps {
  chapters: Chapter[];
  initialData?: {
    id: string;
    title: string;
    chapter_id: string;
    body: string;
  };
}

export default function ContentForm({ chapters, initialData }: ContentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    let result;
    if (initialData) {
      result = await updateContent(initialData.id, formData);
    } else {
      result = await createContent(formData);
    }
    
    if (result && !result.success) {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  // Group chapters by subject for a better UX in the select
  const grouped: Record<string, Chapter[]> = {};
  chapters.forEach(c => {
    const subjectName = c.subjects?.name || 'Sans matière';
    if (!grouped[subjectName]) grouped[subjectName] = [];
    grouped[subjectName].push(c);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
        <FileText className="w-4 h-4 flex-shrink-0" />
        <span>Ce contenu sera créé en tant que <strong>Fiche de révision (Résumé)</strong> et publié immédiatement.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-navy-900">
            Titre de la fiche
          </label>
          <Input 
            id="title" 
            name="title" 
            placeholder="Ex: Résumé — Les suites arithmétiques" 
            required 
            disabled={isSubmitting}
            defaultValue={initialData?.title || ''}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="chapter_id" className="text-sm font-medium text-navy-900">
            Chapitre associé
          </label>
          <select 
            id="chapter_id"
            name="chapter_id"
            required
            disabled={isSubmitting}
            defaultValue={initialData?.chapter_id || ''}
            className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
          >
            <option value="">Sélectionner un chapitre</option>
            {Object.entries(grouped).map(([subjectName, chaps]) => (
              <optgroup key={subjectName} label={subjectName}>
                {chaps.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="mdx_content" className="text-sm font-medium text-navy-900 flex justify-between">
          <span>Contenu de la fiche (Format MDX)</span>
          <span className="text-gray-400 font-normal">Prend en charge KaTeX ($$...$$)</span>
        </label>
        <textarea 
          id="mdx_content"
          name="mdx_content"
          required
          disabled={isSubmitting}
          defaultValue={initialData?.body || ''}
          className="w-full h-[480px] p-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 font-mono text-sm resize-y"
          placeholder={"# Titre de la fiche\n\n## Section 1\n\nVoici une formule : $$f(x) = x^2$$\n\n- Point clé 1\n- Point clé 2"}
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Link href="/admin/contenus">
          <Button variant="outline" type="button" disabled={isSubmitting}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {initialData ? 'Enregistrer les modifications' : 'Publier la fiche'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
