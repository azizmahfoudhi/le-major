import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Skeleton } from '@/components/ui/skeleton';

interface ReaderProps {
  /** The rendered MDX content (React element from renderMarkdown) */
  children: React.ReactNode;
  /** Subject name for context */
  subjectName: string;
  /** Chapter title */
  chapterTitle: string;
  /** Content title */
  contentTitle: string;
  /** Breadcrumb links */
  breadcrumbs?: Array<{ label: string; href: string }>;
  /** Chapter progress (0-100) */
  progress?: number;
  /** Previous content link */
  prevLink?: { label: string; href: string } | null;
  /** Next content link */
  nextLink?: { label: string; href: string } | null;
  /** Chapter sidebar navigation */
  sidebarItems?: Array<{
    label: string;
    href: string;
    isActive?: boolean;
    isCompleted?: boolean;
  }>;
}

function ReaderSkeleton() {
  return (
    <div className="max-w-reader mx-auto space-y-4 p-8">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-32 w-full mt-6" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
}

export function Reader({
  children,
  subjectName,
  chapterTitle,
  contentTitle,
  breadcrumbs = [],
  progress,
  prevLink,
  nextLink,
  sidebarItems = [],
}: ReaderProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left sidebar — chapter navigation (desktop only) */}
      {sidebarItems.length > 0 && (
        <aside className="hidden lg:block w-64 shrink-0 border-r border-gray-100 bg-white">
          <div className="sticky top-20 p-4 space-y-1 max-h-[calc(100vh-5rem)] overflow-y-auto scrollbar-hide">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {subjectName}
            </div>
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block px-3 py-2 rounded-lg text-sm transition-colors',
                  item.isActive
                    ? 'bg-navy-50 text-navy-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  item.isCompleted && !item.isActive && 'text-gray-400'
                )}
              >
                <div className="flex items-center gap-2">
                  {item.isCompleted && !item.isActive && (
                    <span className="text-emerald-500 text-xs">✓</span>
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      )}

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        {/* Top bar with breadcrumbs and progress */}
        <div className="sticky top-16 z-10 bg-white/95 backdrop-blur border-b border-gray-100">
          <div className="max-w-reader mx-auto px-4 sm:px-8 py-3">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav
                className="flex items-center gap-1.5 text-xs text-gray-400 mb-1"
                aria-label="Fil d'Ariane"
              >
                {breadcrumbs.map((crumb, i) => (
                  <span key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && <span>/</span>}
                    <Link
                      href={crumb.href}
                      className="hover:text-navy-600 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  </span>
                ))}
                <span>/</span>
                <span className="text-gray-600 font-medium truncate">
                  {contentTitle}
                </span>
              </nav>
            )}
            {/* Progress bar */}
            {progress !== undefined && (
              <ProgressBar value={progress} className="h-1" showLabel={false} />
            )}
          </div>
        </div>

        {/* Content */}
        <article className="max-w-reader mx-auto px-4 sm:px-8 py-8">
          {/* Content header */}
          <header className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gold-600 font-medium mb-2">
              <BookOpen className="h-4 w-4" />
              <span>{chapterTitle}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-navy-900 leading-tight">
              {contentTitle}
            </h1>
          </header>

          {/* Rendered Markdown content */}
          <div className="prose-reader">
            <Suspense fallback={<ReaderSkeleton />}>{children}</Suspense>
          </div>
        </article>

        {/* Bottom navigation */}
        <nav className="max-w-reader mx-auto px-4 sm:px-8 pb-12">
          <div className="flex items-center justify-between gap-4 pt-8 border-t border-gray-100">
            {prevLink ? (
              <Link
                href={prevLink.href}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy-700 transition-colors group"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <div>
                  <div className="text-xs text-gray-400">Précédent</div>
                  <div className="font-medium">{prevLink.label}</div>
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextLink ? (
              <Link
                href={nextLink.href}
                className="flex items-center gap-2 text-sm text-navy-700 hover:text-navy-900 transition-colors group text-right"
              >
                <div>
                  <div className="text-xs text-gray-400">Suivant</div>
                  <div className="font-medium">{nextLink.label}</div>
                </div>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ) : (
              <div />
            )}
          </div>
        </nav>
      </main>

      {/* Right sidebar — context/progress (desktop only) */}
      <aside className="hidden xl:block w-56 shrink-0 border-l border-gray-100 bg-white">
        <div className="sticky top-20 p-4 space-y-6">
          {progress !== undefined && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Progression
              </div>
              <ProgressBar value={progress} className="h-2" />
            </div>
          )}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Matière
            </div>
            <div className="text-sm font-medium text-navy-900">
              {subjectName}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Chapitre
            </div>
            <div className="text-sm font-medium text-navy-900">
              {chapterTitle}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
