import {
  CheckCircle2,
  Circle,
  CircleOff,
  LoaderCircle,
} from "lucide-react"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { CreateTaskFormValues } from "@/features/tasks/schema/task.schema"

interface TaskStatusSelectProps {
  control: Control<CreateTaskFormValues>
  disabled?: boolean
}

const statuses = [
  {
    value: "TODO",
    label: "To Do",
    description: "Task has not started yet.",
    icon: Circle,
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
    description: "Task is currently being worked on.",
    icon: LoaderCircle,
  },
  {
    value: "DONE",
    label: "Completed",
    description: "Task has been completed.",
    icon: CheckCircle2,
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
    description: "Task is no longer active.",
    icon: CircleOff,
  },
] as const

export default function TaskStatusSelect({
  control,
  disabled = false,
}: TaskStatusSelectProps) {
  return (
    <Controller
      name="taskStatus"
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <label
            htmlFor="task-status"
            className="text-sm font-medium"
          >
            Status
          </label>

          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id="task-status"
              aria-invalid={fieldState.invalid}
              className="w-full"
            >
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              {statuses.map((status) => {
                const Icon = status.icon

                return (
                  <SelectItem
                    key={status.value}
                    value={status.value}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-muted-foreground" />

                      <div className="flex flex-col text-left">
                        <span>{status.label}</span>

                        <span className="text-xs text-muted-foreground">
                          {status.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>

          {fieldState.error?.message && (
            <p className="text-sm font-medium text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  )
}