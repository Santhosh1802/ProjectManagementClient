import { useState } from "react"
import { ArrowDownAZ, ArrowUpAZ, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import SearchInput from "@/components/common/SearchInput"

import type { TaskFilters as TaskFiltersState, TaskView } from "../types/task.types"

import TaskViewSwitcher from "./TaskViewSwitcher"
import TaskFilters from "./TaskFilters"

interface TaskToolbarProps {
  filters: TaskFiltersState
  view: TaskView
  onFiltersChange: (filters: TaskFiltersState) => void
  onViewChange: (view: TaskView) => void
}

export default function TaskToolbar({
  filters,
  view,
  onFiltersChange,
  onViewChange,
}: TaskToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<"filter" | "sort" | null>(null)
  const updateFilter = <K extends keyof TaskFiltersState>(
    key: K,
    value: TaskFiltersState[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const hasFilters = filters.status !== "ALL" || filters.priority !== "ALL"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="min-w-0 flex-1">
          <SearchInput
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            aria-keyshortcuts="/"
            data-page-search=""
          />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter */}
          <details 
            className="relative"
            open={activeDropdown === "filter"}
          >
            <summary 
              className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                setActiveDropdown(activeDropdown === "filter" ? null : "filter")
              }}
            >
              <Filter className="size-4" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  !
                </span>
              )}
            </summary>
            <div className="absolute left-0 sm:left-auto sm:right-0 z-50 mt-2 w-[calc(100vw-2rem)] sm:w-[420px] rounded-xl border bg-popover p-4 text-popover-foreground shadow-lg">
              <TaskFilters filters={filters} onFiltersChange={onFiltersChange} />
            </div>
          </details>

          {/* Sort */}
          <details 
            className="relative"
            open={activeDropdown === "sort"}
          >
            <summary 
              className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                setActiveDropdown(activeDropdown === "sort" ? null : "sort")
              }}
            >
              {filters.sortOrder === "asc" ? (
                <ArrowUpAZ className="size-4" />
              ) : (
                <ArrowDownAZ className="size-4" />
              )}
              <span className="hidden sm:inline">Sort</span>
            </summary>
            <div className="absolute left-0 sm:left-auto sm:right-0 z-50 mt-2 w-[calc(100vw-2rem)] sm:w-64 rounded-xl border bg-popover p-4 shadow-lg">
              <div className="space-y-3">
                <div>
                  <p className="mb-2 text-sm font-medium">Sort by</p>
                  <div className="grid gap-1">
                    <SortButton
                      active={filters.sortBy === "createdAt"}
                      label="Created date"
                      onClick={() => updateFilter("sortBy", "createdAt")}
                    />
                    <SortButton
                      active={filters.sortBy === "updatedAt"}
                      label="Last updated"
                      onClick={() => updateFilter("sortBy", "updatedAt")}
                    />
                    <SortButton
                      active={filters.sortBy === "title"}
                      label="Title"
                      onClick={() => updateFilter("sortBy", "title")}
                    />
                    <SortButton
                      active={filters.sortBy === "dueDate"}
                      label="Due date"
                      onClick={() => updateFilter("sortBy", "dueDate")}
                    />
                    <SortButton
                      active={filters.sortBy === "taskPriority"}
                      label="Priority"
                      onClick={() => updateFilter("sortBy", "taskPriority")}
                    />
                    <SortButton
                      active={filters.sortBy === "taskStatus"}
                      label="Status"
                      onClick={() => updateFilter("sortBy", "taskStatus")}
                    />
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="mb-2 text-sm font-medium">Order</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filters.sortOrder === "asc" ? "secondary" : "outline"}
                      onClick={() => updateFilter("sortOrder", "asc")}
                    >
                      Ascending
                    </Button>
                    <Button
                      size="sm"
                      variant={filters.sortOrder === "desc" ? "secondary" : "outline"}
                      onClick={() => updateFilter("sortOrder", "desc")}
                    >
                      Descending
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* View */}
          <TaskViewSwitcher value={view} onChange={onViewChange} />
        </div>
      </div>
    </div>
  )
}

interface SortButtonProps {
  active: boolean
  label: string
  onClick: () => void
}

function SortButton({ active, label, onClick }: SortButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      className="justify-start"
      size="sm"
      onClick={onClick}
    >
      {label}
    </Button>
  )
}