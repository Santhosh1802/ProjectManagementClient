import { ClipboardList, Plus, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"
import EmptyState from "@/components/common/EmptyState"

interface TaskEmptyStateProps {
  filtered?: boolean
  onCreate?: () => void
  onClearFilters?: () => void
}

export default function TaskEmptyState({
  filtered = false,
  onCreate,
  onClearFilters,
}: TaskEmptyStateProps) {
  if (filtered) {
    return (
      <EmptyState
        title="No tasks found"
        description="No tasks match your current search or filters. Try changing your filters or search for something else."
        icon={SearchX}
        action={
          onClearFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={onClearFilters}
            >
              Clear filters
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <EmptyState
      title="No tasks yet"
      description="Get started by creating your first task. You can assign it to a project member and set its priority and due date."
      icon={ClipboardList}
      action={
        onCreate ? (
          <Button type="button" onClick={onCreate}>
            <Plus className="mr-2 size-4" />
            Create task
          </Button>
        ) : undefined
      }
    />
  )
}