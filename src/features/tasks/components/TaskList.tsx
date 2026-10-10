import type { Task } from "@/features/tasks/types/task.types"

import TaskCard from "@/features/tasks/components/TaskCard"

interface TaskListProps {
  tasks: Task[]
  onView?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onStatusChange?: (task: Task) => void
}

export default function TaskList({
  tasks,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}