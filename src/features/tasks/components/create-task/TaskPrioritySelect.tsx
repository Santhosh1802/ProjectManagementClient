import { Flag } from "lucide-react"
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

interface TaskPrioritySelectProps {
  control: Control<CreateTaskFormValues>
  disabled?: boolean
}

const priorities = [
  {
    value: "LOW",
    label: "Low",
    description: "Can be handled when convenient.",
  },
  {
    value: "MEDIUM",
    label: "Medium",
    description: "Normal priority for the task.",
  },
  {
    value: "HIGH",
    label: "High",
    description: "Should be completed soon.",
  },
  {
    value: "URGENT",
    label: "Urgent",
    description: "Requires immediate attention.",
  },
] as const

export default function TaskPrioritySelect({
  control,
  disabled = false,
}: TaskPrioritySelectProps) {
  return (
    <Controller
      name="taskPriority"
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <label htmlFor="task-priority" className="text-sm font-medium">
            Priority
          </label>

          <Select
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger
              id="task-priority"
              aria-invalid={fieldState.invalid}
              className="w-full"
            >
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>

            <SelectContent>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  <div className="flex items-center gap-2">
                    <Flag className="size-4 text-muted-foreground" />

                    <div className="flex flex-col text-left">
                      <span>{priority.label}</span>

                      <span className="text-xs text-muted-foreground">
                        {priority.description}
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
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
