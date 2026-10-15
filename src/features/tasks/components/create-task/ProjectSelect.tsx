import { Check, ChevronsUpDown, FolderKanban, Search } from "lucide-react"
import { useState } from "react"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type { CreateTaskFormValues } from "@/features/tasks/schema/task.schema"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";

interface ProjectOption {
  id: string
  name: string
}

interface ProjectSelectProps {
  control: Control<CreateTaskFormValues>
  projects: ProjectOption[]
  loading?: boolean
  onSearch?: (keyword: string) => void
  disabled?: boolean
}

export default function ProjectSelect({
  control,
  projects,
  loading = false,
  onSearch,
  disabled = false,
}: ProjectSelectProps) {
  const [open, setOpen] = useState(false)

  return (
    <Controller
      name="projectId"
      control={control}
      render={({ field, fieldState }) => {
        const selectedProject = projects.find(
          (project) => project.id === field.value,
        )

        return (
          <Field>
            <FieldLabel
              htmlFor="task-project"
              className="text-xs font-medium"
            >
              Project
            </FieldLabel>

            <Popover
              open={open}
              onOpenChange={setOpen}
            >
              <PopoverTrigger>
                <Button
                  id="task-project"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={fieldState.invalid}
                  disabled={disabled}
                  className="w-full justify-between font-normal"
                >
                  {selectedProject ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <FolderKanban className="size-4 text-primary" />
                      </div>

                      <span className="truncate">
                        {selectedProject.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Select a project
                    </span>
                  )}

                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="w-[--radix-popover-trigger-width] p-0"
              >
                <Command>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 size-4 shrink-0 text-muted-foreground" />

                    <CommandInput
                      placeholder="Search projects..."
                      onValueChange={onSearch}
                    />
                  </div>

                  <CommandList>
                    {loading ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Searching projects...
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          No projects found.
                        </CommandEmpty>

                        <CommandGroup>
                          {projects.map((project) => {
                            const selected =
                              field.value === project.id

                            return (
                              <CommandItem
                                key={project.id}
                                value={project.name}
                                onSelect={() => {
                                  field.onChange(project.id)
                                  setOpen(false)
                                }}
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                                    <FolderKanban className="size-4 text-muted-foreground" />
                                  </div>

                                  <span className="truncate">
                                    {project.name}
                                  </span>
                                </div>

                                <Check
                                  className={`ml-auto size-4 ${
                                    selected
                                      ? "opacity-100"
                                      : "opacity-0"
                                  }`}
                                />
                              </CommandItem>
                            )
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FieldDescription>
              Select the project the task you want to create.
            </FieldDescription>

            {fieldState.error && (
              <FieldError errors={[fieldState.error]} />
            )}
          </Field>
        )
      }}
    />
  )
}