'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight } from 'lucide-react';
import { markChapterComplete } from '../actions/progress';
import { useRouter } from 'next/navigation';

interface CompleteButtonProps {
  chapterId: string;
  nextContentId?: string | null;
  slug: string;
  chapterSlug: string;
  title?: string;
}

export function CompleteButton({ chapterId, nextContentId, slug, chapterSlug, title }: CompleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleComplete = () => {
    startTransition(async () => {
      try {
        await markChapterComplete(chapterId, `/matieres/${slug}/${chapterSlug}`);
        if (nextContentId) {
          router.push(`/matieres/${slug}/${chapterSlug}/cours/${nextContentId}`);
        } else {
          router.push(`/matieres/${slug}/${chapterSlug}`);
        }
      } catch (error) {
        console.error(error);
        alert("Une erreur s'est produite lors de la sauvegarde.");
      }
    });
  };

  return (
    <Button onClick={handleComplete} disabled={isPending} className="ml-auto">
      {isPending ? 'Enregistrement...' : nextContentId ? (
        <>
          {title || 'Leçon suivante'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </>
      ) : (
        <>
          <Check className="w-4 h-4 mr-2" />
          Terminer le chapitre
        </>
      )}
    </Button>
  );
}
