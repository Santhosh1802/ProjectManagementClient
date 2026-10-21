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
import PageSizeSelector from "@/components/common/PageSizeSelector"
import UserViewSwitcher from "./UserViewSwitcher"
import UserFilters, { type UserFiltersState } from "./UserFilters"

import type {
  SortField,
  SortOrder,
  UserRole,
  UserStatus,
  UserView,
  VerificationStatus,
} from "../types/user.types"

interface UserToolbarProps {
  keyword: string
  role: UserRole | "all"
  status: UserStatus
  verification: VerificationStatus
  sortBy: SortField
  sortOrder: SortOrder
  view: UserView
  onKeywordChange: (keyword: string) => void
  onApplyFilters: (filters: UserFiltersState) => void
  onApplySort: (sort: { sortBy: SortField; sortOrder: SortOrder }) => void
  onViewChange: (view: UserView) => void
  pageSize?: number
  onPageSizeChange?: (pageSize: number) => void
}

export default function UserToolbar({
  keyword,
  role,
  status,
  verification,
  sortBy,
  sortOrder,
  view,
  onKeywordChange,
  onApplyFilters,
  onApplySort,
  onViewChange,
  pageSize,
  onPageSizeChange,
}: UserToolbarProps) {
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [sortModalOpen, setSortModalOpen] = useState(false)

  // Staged sort state
  const [draftSortBy, setDraftSortBy] = useState<SortField>(sortBy)
  const [draftSortOrder, setDraftSortOrder] = useState<SortOrder>(sortOrder)

  useEffect(() => {
    setDraftSortBy(sortBy)
    setDraftSortOrder(sortOrder)
  }, [sortBy, sortOrder])

  const hasFilters = role !== "all" || status !== "all" || verification !== "all"

  const handleOpenSortModal = () => {
    setDraftSortBy(sortBy)
    setDraftSortOrder(sortOrder)
    setSortModalOpen(true)
  }

  const handleApplySort = () => {
    onApplySort({
      sortBy: draftSortBy,
      sortOrder: draftSortOrder,
    })
    setSortModalOpen(false)
  }

  const handleApplyFilters = (appliedFilters: UserFiltersState) => {
    onApplyFilters(appliedFilters)
    setFilterModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Search + actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="min-w-0 flex-1">
          <SearchInput
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Search users by name or email..."
            aria-label="Search users"
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
              <span className="flex size-4 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold" title="Filters active">
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
            {sortOrder === "asc" ? (
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
          <UserViewSwitcher value={view} onChange={onViewChange} />
        </div>
      </div>

      {/* ============================================================ */}
      {/* USER FILTERS MODAL DIALOG                                    */}
      {/* ============================================================ */}
      <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
        <DialogContent className="w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Filter users</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Filter user accounts by role, account status, and email verification.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <UserFilters
              filters={{ role, status, verification }}
              onApplyFilters={handleApplyFilters}
              onClose={() => setFilterModalOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* USER SORT MODAL DIALOG                                       */}
      {/* ============================================================ */}
      <Dialog open={sortModalOpen} onOpenChange={setSortModalOpen}>
        <DialogContent className="w-full sm:max-w-sm max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Sort users</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select the ordering field and direction for user accounts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <p className="mb-2 text-xs font-medium text-foreground">Sort by</p>
              <div className="grid gap-1">
                <SortButton
                  active={draftSortBy === "createdAt"}
                  label="Date created"
                  onClick={() => setDraftSortBy("createdAt")}
                />
                <SortButton
                  active={draftSortBy === "firstName"}
                  label="First name"
                  onClick={() => setDraftSortBy("firstName")}
                />
                <SortButton
                  active={draftSortBy === "lastName"}
                  label="Last name"
                  onClick={() => setDraftSortBy("lastName")}
                />
                <SortButton
                  active={draftSortBy === "email"}
                  label="Email address"
                  onClick={() => setDraftSortBy("email")}
                />
                <SortButton
                  active={draftSortBy === "lastLoginAt"}
                  label="Last login"
                  onClick={() => setDraftSortBy("lastLoginAt")}
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

function SortButton({ active, label, onClick }: SortButtonProps) {
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
