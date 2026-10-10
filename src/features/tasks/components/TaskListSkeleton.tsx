import TaskCardSkeleton from "@/features/tasks/components/TaskCardSkeleton"

interface TaskListSkeletonProps {
  count?: number
}

export default function TaskListSkeleton({
  count = 6,
}: TaskListSkeletonProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <TaskCardSkeleton key={index} />
      ))}
    </div>
  )
}