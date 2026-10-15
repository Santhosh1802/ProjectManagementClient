import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  MoreHorizontal,
} from "lucide-react"

import type { Task } from "@/features/tasks/types/task.types"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface TaskTableProps {
  tasks: Task[]
  onView?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange?: (task: Task) => void
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "DONE":
    case "COMPLETED":
      return "default"
    case "IN_PROGRESS":
      return "secondary"
    case "CANCELLED":
      return "destructive"
    default:
      return "outline"
  }
}

function getPriorityVariant(
  priority: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (priority) {
    case "URGENT":
      return "destructive"
    case "HIGH":
      return "default"
    case "MEDIUM":
      return "secondary"
    default:
      return "outline"
  }
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

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export default function TaskTable({
  tasks,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-70">
              Task
            </TableHead>

            <TableHead>Status</TableHead>

            <TableHead>Priority</TableHead>

            <TableHead>Assigned To</TableHead>

            <TableHead>Due Date</TableHead>

            <TableHead>Created By</TableHead>

            <TableHead className="w-15 text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {tasks.map((task) => {
            const overdue = isOverdue(
              task.dueDate,
              task.taskStatus,
            )

            return (
              <TableRow
                key={task.id}
                className="group"
              >
                {/* Task */}
                <TableCell>
                  <button
                    type="button"
                    disabled={!onView}
                    onClick={() => onView?.(task)}
                    className="max-w-[320px] text-left"
                  >
                    <p className="line-clamp-1 font-medium transition-colors group-hover:text-primary">
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {task.description}
                      </p>
                    )}
                  </button>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge
                    variant={getStatusVariant(task.taskStatus)}
                  >
                    {task.taskStatus === "DONE" ? (
                      <CheckCircle2 className="mr-1 size-3.5" />
                    ) : (
                      <Circle className="mr-1 size-3.5" />
                    )}

                    {formatLabel(task.taskStatus)}
                  </Badge>
                </TableCell>

                {/* Priority */}
                <TableCell>
                  <Badge
                    variant={getPriorityVariant(
                      task.taskPriority,
                    )}
                  >
                    {formatLabel(task.taskPriority)}
                  </Badge>
                </TableCell>

                {/* Assignee */}
                <TableCell>
                  <div className="flex min-w-37.5 items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          task.assignedTo.firstName,
                          task.assignedTo.lastName,
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {task.assignedTo.firstName}{" "}
                        {task.assignedTo.lastName}
                      </p>

                      <p className="max-w-40 truncate text-xs text-muted-foreground">
                        {task.assignedTo.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Due date */}
                <TableCell>
                  <div
                    className={`flex min-w-30 items-center gap-2 text-sm ${
                      overdue
                        ? "font-medium text-destructive"
                        : "text-muted-foreground"
                    }`}
                  >
                    {overdue ? (
                      <Clock3 className="size-4 shrink-0" />
                    ) : (
                      <CalendarDays className="size-4 shrink-0" />
                    )}

                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                </TableCell>

                {/* Created by */}
                <TableCell>
                  <div className="flex min-w-35 items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          task.createdBy.firstName,
                          task.createdBy.lastName,
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {task.createdBy.firstName}{" "}
                        {task.createdBy.lastName}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                      >
                        <MoreHorizontal className="size-4" />

                        <span className="sr-only">
                          Open task actions
                        </span>
                      </Button>
                    } />

                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem
                          onClick={() => onView(task)}
                        >
                          View task
                        </DropdownMenuItem>
                      )}

                      {onEdit && (
                        <DropdownMenuItem
                          onClick={() => onEdit(task)}
                        >
                          Edit task
                        </DropdownMenuItem>
                      )}

                      {onStatusChange && (
                        <DropdownMenuItem
                          onClick={() => onStatusChange(task)}
                        >
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
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}