import {
  CalendarDays,
  Clock3,
  MoreHorizontal,
  UserRound,
} from "lucide-react"

import type { Task } from "@/features/tasks/types/task.types"

import StatusBadge from "@/components/common/StatusBadge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface TaskCardProps {
  task: Task
  onView?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange?: (task: Task) => void
}

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
    year: "numeric",
  }).format(parsedDate)
}

function isOverdue(date: string | null, status: string) {
  if (!date || status === "DONE" || status === "COMPLETED" || status === "CANCELLED") {
    return false
  }

  return new Date(date).getTime() < Date.now()
}

export default function TaskCard({
  task,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const assignedUser = task.assignedTo

  const overdue = isOverdue(task.dueDate, task.taskStatus)

  return (
    <Card className="group flex h-full flex-col transition-shadow hover:shadow-md">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <StatusBadge status={task.taskStatus} showDot />
            <StatusBadge status={task.taskPriority} />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open task actions</span>
              </Button>
            } />

            <DropdownMenuContent align="end">
              {onView && (
                <DropdownMenuItem onClick={() => onView(task)}>
                  View task
                </DropdownMenuItem>
              )}

              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit task
                </DropdownMenuItem>
              )}

              {onStatusChange && (
                <DropdownMenuItem onClick={() => onStatusChange(task)}>
                  Change status
                </DropdownMenuItem>
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

        <button
          type="button"
          onClick={() => onView?.(task)}
          className="w-full text-left"
          disabled={!onView}
        >
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight transition-colors group-hover:text-primary">
            {task.title}
          </h3>
        </button>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {task.description ? (
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        ) : (
          <p className="text-sm italic text-muted-foreground">
            No description provided.
          </p>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <UserRound className="size-3.5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Assigned to</p>

              <p className="truncate font-medium">
                {assignedUser
                  ? `${assignedUser.firstName} ${assignedUser.lastName}`
                  : "Unassigned"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
              <CalendarDays className="size-3.5 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Due date</p>

              <p
                className={
                  overdue
                    ? "font-medium text-destructive"
                    : "font-medium"
                }
              >
                {formatDate(task.dueDate)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-3 border-t pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
            {getInitials(
              task.createdBy.firstName,
              task.createdBy.lastName,
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Created by</p>

            <p className="truncate text-sm font-medium">
              {task.createdBy.firstName} {task.createdBy.lastName}
            </p>
          </div>
        </div>

        {overdue && (
          <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-destructive">
            <Clock3 className="size-3.5" />
            Overdue
          </div>
        )}
      </CardFooter>
    </Card>
  )
}