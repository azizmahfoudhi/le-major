'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight } from 'lucide-react';
import { markContentComplete } from '../actions/progress';
import { useRouter } from 'next/navigation';

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

  const handleComplete = () => {
    startTransition(async () => {
      try {
        await markContentComplete(contentId, `/matieres/${slug}/${chapterSlug}`);
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
    <Button 
      onClick={handleComplete} 
      disabled={isPending || isCompleted} 
      className="ml-auto"
      variant={isCompleted ? "secondary" : "primary"}
    >
      {isPending ? 'Enregistrement...' : isCompleted ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Déjà lu
        </>
      ) : nextContentId ? (
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
