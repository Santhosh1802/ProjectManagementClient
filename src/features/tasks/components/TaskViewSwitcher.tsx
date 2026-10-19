import { Kanban, LayoutGrid, List, Table2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import type { TaskView } from "@/features/tasks/types/task.types"

interface TaskViewSwitcherProps {
  value: TaskView
  onChange: (view: TaskView) => void
}

const views: {
  value: TaskView
  label: string
  icon: typeof LayoutGrid
}[] = [
  {
    value: "kanban",
    label: "Kanban board",
    icon: Kanban,
  },
  {
    value: "card",
    label: "Card view",
    icon: LayoutGrid,
  },
  {
    value: "list",
    label: "List view",
    icon: List,
  },
  {
    value: "table",
    label: "Table view",
    icon: Table2,
  },
]

export default function TaskViewSwitcher({
  value,
  onChange,
}: TaskViewSwitcherProps) {
  return (
    <div className="flex h-7.5 items-center rounded-md border bg-background p-0.5">
      {views.map((view) => {
        const Icon = view.icon
        const isActive = value === view.value

        return (
          <Tooltip key={view.value}>
            <TooltipTrigger render={
              <Button
                type="button"
                variant={isActive ? "secondary" : "ghost"}
                size="icon"
                className="size-6.5"
                aria-label={view.label}
                aria-pressed={isActive}
                onClick={() => onChange(view.value)}
              >
                <Icon className="size-3.5" />
              </Button>
            } />

            <TooltipContent>
              {view.label}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}