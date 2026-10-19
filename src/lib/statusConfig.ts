import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  HelpCircle,
  Loader2,
  PauseCircle,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react"
import type React from "react"

export type StatusCategory =
  | "todo"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "planning"
  | "archived"
  | "active"
  | "inactive"
  | "verified"
  | "unverified"
  | "admin"
  | "manager"
  | "user"
  | "urgent"
  | "high"
  | "medium"
  | "low"
  | "default"

export interface StatusStyleConfig {
  label: string
  badgeClass: string
  dotClass: string
  borderClass: string
  textClass: string
  bgClass: string
  icon: React.ComponentType<{ className?: string }>
}

/**
 * Standard semantic color configurations for application-wide statuses.
 * Designed with dark & light mode support, accessible contrast, and clean borders.
 */
export const STATUS_CONFIG: Record<StatusCategory, StatusStyleConfig> = {
  // --- Task Statuses ---
  todo: {
    label: "To Do",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800",
    dotClass: "bg-slate-400 dark:bg-slate-500",
    borderClass: "border-slate-400 dark:border-slate-500",
    textClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-500/10",
    icon: Circle,
  },
  in_progress: {
    label: "In Progress",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/80",
    dotClass: "bg-blue-500",
    borderClass: "border-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-500/10",
    icon: Loader2,
  },
  completed: {
    label: "Completed",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80",
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80",
    dotClass: "bg-rose-500",
    borderClass: "border-rose-500",
    textClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/10",
    icon: XCircle,
  },

  // --- Project Statuses ---
  planning: {
    label: "Planning",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80",
    dotClass: "bg-amber-500",
    borderClass: "border-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
    icon: Clock,
  },
  active: {
    label: "Active",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/80",
    dotClass: "bg-emerald-500",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
    bgClass: "bg-emerald-500/10",
    icon: CheckCircle2,
  },
  archived: {
    label: "Archived",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200/80 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800",
    dotClass: "bg-zinc-400 dark:bg-zinc-500",
    borderClass: "border-zinc-400 dark:border-zinc-500",
    textClass: "text-zinc-600 dark:text-zinc-400",
    bgClass: "bg-zinc-500/10",
    icon: PauseCircle,
  },

  // --- User & Account Statuses ---
  inactive: {
    label: "Inactive",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200/80 dark:bg-zinc-900/60 dark:text-zinc-400 dark:border-zinc-800",
    dotClass: "bg-zinc-400 dark:bg-zinc-500",
    borderClass: "border-zinc-400 dark:border-zinc-500",
    textClass: "text-zinc-600 dark:text-zinc-400",
    bgClass: "bg-zinc-500/10",
    icon: UserX,
  },
  verified: {
    label: "Verified",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200/80 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/80",
    dotClass: "bg-teal-500",
    borderClass: "border-teal-500",
    textClass: "text-teal-600 dark:text-teal-400",
    bgClass: "bg-teal-500/10",
    icon: UserCheck,
  },
  unverified: {
    label: "Unverified",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80",
    dotClass: "bg-amber-500",
    borderClass: "border-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
    icon: AlertCircle,
  },

  // --- Roles ---
  admin: {
    label: "Admin",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/80",
    dotClass: "bg-purple-500",
    borderClass: "border-purple-500",
    textClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-500/10",
    icon: ShieldAlert,
  },
  manager: {
    label: "Manager",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/80",
    dotClass: "bg-indigo-500",
    borderClass: "border-indigo-500",
    textClass: "text-indigo-600 dark:text-indigo-400",
    bgClass: "bg-indigo-500/10",
    icon: Shield,
  },
  user: {
    label: "User",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800",
    dotClass: "bg-slate-400",
    borderClass: "border-slate-400",
    textClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-500/10",
    icon: UserCheck,
  },

  // --- Priorities ---
  urgent: {
    label: "Urgent",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/80",
    dotClass: "bg-rose-500",
    borderClass: "border-rose-500",
    textClass: "text-rose-600 dark:text-rose-400",
    bgClass: "bg-rose-500/10",
    icon: AlertCircle,
  },
  high: {
    label: "High",
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800/80",
    dotClass: "bg-orange-500",
    borderClass: "border-orange-500",
    textClass: "text-orange-600 dark:text-orange-400",
    bgClass: "bg-orange-500/10",
    icon: AlertCircle,
  },
  medium: {
    label: "Medium",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/80",
    dotClass: "bg-amber-500",
    borderClass: "border-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-500/10",
    icon: Clock,
  },
  low: {
    label: "Low",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200/80 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800",
    dotClass: "bg-slate-400",
    borderClass: "border-slate-400",
    textClass: "text-slate-600 dark:text-slate-400",
    bgClass: "bg-slate-500/10",
    icon: Circle,
  },

  // --- Fallback ---
  default: {
    label: "Unknown",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
    borderClass: "border-border",
    textClass: "text-muted-foreground",
    bgClass: "bg-muted",
    icon: HelpCircle,
  },
}

/**
 * Normalizes any status/priority/role string into a standardized StatusCategory.
 */
export function getStatusCategory(status?: string | null): StatusCategory {
  if (!status) return "default"
  const normalized = status.toLowerCase().replace(/[-_\s]+/g, "_")

  switch (normalized) {
    // To Do / Pending
    case "todo":
    case "to_do":
    case "pending":
    case "open":
      return "todo"

    // In Progress
    case "in_progress":
    case "inprogress":
    case "working":
    case "started":
      return "in_progress"

    // Completed / Done / Success
    case "done":
    case "completed":
    case "finished":
    case "success":
    case "closed":
      return "completed"

    // Cancelled / Failed
    case "cancelled":
    case "canceled":
    case "failed":
    case "error":
    case "rejected":
      return "cancelled"

    // Project statuses
    case "planning":
      return "planning"
    case "active":
      return "active"
    case "archived":
      return "archived"

    // User account states
    case "inactive":
    case "in_active":
    case "disabled":
      return "inactive"
    case "verified":
      return "verified"
    case "unverified":
      return "unverified"

    // User roles
    case "admin":
      return "admin"
    case "manager":
      return "manager"
    case "user":
    case "member":
      return "user"

    // Priorities
    case "urgent":
      return "urgent"
    case "high":
      return "high"
    case "medium":
      return "medium"
    case "low":
      return "low"

    default:
      return "default"
  }
}

/**
 * Formats a raw status string into a clean, human-friendly title.
 */
export function formatStatusLabel(status?: string | null): string {
  if (!status) return ""
  const category = getStatusCategory(status)
  if (category !== "default" && STATUS_CONFIG[category]) {
    // If it's a known category with predefined nice label, return it unless it's a role or priority
    return STATUS_CONFIG[category].label
  }
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Convenience helper to get the full configuration for any status string.
 */
export function getStatusStyle(status?: string | null): StatusStyleConfig {
  const category = getStatusCategory(status)
  return STATUS_CONFIG[category] ?? STATUS_CONFIG.default
}
