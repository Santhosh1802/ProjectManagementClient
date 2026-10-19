import {
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useMemo, useState } from "react"
import type { Control } from "react-hook-form"
import { Controller } from "react-hook-form"

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
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

interface AssigneeOption {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
}

interface AssigneeSelectProps {
  control: Control<CreateTaskFormValues>
  users: AssigneeOption[]
  loading?: boolean
  onSearch?: (keyword: string) => void
  disabled?: boolean
}

function getFullName(user: AssigneeOption) {
  return `${user.firstName} ${user.lastName}`.trim()
}

function getInitials(user: AssigneeOption) {
  return `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase()
}

export default function AssigneeSelect({
  control,
  users,
  loading = false,
  onSearch,
  disabled = false,
}: AssigneeSelectProps) {
  const [open, setOpen] = useState(false)

  const availableUsers = useMemo(
    () => users.filter((user) => user.isActive),
    [users],
  )

  return (
    <Controller
      name="assignedToId"
      control={control}
      render={({ field, fieldState }) => {
        const selectedUser = availableUsers.find(
          (user) => user.id === field.value,
        )

        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="task-assignee">
              Assignee
            </FieldLabel>

            <Popover
              open={open}
              onOpenChange={setOpen}
            >
              <PopoverTrigger>
                <Button
                  id="task-assignee"
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  aria-invalid={fieldState.invalid}
                  disabled={disabled}
                  className="w-full justify-between font-normal"
                >
                  {selectedUser ? (
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {getInitials(selectedUser)}
                      </div>

                      <div className="min-w-0 text-left">
                        <p className="truncate text-xs">
                          {getFullName(selectedUser)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      {disabled ? "Select a project first" : "Select an assignee"}
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
                  <CommandInput
                    placeholder="Search members..."
                    onValueChange={onSearch}
                  />

                  <CommandList>
                    {loading ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Searching members...
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          No active members found.
                        </CommandEmpty>

                        <CommandGroup>
                          {availableUsers.map((user) => {
                            const selected =
                              field.value === user.id

                            return (
                              <CommandItem
                                key={user.id}
                                value={`${getFullName(user)} ${user.email}`}
                                onSelect={() => {
                                  field.onChange(user.id)
                                  setOpen(false)
                                }}
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {getInitials(user)}
                                  </div>

                                  <div className="min-w-0">
                                    <p className="truncate font-medium">
                                      {getFullName(user)}
                                    </p>

                                    <p className="truncate text-xs text-muted-foreground">
                                      {user.email}
                                    </p>
                                  </div>
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
              Select the project member responsible for this task.
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