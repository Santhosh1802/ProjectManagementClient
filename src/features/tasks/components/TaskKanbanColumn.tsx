import { useRef, useState } from "react"
import {
  CheckCircle2,
  Circle,
  CircleOff,
  Inbox,
  LoaderCircle,
  Plus,
} from "lucide-react"

import type { Task, TaskStatus } from "@/features/tasks/types/task.types"
import { Button } from "@/components/ui/button"
import TaskKanbanCard from "./TaskKanbanCard"

interface TaskKanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  draggedTaskId: string | null
  onCardDragStart: (e: React.DragEvent, task: Task) => void
  onCardDragEnd: (e: React.DragEvent) => void
  onDropTask: (taskId: string, targetStatus: TaskStatus) => void
  onViewTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
  onAddTask?: (status: TaskStatus) => void
}

interface ColumnConfig {
  label: string
  description: string
  icon: typeof Circle
  headerColor: string
  accentColor: string
  countBadgeClass: string
  dropHighlightClass: string
}

const COLUMN_CONFIGS: Record<string, ColumnConfig> = {
  TODO: {
    label: "To Do",
    description: "Tasks waiting to be started",
    icon: Circle,
    headerColor: "text-muted-foreground",
    accentColor: "border-t-slate-400 dark:border-t-slate-500",
    countBadgeClass: "bg-muted text-muted-foreground",
    dropHighlightClass: "ring-2 ring-slate-400/50 bg-slate-500/5 border-slate-400/60",
  },
  IN_PROGRESS: {
    label: "In Progress",
    description: "Tasks currently being worked on",
    icon: LoaderCircle,
    headerColor: "text-blue-500 dark:text-blue-400",
    accentColor: "border-t-blue-500",
    countBadgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dropHighlightClass: "ring-2 ring-blue-500/50 bg-blue-500/5 border-blue-500/60",
  },
  DONE: {
    label: "Completed",
    description: "Tasks successfully finished",
    icon: CheckCircle2,
    headerColor: "text-emerald-500 dark:text-emerald-400",
    accentColor: "border-t-emerald-500",
    countBadgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dropHighlightClass: "ring-2 ring-emerald-500/50 bg-emerald-500/5 border-emerald-500/60",
  },
  COMPLETED: {
    label: "Completed",
    description: "Tasks successfully finished",
    icon: CheckCircle2,
    headerColor: "text-emerald-500 dark:text-emerald-400",
    accentColor: "border-t-emerald-500",
    countBadgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dropHighlightClass: "ring-2 ring-emerald-500/50 bg-emerald-500/5 border-emerald-500/60",
  },
  CANCELLED: {
    label: "Cancelled",
    description: "Tasks cancelled or abandoned",
    icon: CircleOff,
    headerColor: "text-rose-500 dark:text-rose-400",
    accentColor: "border-t-rose-500",
    countBadgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dropHighlightClass: "ring-2 ring-rose-500/50 bg-rose-500/5 border-rose-500/60",
  },
}

export default function TaskKanbanColumn({
  status,
  tasks,
  draggedTaskId,
  onCardDragStart,
  onCardDragEnd,
  onDropTask,
  onViewTask,
  onDeleteTask,
  onStatusChange,
  onAddTask,
}: TaskKanbanColumnProps) {
  const [dragOver, setDragOver] = useState(false)
  const dragEnterCountRef = useRef(0)

  const config: ColumnConfig = COLUMN_CONFIGS[status] ?? {
    label: status.replace(/_/g, " "),
    description: "",
    icon: Circle,
    headerColor: "text-muted-foreground",
    accentColor: "border-t-muted",
    countBadgeClass: "bg-muted text-muted-foreground",
    dropHighlightClass: "ring-2 ring-primary/40 bg-primary/5 border-primary/40",
  }

  const Icon = config.icon

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragEnterCountRef.current += 1
    if (dragEnterCountRef.current > 0) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragEnterCountRef.current -= 1
    if (dragEnterCountRef.current <= 0) {
      dragEnterCountRef.current = 0
      setDragOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragEnterCountRef.current = 0
    setDragOver(false)

    const droppedTaskId = e.dataTransfer.getData("text/plain") || draggedTaskId
    if (droppedTaskId) {
      onDropTask(droppedTaskId, status)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl border border-border/80 border-t-4 bg-muted/40 p-3 transition-colors duration-200 min-h-[500px] ${
        config.accentColor
      } ${dragOver ? config.dropHighlightClass : ""}`}
    >
      {/* Column Header */}
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${config.headerColor}`} />
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {config.label}
          </h3>
          <span
            className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${config.countBadgeClass}`}
          >
            {tasks.length}
          </span>
        </div>

        {onAddTask && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:bg-background hover:text-foreground"
            onClick={() => onAddTask(status)}
            title={`Add task to ${config.label}`}
          >
            <Plus className="size-4" />
            <span className="sr-only">Add task to {config.label}</span>
          </Button>
        )}
      </div>

      {/* Drop indicator banner when dragging over */}
      {dragOver && (
        <div className="mb-3 rounded-lg border-2 border-dashed border-primary/50 bg-primary/10 py-2.5 text-center text-xs font-semibold text-primary transition-all">
          Drop here to set as {config.label}
        </div>
      )}

      {/* Task Cards List */}
      <div className="flex flex-1 flex-col gap-2.5">
        {tasks.map((task) => (
          <TaskKanbanCard
            key={task.id}
            task={task}
            isDragging={draggedTaskId === task.id}
            onDragStart={onCardDragStart}
            onDragEnd={onCardDragEnd}
            onView={onViewTask}
            onDelete={onDeleteTask}
            onStatusChange={onStatusChange}
          />
        ))}

        {/* Empty State */}
        {tasks.length === 0 && !dragOver && (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 p-6 text-center text-muted-foreground">
            <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
              <Inbox className="size-4 opacity-50" />
            </div>
            <p className="text-xs font-medium">No tasks in {config.label}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground/80">
              Drag tasks here or click + to create
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
