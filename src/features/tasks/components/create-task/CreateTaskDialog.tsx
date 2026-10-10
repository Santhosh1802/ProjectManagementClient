import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import CreateTaskForm from "@/features/tasks/components/create-task/CreateTaskForm"
import type { Task } from "@/features/tasks/types/task.types"

interface CreateTaskDialogProps {
  onCreated?: (task: Task) => void
  defaultProjectId?: string
}

export default function CreateTaskDialog({
  onCreated,
  defaultProjectId,
}: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)

  const handleCreated = (task: Task) => {
    onCreated?.(task)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger>
        <Button type="button">
          <Plus className="mr-2 size-4" />
          Create task
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>

          <DialogDescription>
            Create a task, assign it to a project member, and set its
            priority and due date.
          </DialogDescription>
        </DialogHeader>

        <CreateTaskForm
          defaultProjectId={defaultProjectId}
          onCreated={handleCreated}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}