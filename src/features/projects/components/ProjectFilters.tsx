import { useState, useEffect } from "react"
import { CalendarClock, Check, CircleDot, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"

import type {
  ProjectFilters as ProjectFiltersState,
  ProjectStatus,
} from "../types/project.types"

interface ProjectFiltersProps {
  filters: ProjectFiltersState
  onApplyFilters: (filters: ProjectFiltersState) => void
  onClose?: () => void
}

const statuses: {
  value: ProjectStatus | "ALL"
  label: string
}[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PLANNING", label: "Planning" },
  { value: "ACTIVE", label: "Active" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
]

const dueDates = [
  { value: "ALL" as const, label: "Any due date" },
  { value: "OVERDUE" as const, label: "Overdue" },
  { value: "DUE_TODAY" as const, label: "Due today" },
  { value: "DUE_THIS_WEEK" as const, label: "Due this week" },
  { value: "DUE_THIS_MONTH" as const, label: "Due this month" },
]

export function ProjectFilters({
  filters,
  onApplyFilters,
  onClose,
}: ProjectFiltersProps) {
  // Staged draft state
  const [draftFilters, setDraftFilters] = useState<ProjectFiltersState>(filters)

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const hasDraftFilters =
    draftFilters.status !== "ALL" ||
    draftFilters.dueDate !== "ALL" ||
    draftFilters.ownerId !== "ALL"

  const updateDraft = <K extends keyof ProjectFiltersState>(
    key: K,
    value: ProjectFiltersState[K]
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
    const cleared: ProjectFiltersState = {
      ...draftFilters,
      status: "ALL",
      ownerId: "ALL",
      dueDate: "ALL",
    }
    setDraftFilters(cleared)
    onApplyFilters(cleared)
    onClose?.()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-xs font-semibold text-foreground">Filter projects</span>
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
          {statuses.map((status) => {
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

      {/* Due date */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CalendarClock className="size-3.5" />
          Due date
        </div>

        <div className="flex flex-wrap gap-1.5">
          {dueDates.map((dueDate) => {
            const active = draftFilters.dueDate === dueDate.value
            return (
              <Button
                key={dueDate.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                className="h-7 text-xs"
                onClick={() => updateDraft("dueDate", dueDate.value)}
              >
                {active && <Check className="size-3 mr-1" />}
                {dueDate.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Owner hint */}
      {draftFilters.scope !== "OWNED" && (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <UserRound className="size-3.5" />
            Owner
          </div>
          <p className="text-[11px] text-muted-foreground">
            Filtered according to selected scope.
          </p>
        </div>
      )}

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