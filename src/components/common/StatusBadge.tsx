import { cn } from "@/lib/utils"
import { formatStatusLabel, getStatusStyle } from "@/lib/statusConfig"

interface StatusBadgeProps {
  status: string
  label?: string
  showIcon?: boolean
  showDot?: boolean
  className?: string
  size?: "sm" | "default" | "lg"
}

/**
 * Universal, accessible status badge adhering to the application's global status color system.
 * Handles tasks, projects, user roles, user account states, and priorities seamlessly.
 */
export default function StatusBadge({
  status,
  label,
  showIcon = false,
  showDot = false,
  className,
  size = "default",
}: StatusBadgeProps) {
  const config = getStatusStyle(status)
  const displayLabel = label ?? formatStatusLabel(status)
  const Icon = config.icon

  const sizeClasses = {
    sm: "h-4.5 px-1.5 text-[0.625rem] gap-1",
    default: "h-5 px-2 text-[0.6875rem] gap-1.5",
    lg: "h-6 px-2.5 text-xs gap-1.5",
  }

  return (
    <span
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center rounded-full border font-medium whitespace-nowrap transition-colors",
        config.badgeClass,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn("size-1.5 rounded-full shrink-0", config.dotClass)}
          aria-hidden="true"
        />
      )}
      {showIcon && !showDot && (
        <Icon className="size-3 shrink-0" aria-hidden="true" />
      )}
      <span>{displayLabel}</span>
    </span>
  )
}
