import StatusBadge from "@/components/common/StatusBadge"
import type { UserRole } from "../types/user.types"

interface UserStatusBadgeProps {
  status: UserRole | "active" | "inactive" | "verified" | "unverified"
  className?: string
  showDot?: boolean
}

export default function UserStatusBadge({
  status,
  className,
  showDot,
}: UserStatusBadgeProps) {
  // Show a dot for active/inactive and verified/unverified states
  const shouldShowDot = showDot ?? (status === "active" || status === "inactive" || status === "verified" || status === "unverified")

  return (
    <StatusBadge
      status={status}
      showDot={shouldShowDot}
      className={className}
    />
  )
}