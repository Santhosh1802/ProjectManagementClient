import { useState } from "react"
import {
  CalendarDays,
  Clock3,
  FolderKanban,
  GripVertical,
  MoreHorizontal,
  MoveRight,
  UserRound,
} from "lucide-react"

import type { Task, TaskStatus } from "@/features/tasks/types/task.types"
import StatusBadge from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TaskKanbanCardProps {
  task: Task
  isDragging?: boolean
  onDragStart: (e: React.DragEvent, task: Task) => void
  onDragEnd: (e: React.DragEvent) => void
  onView?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
]

function getInitials(firstName?: string, lastName?: string) {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase()
}

function formatDate(date: string | null) {
  if (!date) return "No due date"

  const parsedDate = new Date(date)
  if (Number.isNaN(parsedDate.getTime())) {
    return "Invalid date"
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(parsedDate)
}

function isOverdue(date: string | null, status: string) {
  if (!date || status === "DONE" || status === "COMPLETED" || status === "CANCELLED") {
    return false
  }
  return new Date(date).getTime() < Date.now()
}

export default function TaskKanbanCard({
  task,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onView,
  onDelete,
  onStatusChange,
}: TaskKanbanCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const assignedUser = task.assignedTo
  const overdue = isOverdue(task.dueDate, task.taskStatus)

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onView?.(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onView?.(task)
        }
      }}
      className={`group relative flex flex-col gap-2.5 rounded-xl border bg-card p-3.5 text-card-foreground shadow-xs transition-all duration-150 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:shadow-md ${
        isDragging
          ? "opacity-40 scale-[0.98] ring-2 ring-primary/40 shadow-none border-dashed border-primary"
          : "hover:-translate-y-0.5"
      }`}
    >
      {/* Top Header: Project & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          <GripVertical
            className={`size-3.5 shrink-0 text-muted-foreground/50 transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          />
          {task.project?.name && (
            <span
              className="inline-flex max-w-[140px] items-center gap-1 truncate rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground"
              title={task.project.name}
            >
              <FolderKanban className="size-3 shrink-0 text-primary" />
              <span className="truncate">{task.project.name}</span>
            </span>
          )}
        </div>

        {/* Priority & Actions menu */}
        <div
          className="flex shrink-0 items-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <StatusBadge
            status={task.taskPriority}
            size="sm"
          />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 text-muted-foreground hover:text-foreground"
                >
                  <MoreHorizontal className="size-3.5" />
                  <span className="sr-only">Task actions</span>
                </Button>
              }
            />

            <DropdownMenuContent align="end" className="w-44">
              {onView && (
                <DropdownMenuItem onClick={() => onView(task)}>
                  View task
                </DropdownMenuItem>
              )}

              {onStatusChange && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="gap-2">
                    <MoveRight className="size-3.5" />
                    <span>Move to</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-36">
                    {STATUS_OPTIONS.map((status) => (
                      <DropdownMenuItem
                        key={status.value}
                        disabled={task.taskStatus === status.value}
                        onClick={() => onStatusChange(task.id, status.value)}
                        className={
                          task.taskStatus === status.value
                            ? "font-semibold text-primary"
                            : ""
                        }
                      >
                        {status.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}

              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(task)}
                  >
                    Delete task
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="line-clamp-2 text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
        {task.title}
      </h4>

      {/* Task Description snippet (if any) */}
      {task.description && (
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      )}

      {/* Card Footer: Due Date & Assignee */}
      <div className="flex items-center justify-between gap-2 border-t pt-2.5 text-xs text-muted-foreground">
        {/* Due Date */}
        <div
          className={`flex items-center gap-1.5 ${
            overdue ? "font-medium text-destructive" : ""
          }`}
          title={task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : "No due date"}
        >
          {overdue ? (
            <Clock3 className="size-3 shrink-0 text-destructive" />
          ) : (
            <CalendarDays className="size-3 shrink-0 text-muted-foreground" />
          )}
          <span className="text-[11px]">{formatDate(task.dueDate)}</span>
        </div>

        {/* Assignee */}
        <div
          className="flex items-center gap-1.5"
          title={
            assignedUser
              ? `Assigned to ${assignedUser.firstName} ${assignedUser.lastName}`
              : "Unassigned"
          }
        >
          {assignedUser ? (
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              {getInitials(assignedUser.firstName, assignedUser.lastName)}
            </div>
          ) : (
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-3 text-muted-foreground" />
            </div>
          )}
          <span className="max-w-[80px] truncate text-[11px]">
            {assignedUser
              ? `${assignedUser.firstName} ${assignedUser.lastName?.charAt(0) ? `${assignedUser.lastName.charAt(0)}.` : ""}`
              : "Unassigned"}
          </span>
        </div>
      </div>
    </div>
  )
}
