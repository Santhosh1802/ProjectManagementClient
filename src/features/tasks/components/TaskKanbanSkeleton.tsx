import { Skeleton } from "@/components/ui/skeleton"

interface TaskKanbanSkeletonProps {
  columnsCount?: number
  cardsPerColumn?: number
}

export default function TaskKanbanSkeleton({
  columnsCount = 4,
  cardsPerColumn = 3,
}: TaskKanbanSkeletonProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-start">
        {Array.from({ length: columnsCount }).map((_, colIndex) => (
          <div
            key={colIndex}
            className="flex flex-col rounded-2xl border border-border/80 border-t-4 border-t-muted bg-muted/40 p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-6 rounded-full" />
              </div>
              <Skeleton className="size-6 rounded-md" />
            </div>

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2.5">
              {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
                <div
                  key={cardIndex}
                  className="flex flex-col gap-2.5 rounded-xl border bg-card p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24 rounded-md" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex items-center justify-between border-t pt-2.5">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="size-5 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
