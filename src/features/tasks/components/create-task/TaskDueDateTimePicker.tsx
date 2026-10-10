import { CalendarDays } from "lucide-react"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"

import { DatePicker } from "@/components/ui/date-picker"

import type { CreateTaskFormValues } from "@/features/tasks/schema/task.schema"

interface TaskDueDateTimePickerProps {
  control: Control<CreateTaskFormValues>
  disabled?: boolean
  minDate?: string
  maxDate?: string
}

export default function TaskDueDateTimePicker({
  control,
  disabled = false,
  minDate,
  maxDate,
}: TaskDueDateTimePickerProps) {
  return (
    <Controller
      name="dueDate"
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <label
            htmlFor="task-due-date"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <CalendarDays className="size-4 text-muted-foreground" />
            Due date
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </label>

          <DatePicker
            value={field.value ?? ""}
            onChange={field.onChange}
            minDate={minDate}
            maxDate={maxDate}
            placeholder="Select due date"
            disabled={disabled}
          />

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