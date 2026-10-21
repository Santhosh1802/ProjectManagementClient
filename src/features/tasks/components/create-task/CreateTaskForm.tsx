import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useMemo, useRef } from "react"
import { useForm, useWatch } from "react-hook-form"
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
import { useProjectDetailQuery, useProjectMembersQuery } from "@/features/projects/hooks/useProjectsQuery"

interface CreateTaskFormProps {
  defaultProjectId?: string
  defaultStatus?: TaskStatus
  onCreated?: (task: Task) => void
  onCancel?: () => void

  projects?: Array<{
    id: string
    name: string
  }>

  projectsLoading?: boolean
  onProjectSearch?: (keyword: string) => void

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
  projectsLoading = false,
  onProjectSearch,
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
      dueDate: "",
    },
  })

  const {
    formState: { isSubmitting, errors },
    reset,
    setValue,
    register,
    control,
  } = form

  const selectedProjectId = useWatch({
    control,
    name: "projectId",
  })

  const prevProjectIdRef = useRef(selectedProjectId)

  // Fetch project members and project detail (owner) for the selected project
  const {
    data: projectDetail,
    isLoading: isProjectDetailLoading,
  } = useProjectDetailQuery(selectedProjectId, {
    enabled: Boolean(selectedProjectId),
  })

  const {
    data: membersData,
    isLoading: isMembersLoading,
  } = useProjectMembersQuery(
    { projectId: selectedProjectId || "", page: 0, size: 100 },
    { enabled: Boolean(selectedProjectId) }
  )

  // Derive assignable users exclusively from the selected project (owner + members)
  const projectAssignees = useMemo(() => {
    if (!selectedProjectId) {
      return []
    }

    const memberMap = new Map<
      string,
      {
        id: string
        firstName: string
        lastName: string
        email: string
        isActive: boolean
      }
    >()

    // Add project owner
    if (projectDetail?.owner) {
      memberMap.set(projectDetail.owner.id, {
        id: projectDetail.owner.id,
        firstName: projectDetail.owner.firstName,
        lastName: projectDetail.owner.lastName,
        email: projectDetail.owner.email,
        isActive: true,
      })
    }

    // Add project members
    if (membersData?.content) {
      for (const m of membersData.content) {
        if (m.user && !memberMap.has(m.user.id)) {
          memberMap.set(m.user.id, {
            id: m.user.id,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            email: m.user.email,
            isActive: m.user.isActive ?? true,
          })
        }
      }
    }

    return Array.from(memberMap.values())
  }, [selectedProjectId, projectDetail, membersData])

  // Reset assignee when selected project changes
  useEffect(() => {
    if (prevProjectIdRef.current !== selectedProjectId) {
      if (prevProjectIdRef.current) {
        setValue("assignedToId", "", { shouldValidate: false })
      }
      prevProjectIdRef.current = selectedProjectId
    }
  }, [selectedProjectId, setValue])

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
        dueDate: "",
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
          maxLength={100}
          aria-invalid={!!errors.title}
          {...register("title")}
        />

        <FieldDescription>
          Give the task a title between 1 and 100 characters.
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
          minLength={10}
          maxLength={300}
          aria-invalid={!!errors.description}
          {...register("description")}
        />

        <FieldDescription>
          Provide description between 10 and 300 characters.
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
          users={projectAssignees}
          loading={isProjectDetailLoading || isMembersLoading}
          disabled={isSubmitting || !selectedProjectId}
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
        minDate={projectDetail?.startDate ? projectDetail.startDate.split("T")[0] : undefined}
        maxDate={projectDetail?.dueDate ? projectDetail.dueDate.split("T")[0] : undefined}
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