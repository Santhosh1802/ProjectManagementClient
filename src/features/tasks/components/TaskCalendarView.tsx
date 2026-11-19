import { useMemo, useState } from "react"
import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns"
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import StatusBadge from "@/components/common/StatusBadge"
import { cn } from "@/lib/utils"
import type { Task } from "@/features/tasks/types/task.types"

export type CalendarDisplayMode = "month" | "week" | "agenda"

export interface TaskCalendarViewProps {
  tasks: Task[]
  onViewTask?: (task: Task) => void
  onRescheduleTask?: (task: Task, nextDueDateIso: string | null) => Promise<void> | void
  isRescheduling?: boolean
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

function parseDueDate(dueDate: string | null | undefined): Date | null {
  if (!dueDate) return null
  const parsed = new Date(dueDate)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function toLocalDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

function toPickerValue(dueDate: string | null | undefined): string {
  const parsed = parseDueDate(dueDate)
  if (!parsed) return ""
  return format(parsed, "yyyy-MM-dd HH:mm")
}

function pickerValueToIso(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.includes(" ")) {
    const [datePart, timePart] = trimmed.split(" ")
    const parsed = new Date(`${datePart}T${timePart || "09:00"}:00`)
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
  }

  const parsed = new Date(`${trimmed}T09:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
}

function isTaskOverdue(task: Task, nowMs: number): boolean {
  const due = parseDueDate(task.dueDate)
  if (!due) return false
  return (
    due.getTime() < nowMs &&
    task.taskStatus !== "DONE" &&
    task.taskStatus !== "CANCELLED"
  )
}

function getTaskAccentClass(task: Task, nowMs: number): string {
  if (task.taskStatus === "DONE") {
    return "border-l-emerald-500 bg-emerald-500/5 text-foreground/85"
  }
  if (task.taskStatus === "CANCELLED") {
    return "border-l-muted-foreground/40 bg-muted/40 text-muted-foreground line-through"
  }
  if (isTaskOverdue(task, nowMs)) {
    return "border-l-destructive bg-destructive/10 text-foreground"
  }
  if (task.taskPriority === "URGENT") {
    return "border-l-rose-500 bg-rose-500/10 text-foreground"
  }
  if (task.taskPriority === "HIGH") {
    return "border-l-amber-500 bg-amber-500/10 text-foreground"
  }
  return "border-l-primary bg-primary/5 text-foreground"
}

function getAssigneeName(task: Task): string {
  if (!task.assignedTo) return "Unassigned"
  return `${task.assignedTo.firstName ?? ""} ${task.assignedTo.lastName ?? ""}`.trim() || task.assignedTo.email
}

export default function TaskCalendarView({
  tasks,
  onViewTask,
  onRescheduleTask,
  isRescheduling = false,
}: TaskCalendarViewProps) {
  const [nowMs] = useState(() => Date.now())
  const [mode, setMode] = useState<CalendarDisplayMode>("month")
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date())
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() =>
    toLocalDateKey(new Date())
  )
  const [showUnscheduled, setShowUnscheduled] = useState(true)
  const [rescheduleTarget, setRescheduleTarget] = useState<Task | null>(null)
  const [draftDueDate, setDraftDueDate] = useState<string>("")
  const [submittingReschedule, setSubmittingReschedule] = useState(false)

  const { tasksByDate, scheduledTasks, unscheduledTasks, overdueCount } = useMemo(() => {
    const grouped = new Map<string, Task[]>()
    const scheduled: Task[] = []
    const unscheduled: Task[] = []
    let overdue = 0

    for (const task of tasks) {
      const parsed = parseDueDate(task.dueDate)
      if (!parsed) {
        unscheduled.push(task)
        continue
      }

      scheduled.push(task)
      if (isTaskOverdue(task, nowMs)) {
        overdue += 1
      }

      const key = toLocalDateKey(parsed)
      const list = grouped.get(key)
      if (list) {
        list.push(task)
      } else {
        grouped.set(key, [task])
      }
    }

    for (const [, list] of grouped) {
      list.sort((a, b) => {
        const tA = parseDueDate(a.dueDate)?.getTime() ?? 0
        const tB = parseDueDate(b.dueDate)?.getTime() ?? 0
        return tA - tB
      })
    }

    scheduled.sort((a, b) => {
      const tA = parseDueDate(a.dueDate)?.getTime() ?? 0
      const tB = parseDueDate(b.dueDate)?.getTime() ?? 0
      return tA - tB
    })

    return {
      tasksByDate: grouped,
      scheduledTasks: scheduled,
      unscheduledTasks: unscheduled,
      overdueCount: overdue,
    }
  }, [tasks, nowMs])

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(anchorDate)
    const monthEnd = endOfMonth(anchorDate)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 })
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: gridStart, end: gridEnd })
  }, [anchorDate])

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(anchorDate, { weekStartsOn: 0 })
    const weekEnd = endOfWeek(anchorDate, { weekStartsOn: 0 })
    return eachDayOfInterval({ start: weekStart, end: weekEnd })
  }, [anchorDate])

  const agendaDateGroups = useMemo(() => {
    const entries = Array.from(tasksByDate.entries()).sort(([a], [b]) => a.localeCompare(b))
    return entries.map(([dateKey, dayTasks]) => ({
      dateKey,
      date: new Date(`${dateKey}T00:00:00`),
      tasks: dayTasks,
    }))
  }, [tasksByDate])

  const overdueAgendaTasks = useMemo(() => {
    return scheduledTasks.filter((t) => isTaskOverdue(t, nowMs))
  }, [scheduledTasks, nowMs])

  const selectedDayTasks = tasksByDate.get(selectedDateKey) ?? []

  const periodLabel = useMemo(() => {
    if (mode === "month") {
      return format(anchorDate, "MMMM yyyy")
    }
    if (mode === "week") {
      const first = weekDays[0]
      const last = weekDays[weekDays.length - 1]
      if (!first || !last) return format(anchorDate, "MMMM yyyy")
      return `${format(first, "MMM d")} – ${format(last, "MMM d, yyyy")}`
    }
    return "Chronological Agenda"
  }, [mode, anchorDate, weekDays])

  const handleNavigatePrev = () => {
    if (mode === "week") {
      setAnchorDate((prev) => subWeeks(prev, 1))
    } else {
      setAnchorDate((prev) => subMonths(prev, 1))
    }
  }

  const handleNavigateNext = () => {
    if (mode === "week") {
      setAnchorDate((prev) => addWeeks(prev, 1))
    } else {
      setAnchorDate((prev) => addMonths(prev, 1))
    }
  }

  const handleNavigateToday = () => {
    const today = new Date()
    setAnchorDate(today)
    setSelectedDateKey(toLocalDateKey(today))
  }

  const openRescheduleDialog = (task: Task) => {
    setRescheduleTarget(task)
    setDraftDueDate(toPickerValue(task.dueDate))
  }

  const closeRescheduleDialog = () => {
    setRescheduleTarget(null)
    setDraftDueDate("")
  }

  const handleSaveReschedule = async () => {
    if (!rescheduleTarget || !onRescheduleTask) return
    const nextIso = pickerValueToIso(draftDueDate)
    try {
      setSubmittingReschedule(true)
      await onRescheduleTask(rescheduleTarget, nextIso)
      closeRescheduleDialog()
    } finally {
      setSubmittingReschedule(false)
    }
  }

  const handleClearDueDate = async () => {
    if (!rescheduleTarget || !onRescheduleTask) return
    try {
      setSubmittingReschedule(true)
      await onRescheduleTask(rescheduleTarget, null)
      closeRescheduleDialog()
    } finally {
      setSubmittingReschedule(false)
    }
  }

  const busyRescheduling = isRescheduling || submittingReschedule

  return (
    <div className="space-y-4 min-w-0">
      {/* Calendar Header Controls */}
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {mode !== "agenda" && (
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleNavigatePrev}
                aria-label="Previous period"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={handleNavigateToday}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={handleNavigateNext}
                aria-label="Next period"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}

          <h2 className="text-sm sm:text-base font-semibold tracking-tight text-foreground ml-1">
            {periodLabel}
          </h2>

          <div className="flex flex-wrap items-center gap-1.5 ml-1">
            <Badge variant="secondary" className="text-[11px] font-medium">
              {scheduledTasks.length} scheduled
            </Badge>
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-[11px] font-medium">
                {overdueCount} overdue
              </Badge>
            )}
            <Badge variant="outline" className="text-[11px] font-medium">
              {unscheduledTasks.length} unscheduled
            </Badge>
          </div>
        </div>

        {/* Display Mode Switcher */}
        <div className="flex items-center gap-1 rounded-lg border bg-background p-0.5 self-start lg:self-auto">
          {(
            [
              { id: "month", label: "Month" },
              { id: "week", label: "Week" },
              { id: "agenda", label: "Agenda" },
            ] as const
          ).map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant={mode === item.id ? "secondary" : "ghost"}
              className="h-7 px-3 text-xs font-medium"
              aria-pressed={mode === item.id}
              onClick={() => setMode(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* ======================================================
          MONTH VIEW
          ====================================================== */}
      {mode === "month" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="grid grid-cols-7 border-b bg-muted/40">
              {WEEKDAY_LABELS.map((dayLabel) => (
                <div
                  key={dayLabel}
                  className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {dayLabel}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-border/70">
              {monthDays.map((day) => {
                const dayKey = toLocalDateKey(day)
                const dayTasks = tasksByDate.get(dayKey) ?? []
                const inMonth = isSameMonth(day, anchorDate)
                const todayCell = isToday(day)
                const isSelected = selectedDateKey === dayKey

                return (
                  <div
                    key={dayKey}
                    className={cn(
                      "min-h-[64px] md:min-h-[116px] p-1.5 md:p-2 transition-colors flex flex-col gap-1 min-w-0",
                      !inMonth && "bg-muted/25 text-muted-foreground/70",
                      isSelected && "bg-primary/[0.04] ring-1 ring-inset ring-primary/40"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedDateKey(dayKey)}
                      aria-label={`Select ${format(day, "MMMM d, yyyy")}`}
                      className="flex items-center justify-between gap-1 w-full text-left"
                    >
                      <span
                        className={cn(
                          "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                          todayCell
                            ? "bg-primary text-primary-foreground font-bold"
                            : "text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="md:hidden inline-flex items-center justify-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                          {dayTasks.length}
                        </span>
                      )}
                    </button>

                    {/* Mobile compact status dots */}
                    {dayTasks.length > 0 && (
                      <div className="flex flex-wrap gap-1 md:hidden mt-0.5">
                        {dayTasks.slice(0, 4).map((t) => (
                          <span
                            key={t.id}
                            className={cn(
                              "size-1.5 rounded-full",
                              isTaskOverdue(t, nowMs)
                                ? "bg-destructive"
                                : t.taskStatus === "DONE"
                                ? "bg-emerald-500"
                                : "bg-primary"
                            )}
                          />
                        ))}
                      </div>
                    )}

                    {/* Desktop task chips */}
                    <div className="hidden md:flex md:flex-col gap-1 min-w-0">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "group flex items-center justify-between gap-1 rounded border border-border/60 border-l-2 px-1.5 py-1 text-[11px] leading-tight min-w-0",
                            getTaskAccentClass(task, nowMs)
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => onViewTask?.(task)}
                            className="truncate text-left font-medium hover:underline flex-1 min-w-0"
                            title={task.title}
                          >
                            {task.title}
                          </button>
                          {onRescheduleTask && (
                            <button
                              type="button"
                              onClick={() => openRescheduleDialog(task)}
                              aria-label={`Reschedule ${task.title}`}
                              title="Reschedule due date"
                              className="opacity-70 hover:opacity-100 text-muted-foreground hover:text-primary shrink-0"
                            >
                              <CalendarClock className="size-3" />
                            </button>
                          )}
                        </div>
                      ))}

                      {dayTasks.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setSelectedDateKey(dayKey)}
                          className="text-left px-1 text-[10px] font-semibold text-primary hover:underline"
                        >
                          +{dayTasks.length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Day Breakdown Panel (always helpful on mobile & for +N more on desktop) */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <CalendarDays className="size-4 text-primary shrink-0" />
                <CardTitle className="text-sm font-semibold truncate">
                  Tasks due on {format(new Date(`${selectedDateKey}T00:00:00`), "EEEE, MMM d, yyyy")}
                </CardTitle>
              </div>
              <Badge variant="outline" className="text-[11px] shrink-0">
                {selectedDayTasks.length} {selectedDayTasks.length === 1 ? "task" : "tasks"}
              </Badge>
            </CardHeader>
            <CardContent>
              {selectedDayTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No tasks scheduled for this date.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedDayTasks.map((task) => {
                    const parsed = parseDueDate(task.dueDate)
                    return (
                      <div
                        key={task.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-2.5 hover:bg-muted/40 transition-colors"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onViewTask?.(task)}
                              className="text-sm font-medium text-left hover:text-primary hover:underline truncate"
                            >
                              {task.title}
                            </button>
                            <StatusBadge status={task.taskStatus} showDot />
                            <StatusBadge status={task.taskPriority} />
                            {isTaskOverdue(task, nowMs) && (
                              <Badge variant="destructive" className="text-[10px]">
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {task.project?.name || "Project"} · {getAssigneeName(task)}
                            {parsed ? ` · ${format(parsed, "h:mm a")}` : ""}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {onRescheduleTask && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={() => openRescheduleDialog(task)}
                            >
                              <CalendarClock className="size-3.5" />
                              Reschedule
                            </Button>
                          )}
                          {onViewTask && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs"
                              onClick={() => onViewTask(task)}
                            >
                              <ExternalLink className="size-3.5" />
                              Open
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ======================================================
          WEEK VIEW
          ====================================================== */}
      {mode === "week" && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
          {weekDays.map((day) => {
            const dayKey = toLocalDateKey(day)
            const dayTasks = tasksByDate.get(dayKey) ?? []
            const todayCell = isToday(day)

            return (
              <div
                key={dayKey}
                className={cn(
                  "flex flex-col rounded-xl border bg-card min-h-[160px] min-w-0",
                  todayCell && "border-primary/60 ring-1 ring-primary/20"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-between border-b px-3 py-2",
                    todayCell ? "bg-primary/10" : "bg-muted/40"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">
                      {format(day, "EEE")}
                    </span>
                    <span
                      className={cn(
                        "inline-flex size-5 items-center justify-center rounded-full text-[11px] font-medium",
                        todayCell ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {dayTasks.length}
                  </Badge>
                </div>

                <div className="flex-1 p-2 space-y-2">
                  {dayTasks.length === 0 ? (
                    <p className="py-4 text-center text-[11px] text-muted-foreground">
                      No tasks
                    </p>
                  ) : (
                    dayTasks.map((task) => {
                      const due = parseDueDate(task.dueDate)
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "rounded-lg border border-l-2 p-2 space-y-1.5 text-xs",
                            getTaskAccentClass(task, nowMs)
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => onViewTask?.(task)}
                            className="font-medium text-left hover:text-primary hover:underline line-clamp-2 w-full"
                          >
                            {task.title}
                          </button>

                          <div className="flex flex-wrap items-center gap-1">
                            <StatusBadge status={task.taskStatus} showDot />
                            <StatusBadge status={task.taskPriority} />
                          </div>

                          <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
                            <span className="truncate">{getAssigneeName(task)}</span>
                            {due && (
                              <span className="shrink-0 flex items-center gap-0.5">
                                <Clock className="size-3" />
                                {format(due, "HH:mm")}
                              </span>
                            )}
                          </div>

                          {onRescheduleTask && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 w-full text-[11px] gap-1"
                              onClick={() => openRescheduleDialog(task)}
                            >
                              <CalendarClock className="size-3" />
                              Reschedule
                            </Button>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ======================================================
          AGENDA VIEW
          ====================================================== */}
      {mode === "agenda" && (
        <div className="space-y-4">
          {overdueAgendaTasks.length > 0 && (
            <Card className="border-destructive/40 bg-destructive/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertTriangle className="size-4" />
                  Overdue Tasks ({overdueAgendaTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {overdueAgendaTasks.map((task) => {
                  const parsed = parseDueDate(task.dueDate)
                  return (
                    <div
                      key={task.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-destructive/20 bg-card p-2.5"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onViewTask?.(task)}
                            className="text-sm font-medium hover:text-primary hover:underline truncate"
                          >
                            {task.title}
                          </button>
                          <StatusBadge status={task.taskStatus} showDot />
                          <StatusBadge status={task.taskPriority} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Was due {parsed ? format(parsed, "MMM d, yyyy h:mm a") : "—"} ·{" "}
                          {task.project?.name || "Project"} · {getAssigneeName(task)}
                        </p>
                      </div>
                      {onRescheduleTask && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 gap-1 text-xs shrink-0 self-end sm:self-center"
                          onClick={() => openRescheduleDialog(task)}
                        >
                          <CalendarClock className="size-3.5" />
                          Reschedule
                        </Button>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {agendaDateGroups.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No scheduled tasks with due dates in the current view.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {agendaDateGroups.map((group) => (
                <Card key={group.dateKey}>
                  <CardHeader className="py-3 border-b bg-muted/30 flex flex-row items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-semibold">
                      {format(group.date, "EEEE, MMMM d, yyyy")}
                    </CardTitle>
                    <Badge variant="outline" className="text-[11px]">
                      {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="divide-y p-0">
                    {group.tasks.map((task) => {
                      const parsed = parseDueDate(task.dueDate)
                      return (
                        <div
                          key={task.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 hover:bg-muted/30 transition-colors"
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono text-muted-foreground">
                                {parsed ? format(parsed, "HH:mm") : "--:--"}
                              </span>
                              <button
                                type="button"
                                onClick={() => onViewTask?.(task)}
                                className="text-sm font-medium hover:text-primary hover:underline truncate"
                              >
                                {task.title}
                              </button>
                              <StatusBadge status={task.taskStatus} showDot />
                              <StatusBadge status={task.taskPriority} />
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {task.project?.name || "Project"} · {getAssigneeName(task)}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            {onRescheduleTask && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 gap-1 text-xs"
                                onClick={() => openRescheduleDialog(task)}
                              >
                                <CalendarClock className="size-3.5" />
                                Reschedule
                              </Button>
                            )}
                            {onViewTask && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 gap-1 text-xs"
                                onClick={() => onViewTask(task)}
                              >
                                <ExternalLink className="size-3.5" />
                                Details
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          UNSCHEDULED TASKS TRAY
          ====================================================== */}
      {unscheduledTasks.length > 0 && (
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowUnscheduled((prev) => !prev)}
              className="flex items-center gap-2 text-left text-sm font-semibold"
            >
              <span>Unscheduled Tasks ({unscheduledTasks.length})</span>
              {showUnscheduled ? (
                <ChevronUp className="size-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="size-4 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {showUnscheduled && (
            <CardContent className="pt-0 space-y-2">
              {unscheduledTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border p-2.5"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewTask?.(task)}
                        className="text-sm font-medium hover:text-primary hover:underline truncate"
                      >
                        {task.title}
                      </button>
                      <StatusBadge status={task.taskStatus} showDot />
                      <StatusBadge status={task.taskPriority} />
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {task.project?.name || "Project"} · {getAssigneeName(task)}
                    </p>
                  </div>

                  {onRescheduleTask && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 text-xs shrink-0 self-end sm:self-center"
                      onClick={() => openRescheduleDialog(task)}
                    >
                      <CalendarClock className="size-3.5" />
                      Schedule
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* ======================================================
          RESCHEDULE DIALOG (reusing vanilla-calendar-pro DatePicker)
          ====================================================== */}
      <Dialog
        open={Boolean(rescheduleTarget)}
        onOpenChange={(open) => {
          if (!open) closeRescheduleDialog()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-semibold">
              <CalendarClock className="size-4 text-primary" />
              Reschedule Task
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update the due date and time for{" "}
              <span className="font-medium text-foreground">
                {rescheduleTarget?.title}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {rescheduleTarget && (
            <div className="space-y-3 py-2">
              <DatePicker
                value={draftDueDate}
                onChange={setDraftDueDate}
                placeholder="Select due date and time"
                enableTime={true}
                disabled={busyRescheduling}
              />

              {rescheduleTarget.dueDate && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground hover:text-destructive"
                    disabled={busyRescheduling}
                    onClick={() => void handleClearDueDate()}
                  >
                    <X className="size-3.5" />
                    Clear due date
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 border-t pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busyRescheduling}
              onClick={closeRescheduleDialog}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={busyRescheduling || !draftDueDate.trim()}
              onClick={() => void handleSaveReschedule()}
              className="gap-1.5"
            >
              {busyRescheduling && <Loader2 className="size-3.5 animate-spin" />}
              Save schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
