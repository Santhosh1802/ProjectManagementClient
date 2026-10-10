import {
  CalendarClock,
  Check,
  CircleDot,
  UserRound,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import type {
  ProjectFilters as ProjectFiltersState,
  ProjectStatus,
} from "../types/project.types"

interface ProjectFiltersProps {
  filters: ProjectFiltersState
  onFiltersChange: (
    filters: ProjectFiltersState
  ) => void
}

const statuses: {
  value: ProjectStatus | "ALL"
  label: string
}[] = [
  {
    value: "ALL",
    label: "All statuses",
  },
  {
    value: "PLANNING",
    label: "Planning",
  },
  {
    value: "ACTIVE",
    label: "Active",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "ARCHIVED",
    label: "Archived",
  },
]

const dueDates = [
  {
    value: "ALL" as const,
    label: "Any due date",
  },
  {
    value: "OVERDUE" as const,
    label: "Overdue",
  },
  {
    value: "DUE_TODAY" as const,
    label: "Due today",
  },
  {
    value: "DUE_THIS_WEEK" as const,
    label: "Due this week",
  },
  {
    value: "DUE_THIS_MONTH" as const,
    label: "Due this month",
  },
]

export function ProjectFilters({
  filters,
  onFiltersChange,
}: ProjectFiltersProps) {
  const hasActiveFilters =
    filters.status !== "ALL" ||
    filters.dueDate !== "ALL" ||
    filters.ownerId !== "ALL"

  const updateFilter = <K extends keyof ProjectFiltersState>(
    key: K,
    value: ProjectFiltersState[K]
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
      ownerId: "ALL",
      dueDate: "ALL",
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
          {statuses.map((status) => {
            const active =
              filters.status === status.value

            return (
              <Button
                key={status.value}
                type="button"
                size="sm"
                variant={
                  active
                    ? "secondary"
                    : "outline"
                }
                onClick={() =>
                  updateFilter(
                    "status",
                    status.value
                  )
                }
              >
                {active && (
                  <Check className="size-3.5" />
                )}

                {status.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Due date */}

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarClock className="size-4" />
          Due date
        </div>

        <div className="flex flex-wrap gap-2">
          {dueDates.map((dueDate) => {
            const active =
              filters.dueDate === dueDate.value

            return (
              <Button
                key={dueDate.value}
                type="button"
                size="sm"
                variant={
                  active
                    ? "secondary"
                    : "outline"
                }
                onClick={() =>
                  updateFilter(
                    "dueDate",
                    dueDate.value
                  )
                }
              >
                {active && (
                  <Check className="size-3.5" />
                )}

                {dueDate.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Owner */}

      {filters.scope !== "OWNED" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserRound className="size-4" />
            Owner
          </div>

          <p className="text-xs text-muted-foreground">
            Owner selection will be populated from
            your project data.
          </p>
        </div>
      )}

      {/* Clear */}

      {hasActiveFilters && (
        <div className="flex justify-end border-t pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            <X className="size-4" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}