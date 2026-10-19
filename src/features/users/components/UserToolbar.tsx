import { useState, useEffect, useRef } from "react"
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  CircleDot,
  Filter,
  Info,
  Shield,
  UserCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import SearchInput from "@/components/common/SearchInput"
import UserViewSwitcher from "./UserViewSwitcher"
import { cn } from "@/lib/utils"

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
  onKeywordChange: (value: string) => void
  onApplyFilters: (filters: {
    role: UserRole | "all"
    status: UserStatus
    verification: VerificationStatus
  }) => void
  onApplySort: (sort: {
    sortBy: SortField
    sortOrder: SortOrder
  }) => void
  onViewChange: (view: UserView) => void
}

const ROLES: { value: UserRole | "all"; label: string }[] = [
  { value: "all", label: "All roles" },
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "USER", label: "User" },
]

const STATUSES: { value: UserStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
]

const VERIFICATIONS: { value: VerificationStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
]

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
}: UserToolbarProps) {
  const [activeDropdown, setActiveDropdown] = useState<"filter" | "sort" | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  // Staged filter state
  const [draftRole, setDraftRole] = useState<UserRole | "all">(role)
  const [draftStatus, setDraftStatus] = useState<UserStatus>(status)
  const [draftVerification, setDraftVerification] = useState<VerificationStatus>(verification)

  // Staged sort state
  const [draftSortBy, setDraftSortBy] = useState<SortField>(sortBy)
  const [draftSortOrder, setDraftSortOrder] = useState<SortOrder>(sortOrder)

  useEffect(() => {
    setDraftRole(role)
    setDraftStatus(status)
    setDraftVerification(verification)
  }, [role, status, verification])

  useEffect(() => {
    setDraftSortBy(sortBy)
    setDraftSortOrder(sortOrder)
  }, [sortBy, sortOrder])

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

  const hasFilters = role !== "all" || status !== "all" || verification !== "all"
  const hasDraftFilters = draftRole !== "all" || draftStatus !== "all" || draftVerification !== "all"

  const handleApplyFilterClick = () => {
    onApplyFilters({
      role: draftRole,
      status: draftStatus,
      verification: draftVerification,
    })
    setActiveDropdown(null)
  }

  const handleResetFilterClick = () => {
    setDraftRole("all")
    setDraftStatus("all")
    setDraftVerification("all")
    onApplyFilters({
      role: "all",
      status: "all",
      verification: "all",
    })
    setActiveDropdown(null)
  }

  const handleApplySortClick = () => {
    onApplySort({
      sortBy: draftSortBy,
      sortOrder: draftSortOrder,
    })
    setActiveDropdown(null)
  }

  return (
    <div className="flex flex-col gap-3" ref={toolbarRef}>
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
          {/* Filter */}
          <details 
            className="relative" 
            open={activeDropdown === "filter"}
          >
            <summary 
              className="flex h-7.5 cursor-pointer list-none items-center gap-1.5 rounded-md border bg-background px-2.5 text-xs font-medium hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                if (activeDropdown !== "filter") {
                  setDraftRole(role)
                  setDraftStatus(status)
                  setDraftVerification(verification)
                }
                setActiveDropdown(activeDropdown === "filter" ? null : "filter")
              }}
            >
              <Filter className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {hasFilters && (
                <span className="flex size-4 items-center justify-center rounded-full text-xs text-primary" title="Filters applied">
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
                <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-semibold text-foreground">Filter users</span>
                  {hasDraftFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilterClick}
                      className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Shield className="size-3.5" />
                    Role
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ROLES.map((r) => {
                      const active = draftRole === r.value
                      return (
                        <Button
                          key={r.value}
                          type="button"
                          size="sm"
                          variant={active ? "secondary" : "outline"}
                          className="h-7 text-xs"
                          onClick={() => setDraftRole(r.value)}
                        >
                          {active && <Check className="size-3 mr-1" />}
                          {r.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CircleDot className="size-3.5" />
                    Account status
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUSES.map((s) => {
                      const active = draftStatus === s.value
                      return (
                        <Button
                          key={s.value}
                          type="button"
                          size="sm"
                          variant={active ? "secondary" : "outline"}
                          className="h-7 text-xs"
                          onClick={() => setDraftStatus(s.value)}
                        >
                          {active && <Check className="size-3 mr-1" />}
                          {s.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Verification */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <UserCheck className="size-3.5" />
                    Email verification
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {VERIFICATIONS.map((v) => {
                      const active = draftVerification === v.value
                      return (
                        <Button
                          key={v.value}
                          type="button"
                          size="sm"
                          variant={active ? "secondary" : "outline"}
                          className="h-7 text-xs"
                          onClick={() => setDraftVerification(v.value)}
                        >
                          {active && <Check className="size-3 mr-1" />}
                          {v.label}
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Footer Actions */}
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
                    onClick={handleApplyFilterClick}
                  >
                    <Check className="size-3 mr-1" />
                    Apply filters
                  </Button>
                </div>
              </div>
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
                  setDraftSortBy(sortBy)
                  setDraftSortOrder(sortOrder)
                }
                setActiveDropdown(activeDropdown === "sort" ? null : "sort")
              }}
            >
              {sortOrder === "asc" ? (
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
                    <p className="text-xs font-semibold">Sort users</p>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Sort by</p>
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
                        label="Email"
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
                      onClick={handleApplySortClick}
                    >
                      <Check className="size-3 mr-1" />
                      Apply sort
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* View Switcher */}
          <UserViewSwitcher value={view} onChange={onViewChange} />
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
      className="h-7 justify-start text-xs"
      size="sm"
      onClick={onClick}
    >
      {active && <Check className="size-3 mr-1" />}
      {label}
    </Button>
  )
}
