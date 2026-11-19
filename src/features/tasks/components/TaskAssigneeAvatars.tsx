import { CheckSquare } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import type { Task, TaskUser } from "../types/task.types"

/**
 * Returns the deduplicated list of assignees for a task, always leading with
 * the primary `assignedTo` user (when present) followed by any co-assignees.
 */
export function getEffectiveAssignees(
  task: Pick<Task, "assignedTo" | "assignees">
): TaskUser[] {
  const seen = new Set<string>()
  const result: TaskUser[] = []

  const addUser = (user?: TaskUser | null) => {
    if (!user || !user.id || seen.has(user.id)) return
    seen.add(user.id)
    result.push(user)
  }

  addUser(task.assignedTo)
  if (Array.isArray(task.assignees)) {
    for (const assignee of task.assignees) {
      addUser(assignee)
    }
  }

  return result
}

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.charAt(0) ?? ""
  const last = lastName?.charAt(0) ?? ""
  return `${first}${last}`.toUpperCase() || "?"
}

function getDisplayName(user: TaskUser): string {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
}

export interface TaskAssigneeAvatarsProps {
  task: Pick<Task, "assignedTo" | "assignees">
  maxVisible?: number
  size?: "sm" | "md"
  className?: string
}

/**
 * Compact overlapping avatar stack representing primary and co-assignees on a task.
 */
export function TaskAssigneeAvatars({
  task,
  maxVisible = 3,
  size = "sm",
  className,
}: TaskAssigneeAvatarsProps) {
  const assignees = getEffectiveAssignees(task)
  if (assignees.length === 0) return null

  const visible = assignees.slice(0, maxVisible)
  const overflowCount = assignees.length - visible.length
  const tooltip = assignees.map(getDisplayName).join(", ")
  const sizeClasses = size === "sm" ? "size-5 text-[10px]" : "size-7 text-xs"

  return (
    <div
      className={cn("flex items-center -space-x-1.5", className)}
      title={`Assignees: ${tooltip}`}
      aria-label={`Assignees: ${tooltip}`}
    >
      {visible.map((assignee) => (
        <Avatar
          key={assignee.id}
          className={cn(sizeClasses, "ring-2 ring-background")}
        >
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {getInitials(assignee.firstName, assignee.lastName)}
          </AvatarFallback>
        </Avatar>
      ))}

      {overflowCount > 0 && (
        <span
          className={cn(
            sizeClasses,
            "inline-flex items-center justify-center rounded-full bg-muted font-medium text-muted-foreground ring-2 ring-background"
          )}
        >
          +{overflowCount}
        </span>
      )}
    </div>
  )
}

export interface SubtaskProgressBadgeProps {
  subtaskCount?: number
  completedSubtaskCount?: number
  className?: string
}

/**
 * Displays completed / total checklist progress for a task when subtasks exist.
 */
export function SubtaskProgressBadge({
  subtaskCount,
  completedSubtaskCount = 0,
  className,
}: SubtaskProgressBadgeProps) {
  if (!subtaskCount || subtaskCount <= 0) return null

  const completed = Math.min(completedSubtaskCount, subtaskCount)
  const allComplete = completed === subtaskCount

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        allComplete
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
          : "bg-muted text-muted-foreground",
        className
      )}
      title={`${completed} of ${subtaskCount} subtasks completed`}
    >
      <CheckSquare className="size-3 shrink-0" />
      <span>
        {completed}/{subtaskCount}
      </span>
    </span>
  )
}
