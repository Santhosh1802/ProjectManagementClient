import { useState, useEffect } from "react"
import { Check, CircleDot, Shield, UserCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

import type {
  UserRole,
  UserStatus,
  VerificationStatus,
} from "../types/user.types"

export interface UserFiltersState {
  role: UserRole | "all"
  status: UserStatus
  verification: VerificationStatus
}

interface UserFiltersProps {
  filters: UserFiltersState
  onApplyFilters: (filters: UserFiltersState) => void
  onClose?: () => void
}

const ROLES: { label: string; value: UserRole | "all" }[] = [
  { label: "All roles", value: "all" },
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  { label: "Member", value: "USER" },
]

const STATUSES: { label: string; value: UserStatus }[] = [
  { label: "All statuses", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
]

const VERIFICATIONS: { label: string; value: VerificationStatus }[] = [
  { label: "All", value: "all" },
  { label: "Verified", value: "verified" },
  { label: "Unverified", value: "unverified" },
]

export default function UserFilters({
  filters,
  onApplyFilters,
  onClose,
}: UserFiltersProps) {
  const [draftFilters, setDraftFilters] = useState<UserFiltersState>(filters)

  useEffect(() => {
    setDraftFilters(filters)
  }, [filters])

  const hasDraftFilters =
    draftFilters.role !== "all" ||
    draftFilters.status !== "all" ||
    draftFilters.verification !== "all"

  const updateDraft = <K extends keyof UserFiltersState>(
    key: K,
    value: UserFiltersState[K]
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
    const cleared: UserFiltersState = {
      role: "all",
      status: "all",
      verification: "all",
    }
    setDraftFilters(cleared)
    onApplyFilters(cleared)
    onClose?.()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-2">
        <span className="text-xs font-semibold text-foreground">Filter users</span>
        {hasDraftFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
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
            const active = draftFilters.role === r.value
            return (
              <Button
                key={r.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                className="h-7 text-xs"
                onClick={() => updateDraft("role", r.value)}
              >
                {active && <Check className="size-3 mr-1" />}
                {r.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Account Status */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <CircleDot className="size-3.5" />
          Account status
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => {
            const active = draftFilters.status === s.value
            return (
              <Button
                key={s.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                className="h-7 text-xs"
                onClick={() => updateDraft("status", s.value)}
              >
                {active && <Check className="size-3 mr-1" />}
                {s.label}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Email Verification */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <UserCheck className="size-3.5" />
          Email verification
        </div>
        <div className="flex flex-wrap gap-1.5">
          {VERIFICATIONS.map((v) => {
            const active = draftFilters.verification === v.value
            return (
              <Button
                key={v.value}
                type="button"
                size="sm"
                variant={active ? "secondary" : "outline"}
                className="h-7 text-xs"
                onClick={() => updateDraft("verification", v.value)}
              >
                {active && <Check className="size-3 mr-1" />}
                {v.label}
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
