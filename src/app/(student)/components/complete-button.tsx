'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, RotateCcw } from 'lucide-react';
import { toggleContentComplete } from '../actions/progress';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CompleteButtonProps {
  contentId: string;
  nextContentId?: string | null;
  slug: string;
  chapterSlug: string;
  title?: string;
  isCompleted?: boolean;
}

export function CompleteButton({ contentId, nextContentId, slug, chapterSlug, title, isCompleted }: CompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    startTransition(async () => {
      try {
        await toggleContentComplete(contentId, !!isCompleted);
        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Une erreur s'est produite lors de la sauvegarde.");
      }
    });
  };

  return (
    <div className="ml-auto flex items-center gap-3">
      {/* Toggle done button */}
      {isCompleted ? (
        <Button
          onClick={handleToggle}
          disabled={isPending}
          variant="secondary"
          className="text-gray-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 transition-colors group"
        >
          {isPending ? (
            'Mise à jour...'
          ) : (
            <>
              <Check className="w-4 h-4 mr-2 text-emerald-500 group-hover:hidden" />
              <RotateCcw className="w-4 h-4 mr-2 hidden group-hover:block text-rose-500" />
              <span className="group-hover:hidden">Lu</span>
              <span className="hidden group-hover:inline">Marquer non lu</span>
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={handleToggle}
          disabled={isPending}
          variant="outline"
          className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
        >
          {isPending ? (
            'Enregistrement...'
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Marquer comme lu
            </>
          )}
        </Button>
      )}

      {/* Navigation button — just redirects, no save */}
      {nextContentId ? (
        <Link href={`/matieres/${slug}/${chapterSlug}/cours/${nextContentId}`}>
          <Button variant="primary">
            {title || 'Suivant'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      ) : (
        <Link href={`/matieres/${slug}/${chapterSlug}`}>
          <Button variant="outline">
            Retour au chapitre
          </Button>
        </Link>
      )}
    </div>
  );
}
