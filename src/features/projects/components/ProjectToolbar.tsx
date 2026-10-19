import { useState, useEffect, useRef } from "react"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  Filter,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import SearchInput from "@/components/common/SearchInput"

import type {
  ProjectFilters as ProjectFiltersState,
  ProjectSortBy,
  ProjectSortOrder,
  ProjectView,
} from "../types/project.types"

import PageSizeSelector from "@/components/common/PageSizeSelector"
import { ProjectViewSwitcher } from "./ProjectsViewSwitcher"
import { ProjectFilters } from "./ProjectFilters"
import { cn } from "cn"

interface ProjectToolbarProps {
  filters: ProjectFiltersState
  view: ProjectView
  onFiltersChange: (
    filters: ProjectFiltersState
  ) => void
  onViewChange: (
    view: ProjectView
  ) => void
  pageSize?: number
  onPageSizeChange?: (pageSize: number) => void
}

export function ProjectToolbar({
  filters,
  view,
  onFiltersChange,
  onViewChange,
  pageSize,
  onPageSizeChange,
}: ProjectToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<"filter" | "sort" | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Staged sort values
  const [draftSortBy, setDraftSortBy] = useState<ProjectSortBy>(filters.sortBy)
  const [draftSortOrder, setDraftSortOrder] = useState<ProjectSortOrder>(filters.sortOrder)

  useEffect(() => {
    setDraftSortBy(filters.sortBy)
    setDraftSortOrder(filters.sortOrder)
  }, [filters.sortBy, filters.sortOrder])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null)
      }
    }

    if (activeDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown])

  const handleApplySort = () => {
    onFiltersChange({
      ...filters,
      sortBy: draftSortBy,
      sortOrder: draftSortOrder,
    })
    setActiveDropdown(null)
  }

  const handleApplyFilters = (nextFilters: ProjectFiltersState) => {
    onFiltersChange(nextFilters)
    setActiveDropdown(null)
  }

  const hasFilters =
    filters.status !== "ALL" ||
    filters.dueDate !== "ALL" ||
    filters.ownerId !== "ALL"

  return (
    <div className="flex flex-col gap-3" ref={toolbarRef}>
      {/* Search + actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="min-w-0 flex-1">
          <SearchInput
            value={filters.search}
            onChange={(event) =>
              onFiltersChange({
                ...filters,
                search: event.target.value,
              })
            }
            placeholder="Search projects..."
            aria-label="Search projects"
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
              className="flex h-7.5 cursor-pointer list-none items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                setActiveDropdown(activeDropdown === "filter" ? null : "filter")
              }}
            >
              <Filter className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && (
                <span className="flex size-4 items-center justify-center rounded-full text-xs text-primary" title="Filters applied for projects">
                  <Info className="size-3" />
                </span>
              )}
            </summary>

            {/* Mobile backdrop modal / Desktop dropdown */}
            <div 
              className={cn(
                // Mobile: centered modal backdrop
                "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs",
                // Desktop: absolute dropdown
                "sm:absolute sm:inset-auto sm:right-auto sm:left-0 lg:right-auto lg:left-0 sm:mt-2 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
              )}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActiveDropdown(null)
                }
              }}
            >
              <div 
                className="w-full max-w-sm sm:max-w-md sm:w-105 max-h-[85vh] overflow-y-auto rounded-xl border bg-popover p-4 text-popover-foreground shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <ProjectFilters
                  filters={filters}
                  onApplyFilters={handleApplyFilters}
                  onClose={() => setActiveDropdown(null)}
                />
              </div>
            </div>
          </details>

          {/* Sort */}
          <details 
            className="relative" 
            open={activeDropdown === "sort"}
          >
            <summary 
              className="flex h-7.5 cursor-pointer list-none items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                if (activeDropdown !== "sort") {
                  setDraftSortBy(filters.sortBy)
                  setDraftSortOrder(filters.sortOrder)
                }
                setActiveDropdown(activeDropdown === "sort" ? null : "sort")
              }}
            >
              {filters.sortOrder === "asc" ? (
                <ArrowUpAZ className="size-3.5" />
              ) : (
                <ArrowDownAZ className="size-3.5" />
              )}
              <span className="hidden sm:inline">Sort</span>
            </summary>

            {/* Mobile backdrop modal / Desktop dropdown */}
            <div 
              className={cn(
                // Mobile: centered modal backdrop
                "fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs",
                // Desktop: absolute dropdown
                "sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
              )}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setActiveDropdown(null)
                }
              }}
            >
              <div 
                className="w-full max-w-xs sm:w-72 max-h-[85vh] overflow-y-auto rounded-xl border bg-popover p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-3">
                  <div className="border-b pb-2">
                    <p className="text-xs font-semibold">Sort projects</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Sort by</p>
                    <div className="grid gap-1">
                      <SortButton
                        active={draftSortBy === "createdAt"}
                        label="Created date"
                        onClick={() => setDraftSortBy("createdAt")}
                      />
                      <SortButton
                        active={draftSortBy === "updatedAt"}
                        label="Last updated"
                        onClick={() => setDraftSortBy("updatedAt")}
                      />
                      <SortButton
                        active={draftSortBy === "name"}
                        label="Name"
                        onClick={() => setDraftSortBy("name")}
                      />
                      <SortButton
                        active={draftSortBy === "startDate"}
                        label="Start date"
                        onClick={() => setDraftSortBy("startDate")}
                      />
                      <SortButton
                        active={draftSortBy === "dueDate"}
                        label="Due date"
                        onClick={() => setDraftSortBy("dueDate")}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Order</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={draftSortOrder === "asc" ? "secondary" : "outline"}
                        className="h-7 text-xs flex-1"
                        onClick={() => setDraftSortOrder("asc")}
                      >
                        Ascending
                      </Button>
                      <Button
                        size="sm"
                        variant={draftSortOrder === "desc" ? "secondary" : "outline"}
                        className="h-7 text-xs flex-1"
                        onClick={() => setDraftSortOrder("desc")}
                      >
                        Descending
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t pt-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-muted-foreground"
                      onClick={() => setActiveDropdown(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleApplySort}
                    >
                      <Check className="size-3 mr-1" />
                      Apply sort
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Page Size Selector */}
          {pageSize && onPageSizeChange && (
            <PageSizeSelector
              value={pageSize}
              onChange={onPageSizeChange}
              options={[10, 20, 50, 100]}
            />
          )}

          {/* View */}
          <ProjectViewSwitcher
            view={view}
            onViewChange={onViewChange}
          />
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

function SortButton({
  active,
  label,
  onClick,
}: SortButtonProps) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      className="h-7 justify-start text-xs"
      size="sm"
      onClick={onClick}
    >
      {active && <Check className="size-3 mr-1" />}
      {label}
    </Button>
  )
}