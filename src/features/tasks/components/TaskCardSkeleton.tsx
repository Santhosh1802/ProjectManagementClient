// features/tasks/components/TaskCardSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton"

export default function TaskCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-xl border bg-card text-card-foreground shadow-sm">
      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          <Skeleton className="size-8 rounded-md" />
        </div>

        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-2/5" />
      </div>

      <div className="flex-1 space-y-4 px-6 pb-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-3/5" />
        </div>

        <div className="h-px w-full bg-border" />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 shrink-0 rounded-full" />

            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="size-7 shrink-0 rounded-full" />

            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
        <div className="flex min-w-0 items-center gap-2">
          <Skeleton className="size-7 shrink-0 rounded-full" />

          <div className="min-w-0 space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}