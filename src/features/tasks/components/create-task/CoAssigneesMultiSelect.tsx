import { useMemo, useState } from "react"
import { Check, ChevronsUpDown, Users, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface CoAssigneeOption {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
}

interface CoAssigneesMultiSelectProps {
  value: string[]
  onChange: (ids: string[]) => void
  users: CoAssigneeOption[]
  excludeUserId?: string
  loading?: boolean
  disabled?: boolean
  id?: string
}

function getFullName(user: CoAssigneeOption): string {
  return `${user.firstName} ${user.lastName}`.trim() || user.email
}

function getInitials(user: CoAssigneeOption): string {
  return `${user.firstName?.charAt(0) ?? ""}${user.lastName?.charAt(0) ?? ""}`.toUpperCase() || "?"
}

/**
 * Multi-select combobox for choosing additional co-assignees on a task,
 * automatically excluding the primary assignee.
 */
export default function CoAssigneesMultiSelect({
  value,
  onChange,
  users,
  excludeUserId,
  loading = false,
  disabled = false,
  id = "task-co-assignees",
}: CoAssigneesMultiSelectProps) {
  const [open, setOpen] = useState(false)

  const candidateUsers = useMemo(
    () => users.filter((user) => user.isActive && user.id !== excludeUserId),
    [users, excludeUserId]
  )

  const selectedUsers = useMemo(
    () =>
      value
        .filter((uid) => uid !== excludeUserId)
        .map((uid) => users.find((u) => u.id === uid))
        .filter((u): u is CoAssigneeOption => Boolean(u)),
    [value, excludeUserId, users]
  )

  const toggleUser = (userId: string) => {
    if (value.includes(userId)) {
      onChange(value.filter((existing) => existing !== userId))
    } else {
      onChange([...value, userId])
    }
  }

  return (
    <Field>
      <FieldLabel htmlFor={id}>Co-assignees (optional)</FieldLabel>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              disabled={disabled}
              className="w-full justify-between font-normal"
            >
              {selectedUsers.length > 0 ? (
                <span className="flex min-w-0 items-center gap-2 truncate text-xs font-medium">
                  <Users className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>
                    {selectedUsers.length} co-assignee
                    {selectedUsers.length === 1 ? "" : "s"} selected
                  </span>
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {disabled ? "Select a project first" : "Add co-assignees"}
                </span>
              )}

              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          }
        />

        <PopoverContent
          align="start"
          className="w-[--radix-popover-trigger-width] p-0"
        >
          <Command>
            <CommandInput placeholder="Search project members..." />

            <CommandList>
              {loading ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading members...
                </div>
              ) : (
                <>
                  <CommandEmpty>No eligible members found.</CommandEmpty>

                  <CommandGroup>
                    {candidateUsers.map((user) => {
                      const isSelected = value.includes(user.id)

                      return (
                        <CommandItem
                          key={user.id}
                          value={`${getFullName(user)} ${user.email}`}
                          onSelect={() => toggleUser(user.id)}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {getInitials(user)}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {getFullName(user)}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>

                          <Check
                            className={`ml-auto size-4 ${
                              isSelected ? "opacity-100" : "opacity-0"
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

      {selectedUsers.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedUsers.map((user) => {
            const name = getFullName(user)
            return (
              <Badge
                key={user.id}
                variant="secondary"
                className="gap-1 pr-1 font-normal"
              >
                <span className="max-w-[160px] truncate">{name}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((uid) => uid !== user.id))}
                    aria-label={`Remove ${name}`}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </Badge>
            )
          })}
        </div>
      )}

      <FieldDescription>
        Share ownership with additional project members who can collaborate and update status.
      </FieldDescription>
    </Field>
  )
}
