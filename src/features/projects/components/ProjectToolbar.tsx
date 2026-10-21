import { useState, useEffect } from "react"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  Filter,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
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
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [sortModalOpen, setSortModalOpen] = useState(false)

  // Staged sort values
  const [draftSortBy, setDraftSortBy] = useState<ProjectSortBy>(filters.sortBy)
  const [draftSortOrder, setDraftSortOrder] = useState<ProjectSortOrder>(filters.sortOrder)

  useEffect(() => {
    setDraftSortBy(filters.sortBy)
    setDraftSortOrder(filters.sortOrder)
  }, [filters.sortBy, filters.sortOrder])

  const handleOpenSortModal = () => {
    setDraftSortBy(filters.sortBy)
    setDraftSortOrder(filters.sortOrder)
    setSortModalOpen(true)
  }

  const handleApplySort = () => {
    onFiltersChange({
      ...filters,
      sortBy: draftSortBy,
      sortOrder: draftSortOrder,
    })
    setSortModalOpen(false)
  }

  const handleApplyFilters = (nextFilters: ProjectFiltersState) => {
    onFiltersChange(nextFilters)
    setFilterModalOpen(false)
  }

  const hasFilters =
    filters.status !== "ALL" ||
    filters.dueDate !== "ALL" ||
    filters.ownerId !== "ALL"

  return (
    <div className="flex flex-col gap-3">
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
          {/* Filter Trigger Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => setFilterModalOpen(true)}
          >
            <Filter className="size-3.5 text-muted-foreground" />
            <span>Filters</span>
            {hasFilters && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold" title="Filters applied">
                <Info className="size-3" />
              </span>
            )}
          </Button>

          {/* Sort Trigger Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={handleOpenSortModal}
          >
            {filters.sortOrder === "asc" ? (
              <ArrowUpAZ className="size-3.5 text-muted-foreground" />
            ) : (
              <ArrowDownAZ className="size-3.5 text-muted-foreground" />
            )}
            <span>Sort</span>
          </Button>

          {/* Page Size Selector */}
          {pageSize && onPageSizeChange && (
            <PageSizeSelector
              value={pageSize}
              onChange={onPageSizeChange}
              options={[10, 20, 50, 100]}
            />
          )}

          {/* View Switcher */}
          <ProjectViewSwitcher
            view={view}
            onViewChange={onViewChange}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* PROJECT FILTERS MODAL DIALOG                                 */}
      {/* ============================================================ */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Filter projects</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Filter your project workspace by status, timeline, or owner.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <ProjectFilters
              filters={filters}
              onApplyFilters={handleApplyFilters}
              onClose={() => setFilterModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* PROJECT SORT MODAL DIALOG                                    */}
      {/* ============================================================ */}
      <Dialog open={sortModalOpen} onOpenChange={setSortModalOpen}>
        <DialogContent className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Sort projects</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose the sorting field and direction for project list.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">Sort by</p>
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
                  label="Project name"
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
              <p className="mb-2 text-xs font-medium text-foreground">Direction</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  type="button"
                  variant={draftSortOrder === "asc" ? "secondary" : "outline"}
                  className="h-8 text-xs font-medium"
                  onClick={() => setDraftSortOrder("asc")}
                >
                  {draftSortOrder === "asc" && <Check className="size-3 mr-1 text-primary" />}
                  Ascending
                </Button>
                <Button
                  size="sm"
                  type="button"
                  variant={draftSortOrder === "desc" ? "secondary" : "outline"}
                  className="h-8 text-xs font-medium"
                  onClick={() => setDraftSortOrder("desc")}
                >
                  {draftSortOrder === "desc" && <Check className="size-3 mr-1 text-primary" />}
                  Descending
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSortModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApplySort}
            >
              <Check className="size-3.5 mr-1" />
              Apply sort
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      className="h-8 justify-start text-xs font-medium"
      size="sm"
      onClick={onClick}
    >
      {active && <Check className="size-3 mr-1.5 text-primary" />}
      {label}
    </Button>
  )
}