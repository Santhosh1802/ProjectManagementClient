import { useState } from "react"
import { submitFormOnModEnter } from "@/lib/keyboard"
import { AlertCircle, Loader2 } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DatePicker } from "@/components/ui/date-picker"

import { updateProjectDetails } from "@/features/projects/services/projects.services"

import type {
  Project,
  ProjectStatus,
} from "@/features/projects/types/project.types"

interface EditProjectModalProps {
  project: Project
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (project: Project) => void
}

const PROJECT_STATUSES: ProjectStatus[] = [
  "PLANNING",
  "ACTIVE",
  "COMPLETED",
  "ARCHIVED",
]

const editProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(5, "Project name must be between 5 and 50 characters.")
    .max(50, "Project name must be between 5 and 50 characters."),

  description: z
    .string()
    .trim()
    .min(10, "Project description must be between 10 and 200 characters.")
    .max(200, "Project description must be between 10 and 200 characters."),

  projectStatus: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ARCHIVED"]),

  dueDate: z
    .string()
    .min(1, "Due date is required.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please select a valid due date."),
})

type EditProjectFormValues = z.infer<typeof editProjectSchema>

function formatStatus(status: ProjectStatus) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function EditProjectModal({
  project,
  open,
  onOpenChange,
  onUpdated,
}: EditProjectModalProps) {
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<EditProjectFormValues>({
    resolver: zodResolver(editProjectSchema),

    mode: "onBlur",

    reValidateMode: "onChange",

    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      projectStatus: project.projectStatus,
      dueDate: project.dueDate ? project.dueDate.slice(0, 10) : "",
    },
  })

  async function onSubmit(values: EditProjectFormValues) {
    try {
      setSaving(true)
      setServerError(null)

      const updatedProject = await updateProjectDetails({
        id: project.id,
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        projectStatus: values.projectStatus,
        dueDate: new Date(`${values.dueDate}T23:59:59`).toISOString(),
      })

      onUpdated(updatedProject)
      onOpenChange(false)
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Failed to update project. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={saving ? undefined : onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Edit project
              </DialogTitle>

              <DialogDescription>
                Update the details and status of this project.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={submitFormOnModEnter}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            <div className="space-y-6">
              {serverError && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />

                  <AlertTitle>Unable to update project</AlertTitle>

                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              {/* Project name */}
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-project-name">
                      Project name
                    </FieldLabel>

                    <Input
                      {...field}
                      id="edit-project-name"
                      placeholder="Enter project name"
                      autoComplete="off"
                      autoFocus
                      minLength={5}
                      maxLength={50}
                      disabled={saving}
                      aria-invalid={fieldState.invalid}
                    />

                    <FieldDescription>
                      Choose a clear name between 5 and 50 characters.
                    </FieldDescription>

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Description */}
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="edit-project-description">
                      Description
                    </FieldLabel>

                    <Textarea
                      {...field}
                      id="edit-project-description"
                      placeholder="Describe the purpose of this project..."
                      rows={5}
                      minLength={10}
                      maxLength={200}
                      disabled={saving}
                      aria-invalid={fieldState.invalid}
                      className="resize-none"
                    />

                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <FieldDescription>
                        Provide a summary between 10 and 200 characters.
                      </FieldDescription>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {field.value?.length ?? 0}/200
                      </span>
                    </div>

                    {fieldState.error && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Status + Due date */}
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Status */}
                <Controller
                  name="projectStatus"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-project-status">
                        Project status
                      </FieldLabel>

                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={saving}
                      >
                        <SelectTrigger
                          id="edit-project-status"
                          className="w-full"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>

                        <SelectContent>
                          {PROJECT_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {formatStatus(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FieldDescription>
                        Current lifecycle stage of the project.
                      </FieldDescription>

                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Due date */}
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="edit-project-due-date">
                        Due date
                      </FieldLabel>

                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        disabled={saving}
                        placeholder="Select due date"
                      />

                      <FieldDescription>
                        Expected completion date for the project.
                      </FieldDescription>

                      {fieldState.error && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="shrink-0 flex-col-reverse gap-2 border-t bg-muted/20 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={saving || !isDirty}
              className="w-full sm:w-auto"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}

              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
