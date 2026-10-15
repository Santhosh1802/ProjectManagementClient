import { CheckSquare, ListTodo, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { TaskScope } from "@/features/tasks/types/task.types"

interface TaskScopeTabsProps {
  value: TaskScope
  onChange: (value: TaskScope) => void
  showAll?: boolean
}

const scopeItems = [
  {
    value: "ALL" as const,
    label: "All Tasks",
    icon: ListTodo,
  },
  {
    value: "ASSIGNED_TO_ME" as const,
    label: "Assigned to Me",
    icon: CheckSquare,
  },
  {
    value: "CREATED_BY_ME" as const,
    label: "Created by Me",
    icon: UserRound,
  },
]

export default function TaskScopeTabs({
  value,
  onChange,
  showAll = true,
}: TaskScopeTabsProps) {
  const visibleItems = showAll 
    ? scopeItems 
    : scopeItems.filter(item => item.value !== "ALL")

  return (
    <div className="flex w-full overflow-x-auto border-b">
      <div className="flex min-w-max items-center gap-1">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = value === item.value

          return (
            <Button
              key={item.value}
              variant="ghost"
              onClick={() => {
                if (!active) {
                  onChange(item.value)
                }
              }}
              className={[
                "relative rounded-none px-3 py-2.5",
                "text-xs font-medium",
                "hover:bg-transparent",
                active
                  ? "text-primary"
                  : "text-muted-foreground",
              ].join(" ")}
            >
              <Icon className="size-4" />

              {item.label}

              {active && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent-foreground" />
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}