import { Skeleton } from '@/components/ui/skeleton';

export default function AccueilLoading() {
  return (
    <div className="max-w-content mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Welcome header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Continue card skeleton */}
      <div className="rounded-card border border-gray-100 bg-white p-6">
        <Skeleton className="h-5 w-32 mb-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-2" />
        <Skeleton className="h-2 w-full mt-4 rounded-full" />
      </div>

      {/* Subject cards grid skeleton */}
      <div>
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-card border border-gray-100 bg-white p-5 space-y-3"
            >
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
