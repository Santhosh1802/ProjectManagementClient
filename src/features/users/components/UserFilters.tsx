import { useState } from "react"
import { Search, SlidersHorizontal, X, ArrowDownUp, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

import type {
  SortField,
  SortOrder,
  UserRole,
  UserStatus,
  VerificationStatus,
} from "../types/user.types"



interface UserFiltersProps {
  keyword: string
  role: UserRole | "all"
  status: UserStatus
  verification: VerificationStatus
  sortBy: SortField
  sortOrder: SortOrder
  onKeywordChange: (value: string) => void
  onRoleChange: (value: UserRole | "all") => void
  onStatusChange: (value: UserStatus) => void
  onVerificationChange: (value: VerificationStatus) => void
  onSortByChange: (value: SortField) => void
  onSortOrderChange: (value: SortOrder) => void
  onReset: () => void
}

const selectClassName =
  "h-10 rounded-lg border-border/70 bg-background shadow-none"

export default function UserFilters({
  keyword,
  role,
  status,
  verification,
  sortBy,
  sortOrder,
  onKeywordChange,
  onRoleChange,
  onStatusChange,
  onVerificationChange,
  onSortByChange,
  onSortOrderChange,
  onReset,
}: UserFiltersProps) {
  const [open, setOpen] = useState(false)

  // Draft values: applied to the parent only when Apply is clicked.
  const [draftRole, setDraftRole] = useState<UserRole | "all">(role)
  const [draftStatus, setDraftStatus] = useState<UserStatus>(status)
  const [draftVerification, setDraftVerification] =
    useState<VerificationStatus>(verification)
  const [draftSortBy, setDraftSortBy] = useState<SortField>(sortBy)
  const [draftSortOrder, setDraftSortOrder] = useState<SortOrder>(sortOrder)

  const activeFilterCount = [
    role !== "all",
    status !== "all",
    verification !== "all",
  ].filter(Boolean).length

  const hasCustomSort = sortBy !== "createdAt" || sortOrder !== "desc"

  const hasAnyFilters =
    keyword.trim() !== "" || activeFilterCount > 0 || hasCustomSort

  function handleApply() {
    onRoleChange(draftRole)
    onStatusChange(draftStatus)
    onVerificationChange(draftVerification)
    onSortByChange(draftSortBy)
    onSortOrderChange(draftSortOrder)
    setOpen(false)
  }

  function handleReset() {
    onReset()

    setDraftRole("all")
    setDraftStatus("all")
    setDraftVerification("all")
    setDraftSortBy("createdAt")
    setDraftSortOrder("desc")

    setOpen(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftRole(role)
      setDraftStatus(status)
      setDraftVerification(verification)
      setDraftSortBy(sortBy)
      setDraftSortOrder(sortOrder)
    }

    setOpen(nextOpen)
  }
  

  return (
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Always-visible search */}
      <div className="group relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />

        <Input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search by name or email..."
          aria-label="Search users by name or email"
          aria-keyshortcuts="/"
          data-page-search=""
          className="h-10 rounded-lg border-border/70 bg-card pr-9 pl-9 shadow-none focus-visible:ring-2 focus-visible:ring-ring/20"
        />

        {keyword.length > 0 && (
          <button
            type="button"
            onClick={() => onKeywordChange("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>
      

      {/* Filter popover */}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger render={<Button
            type="button"
            variant="outline"
            className="h-10 w-full justify-between gap-2 rounded-lg border-border/70 bg-card px-3 sm:w-auto sm:justify-center"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </span>

            <span className="text-xs text-muted-foreground sm:hidden">
              {activeFilterCount > 0
                ? `${activeFilterCount} active`
                : "Optional"}
            </span>
          </Button>}>
          
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[calc(100vw-2rem)] max-w-95 rounded-xl border-border/70 p-0 shadow-xl sm:w-95"
        >
          {/* Popover header */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <SlidersHorizontal className="size-4" />
              </div>

              <div>
                <h3 className="text-sm font-semibold">Filter users</h3>
                <p className="text-xs text-muted-foreground">
                  Refine your results
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              aria-label="Close filters"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <Separator />

          {/* Filter fields */}
          <div className="max-h-[65vh] space-y-4 overflow-y-auto p-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Role
              </label>

              <Select
                value={draftRole}
                onValueChange={(value) =>
                  setDraftRole(value as UserRole | "all")
                }
              >
                <SelectTrigger
                  aria-label="Filter by role"
                  className={selectClassName}
                >
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Account status
              </label>

              <Select
                value={draftStatus}
                onValueChange={(value) => setDraftStatus(value as UserStatus)}
              >
                <SelectTrigger
                  aria-label="Filter by account status"
                  className={selectClassName}
                >
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Email verification
              </label>

              <Select
                value={draftVerification}
                onValueChange={(value) =>
                  setDraftVerification(value as VerificationStatus)
                }
              >
                <SelectTrigger
                  aria-label="Filter by email verification"
                  className={selectClassName}
                >
                  <SelectValue placeholder="All email statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All email statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <ArrowDownUp className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort results</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Sort by
              </label>

              <Select
                value={draftSortBy}
                onValueChange={(value) => setDraftSortBy(value as SortField)}
              >
                <SelectTrigger
                  aria-label="Sort users by"
                  className={selectClassName}
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date created</SelectItem>
                  <SelectItem value="firstName">First name</SelectItem>
                  <SelectItem value="lastName">Last name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="lastLoginAt">Last login</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Direction
              </label>

              <Select
                value={draftSortOrder}
                onValueChange={(value) => setDraftSortOrder(value as SortOrder)}
              >
                <SelectTrigger
                  aria-label="Sort direction"
                  className={selectClassName}
                >
                  <SelectValue placeholder="Sort direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">
                    Descending (newest first)
                  </SelectItem>
                  <SelectItem value="asc">Ascending (oldest first)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 p-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              className="rounded-lg text-muted-foreground"
            >
              <X className="mr-1.5 size-3.5" />
              Reset all
            </Button>

            <Button type="button" onClick={handleApply} className="rounded-lg">
              <Check className="mr-1.5 size-4" />
              Apply filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Quick reset for the search field and applied filters */}
      {hasAnyFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={handleReset}
          className="h-10 shrink-0 gap-1.5 rounded-lg text-muted-foreground"
        >
          <X className="size-4" />
          <span>Reset</span>
        </Button>
      )}
    </section>
  )
}
