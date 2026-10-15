import { useState } from "react"

import type { Task, TaskStatus } from "@/features/tasks/types/task.types"
import TaskKanbanColumn from "./TaskKanbanColumn"

interface TaskKanbanBoardProps {
  tasks: Task[]
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void
  onViewTask?: (task: Task) => void
  onDeleteTask?: (task: Task) => void
  onAddTask?: (status: TaskStatus) => void
}

const KANBAN_STATUSES: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
]

export default function TaskKanbanBoard({
  tasks,
  onStatusChange,
  onViewTask,
  onDeleteTask,
  onAddTask,
}: TaskKanbanBoardProps) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)

  const handleCardDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("text/plain", task.id)
    e.dataTransfer.effectAllowed = "move"
    setDraggedTaskId(task.id)
  }

  const handleCardDragEnd = () => {
    setDraggedTaskId(null)
  }

  const handleDropTask = (taskId: string, targetStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    if (task.taskStatus !== targetStatus) {
      onStatusChange(taskId, targetStatus)
    }

    setDraggedTaskId(null)
  }

  // Group tasks by their status
  const tasksByStatus = KANBAN_STATUSES.reduce<Record<TaskStatus, Task[]>>(
    (acc, status) => {
      acc[status] = tasks.filter((task) => task.taskStatus === status)
      return acc
    },
    {
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
      CANCELLED: [],
    }
  )

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 items-start">
        {KANBAN_STATUSES.map((status) => (
          <TaskKanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
            draggedTaskId={draggedTaskId}
            onCardDragStart={handleCardDragStart}
            onCardDragEnd={handleCardDragEnd}
            onDropTask={handleDropTask}
            onViewTask={onViewTask}
            onDeleteTask={onDeleteTask}
            onStatusChange={onStatusChange}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </div>
  )
}
