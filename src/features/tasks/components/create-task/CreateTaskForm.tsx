import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { submitFormOnModEnter, toAriaKeyShortcuts } from "@/lib/keyboard"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import AssigneeSelect from "@/features/tasks/components/create-task/AssigneeSelect"
import ProjectSelect from "@/features/tasks/components/create-task/ProjectSelect"
import TaskDueDateTimePicker from "@/features/tasks/components/create-task/TaskDueDateTimePicker"
import TaskPrioritySelect from "@/features/tasks/components/create-task/TaskPrioritySelect"
import TaskStatusSelect from "@/features/tasks/components/create-task/TaskStatusSelect"

import { createTaskSchema } from "@/features/tasks/schema/task.schema"
import type { CreateTaskFormValues } from "@/features/tasks/schema/task.schema"
import type { Task, TaskStatus } from "@/features/tasks/types/task.types"

interface CreateTaskFormProps {
  defaultProjectId?: string
  defaultStatus?: TaskStatus
  onCreated?: (task: Task) => void
  onCancel?: () => void

  projects?: Array<{
    id: string
    name: string
  }>

  users?: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    isActive: boolean
  }>

  projectsLoading?: boolean
  usersLoading?: boolean

  onProjectSearch?: (keyword: string) => void
  onUserSearch?: (keyword: string) => void

  onSubmitTask?: (
    values: CreateTaskFormValues,
  ) => Promise<Task>
}

export default function CreateTaskForm({
  defaultProjectId,
  defaultStatus,
  onCreated,
  onCancel,
  projects = [],
  users = [],
  projectsLoading = false,
  usersLoading = false,
  onProjectSearch,
  onUserSearch,
  onSubmitTask,
}: CreateTaskFormProps) {
  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      taskStatus: defaultStatus ?? "TODO",
      taskPriority: "MEDIUM",
      projectId: defaultProjectId ?? "",
      assignedToId: "",
      dueDate: null,
    },
  })

  const {
    formState: { isSubmitting, errors },
    reset,
    setValue,
    register,
  } = form

  useEffect(() => {
    if (!defaultProjectId) return

    setValue("projectId", defaultProjectId, {
      shouldValidate: true,
    })
  }, [defaultProjectId, setValue])

  useEffect(() => {
    if (!defaultStatus) return

    setValue("taskStatus", defaultStatus, {
      shouldValidate: true,
    })
  }, [defaultStatus, setValue])

  const handleSubmit = async (
    values: CreateTaskFormValues,
  ) => {
    if (!onSubmitTask) return

    try {
      const task = await onSubmitTask(values)

      onCreated?.(task)

      reset({
        title: "",
        description: "",
        taskStatus: defaultStatus ?? "TODO",
        taskPriority: "MEDIUM",
        projectId: defaultProjectId ?? "",
        assignedToId: "",
        dueDate: null,
      })
    } catch (error) {
      form.setError("root", {
        type: "server",
        message:
          error instanceof Error
            ? error.message
            : "Unable to create task.",
      })
    }
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      onKeyDown={submitFormOnModEnter}
      aria-keyshortcuts={toAriaKeyShortcuts(["mod", "Enter"])}
      className="space-y-6"
      noValidate
    >
      {errors.root?.message && (
        <Alert variant="destructive">
          <AlertTitle>Unable to create task</AlertTitle>

          <AlertDescription>
            {errors.root.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Task title */}
      <Field
        data-invalid={!!errors.title}
      >
        <FieldLabel htmlFor="task-title">
          Task title
        </FieldLabel>

        <Input
          id="task-title"
          placeholder="e.g. Implement authentication"
          autoComplete="off"
          disabled={isSubmitting}
          aria-invalid={!!errors.title}
          {...register("title")}
        />

        <FieldDescription>
          Give the task a clear and descriptive title.
        </FieldDescription>

        {errors.title && (
          <FieldError errors={[errors.title]} />
        )}
      </Field>

      {/* Description */}
      <Field
        data-invalid={!!errors.description}
      >
        <FieldLabel htmlFor="task-description">
          Description
        </FieldLabel>

        <Textarea
          id="task-description"
          placeholder="Describe what needs to be completed..."
          className="min-h-24 resize-y"
          disabled={isSubmitting}
          aria-invalid={!!errors.description}
          {...register("description")}
        />

        <FieldDescription>
          Optional. Provide additional information about the task.
        </FieldDescription>

        {errors.description && (
          <FieldError errors={[errors.description]} />
        )}
      </Field>

      {/* Project + Assignee */}
      <div className="grid gap-6 md:grid-cols-2">
        <ProjectSelect
          control={form.control}
          projects={projects}
          loading={projectsLoading}
          onSearch={onProjectSearch}
          disabled={isSubmitting}
        />

        <AssigneeSelect
          control={form.control}
          users={users}
          loading={usersLoading}
          onSearch={onUserSearch}
          disabled={isSubmitting}
        />
      </div>

      {/* Status + Priority */}
      <div className="grid gap-6 md:grid-cols-2">
        <TaskStatusSelect
          control={form.control}
          disabled={isSubmitting}
        />

        <TaskPrioritySelect
          control={form.control}
          disabled={isSubmitting}
        />
      </div>

      {/* Due date */}
      <TaskDueDateTimePicker
        control={form.control}
        disabled={isSubmitting}
      />

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 border-t pt-6 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create task"}
        </Button>
      </div>
    </form>
  )
}