import {
  Check,
  CircleDot,
  Signal,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import type {
  TaskFilters as TaskFiltersState,
  TaskPriority,
  TaskStatus,
} from "../types/task.types"

interface TaskFiltersProps {
  filters: TaskFiltersState
  onFiltersChange: (filters: TaskFiltersState) => void
}

const TASK_STATUSES: { value: TaskStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

const TASK_PRIORITIES: { value: TaskPriority | "ALL"; label: string }[] = [
  { value: "ALL", label: "All priorities" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
]

export default function TaskFilters({
  filters,
  onFiltersChange,
}: TaskFiltersProps) {
  const hasActiveFilters = filters.status !== "ALL" || filters.priority !== "ALL"

  const updateFilter = <K extends keyof TaskFiltersState>(
    key: K,
    value: TaskFiltersState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      ...filters,
      status: "ALL",
      priority: "ALL",
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CircleDot className="size-4" />
          Status
        </div>
        <div className="flex flex-wrap gap-2">
          {TASK_STATUSES.map((status) => {
            const active = filters.status === status.value
            return (
              <Button
                key={status.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                onClick={() => updateFilter("status", status.value)}
              >
                {active && <Check className="size-3.5 mr-2" />}
                {status.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Signal className="size-4" />
          Priority
        </div>
        <div className="flex flex-wrap gap-2">
          {TASK_PRIORITIES.map((priority) => {
            const active = filters.priority === priority.value
            return (
              <Button
                key={priority.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                onClick={() => updateFilter("priority", priority.value)}
              >
                {active && <Check className="size-3.5 mr-2" />}
                {priority.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <div className="flex justify-end border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            <X className="size-4 mr-2" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}