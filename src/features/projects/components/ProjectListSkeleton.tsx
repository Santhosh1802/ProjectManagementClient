import { Skeleton } from "@/components/ui/skeleton"

export function ProjectListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border bg-card"
        >
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
            {/* Project */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-xl" />

              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
            </div>

            {/* Status */}
            <Skeleton className="h-5 w-20 rounded-md" />

            {/* Owner */}
            <div className="flex items-center gap-2 lg:min-w-32">
              <Skeleton className="size-4 rounded-full" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* Due date */}
            <div className="flex items-center gap-2 lg:min-w-28">
              <Skeleton className="size-4" />
              <Skeleton className="h-3 w-20" />
            </div>

            {/* Updated */}
            <div className="hidden items-center gap-2 xl:flex">
              <Skeleton className="size-3.5" />
              <Skeleton className="h-3 w-16" />
            </div>

            {/* Action */}
            <Skeleton className="size-8 shrink-0 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}