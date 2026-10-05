import { Skeleton } from '@/components/ui/skeleton'

/** Placeholder with the shape of the result while extracting. Hidden from assistive technology: the live region says it. */
export function ResultSkeleton() {
  return (
    <div className="space-y-5" aria-hidden="true" data-state="loading">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-9 w-40" />
      <div className="space-y-4">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-28 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-24 shrink-0 sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
