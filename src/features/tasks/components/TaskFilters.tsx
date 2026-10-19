import { useState, useEffect } from "react"
import { Check, CircleDot, Signal } from "lucide-react"

import { Button } from "@/components/ui/button"

import type {
  TaskFilters as TaskFiltersState,
  TaskPriority,
  TaskStatus,
} from "../types/task.types"

interface TaskFiltersProps {
  filters: TaskFiltersState
  onApplyFilters: (filters: TaskFiltersState) => void
  onClose?: () => void
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
  onApplyFilters,
  onClose,
}: TaskFiltersProps) {
  // Staged draft state until user clicks Apply
  const [draftFilters, setDraftFilters] = useState<TaskFiltersState>(filters)

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const hasDraftFilters =
    draftFilters.status !== "ALL" ||
    draftFilters.priority !== "ALL"

  const updateDraft = <K extends keyof TaskFiltersState>(
    key: K,
    value: TaskFiltersState[K]
  ) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleApply = () => {
    onApplyFilters(draftFilters)
    onClose?.()
  }

  const handleReset = () => {
    const cleared: TaskFiltersState = {
      ...draftFilters,
      status: "ALL",
      priority: "ALL",
    }
    setDraftFilters(cleared)
    onApplyFilters(cleared)
    onClose?.()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-xs font-semibold text-foreground">Filter tasks</span>
        {hasDraftFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CircleDot className="size-3.5" />
          Status
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TASK_STATUSES.map((status) => {
            const active = draftFilters.status === status.value
            return (
              <Button
                key={status.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                className="h-7 text-xs"
                onClick={() => updateDraft("status", status.value)}
              >
                {active && <Check className="size-3 mr-1" />}
                {status.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Signal className="size-3.5" />
          Priority
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TASK_PRIORITIES.map((priority) => {
            const active = draftFilters.priority === priority.value
            return (
              <Button
                key={priority.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                className="h-7 text-xs"
                onClick={() => updateDraft("priority", priority.value)}
              >
                {active && <Check className="size-3 mr-1" />}
                {priority.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Footer / Apply Action */}
      <div className="flex items-center justify-end gap-2 border-t pt-3">
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          className="h-7 text-xs"
          onClick={handleApply}
        >
          <Check className="size-3 mr-1" />
          Apply filters
        </Button>
      </div>
    </div>
  )
}