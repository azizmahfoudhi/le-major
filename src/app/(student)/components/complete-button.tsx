'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight } from 'lucide-react';
import { markContentComplete } from '../actions/progress';
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

  const handleMarkDone = () => {
    startTransition(async () => {
      try {
        await markContentComplete(contentId, `/matieres/${slug}/${chapterSlug}`);
        router.refresh();
      } catch (error) {
        console.error(error);
        alert("Une erreur s'est produite lors de la sauvegarde.");
      }
    });
  };

  return (
    <div className="ml-auto flex items-center gap-3">
      {/* Mark as done button — independent of navigation */}
      {!isCompleted ? (
        <Button
          onClick={handleMarkDone}
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
      ) : (
        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-md">
          <Check className="w-4 h-4" />
          Lu
        </span>
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
